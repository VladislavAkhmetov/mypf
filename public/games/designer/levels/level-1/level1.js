/* =========================================================
   Уровень 1 — Самвел и шаурма.
   Только сценарий: вся механика — в js/engine.js.
   ========================================================= */
(() => {
  const E = Engine;
  const { $, wait } = E;

  E.loadSounds({ push: 0.7, message: 0.6, sent: 0.6, cash: 0.8, fail: 0.7, ding: 0.9 });

  const state = { money: 48, food: 0 };

  /* ---------- Интро: start-1 -> переход -> start-2 ---------- */
  const intro = $('intro'), v1 = $('introVideo'), v2 = $('introVideo2');
  const start = $('start'), skip = $('introSkip'), ad = $('ad'), adMoney = $('adMoney');
  let shot = 0;

  $('playBtn').addEventListener('click', () => {
    E.haptic.medium();
    E.unlock();
    // Разрешаем звук для v2 внутри жеста пользователя
    try {
      v2.removeAttribute('muted');
      v2.muted = false;
      const p2 = v2.play();
      if (p2 && p2.then) {
        p2.then(() => {
          v2.pause();
          v2.currentTime = 0;
        }).catch(() => {});
      }
    } catch (e) {}
    start.classList.add('is-gone');
    skip.hidden = false;
    playShot1();
  });

  function playShot1() {
    shot = 1;
    ad.classList.add('is-playing');
    // «300 000 ₽» набегает, когда строка выехала
    setTimeout(() => shot === 1 && E.countUp(adMoney, 300000, { dur: 1300, power: 4 }), 1700);
    E.play(v1);
  }

  function playShot2() {
    if (shot === 2) return;
    shot = 2;
    ad.classList.add('is-out');
    v1.classList.add('is-fading');
    v2.classList.add('is-in');
    v2.removeAttribute('muted');
    v2.muted = false;
    E.play(v2);
    setTimeout(() => { if (shot === 2) v1.pause(); }, 500);
  }

  // Переход на Шот 2 в конце Шот 1 (видеоряд start-1 заканчивается на ~8.9с)
  v1.addEventListener('timeupdate', () => {
    if (shot === 1 && v1.currentTime >= 8.9) {
      playShot2();
    }
  });
  v1.addEventListener('ended', () => { if (shot === 1) playShot2(); });
  v2.addEventListener('ended', () => { if (shot === 2) toChannel(); });
  skip.addEventListener('click', () => {
    E.haptic.tap();
    if (shot === 1) {
      v2.removeAttribute('muted');
      v2.muted = false;
      playShot2();
    } else {
      toChannel();
    }
  });

  /* ---------- Канал курса ---------- */
  const channelScreen = $('chatA'), samvelScreen = $('chatB');
  const channel = E.chat(channelScreen), samvel = E.chat(samvelScreen);
  const tgBottom = $('tgBottom'), sendAll = $('sendAll');

  async function toChannel() {
    if (shot === 0) return;
    shot = 0;
    skip.hidden = true;
    E.prefetch(['samvel-start.mp4']);
    channelScreen.classList.add('is-active');
    intro.classList.add('is-leaving');
    await wait(500);
    v1.pause();
    v2.pause();
    intro.classList.remove('is-active');

    // Канал: посты просто появляются, без «печатает…»
    await wait(700);
    channel.bubble('in', 'Поздравляю! Ты прошёл курс <b>ДИЗАЙН-БОГ</b>');
    await wait(1200);
    channel.bubble('in', 'Домашка: разошли всем «Делаю дизайн». Кто-нибудь клюнет');
    await wait(500);
    tgBottom.classList.remove('is-hidden');
  }

  let mailed = false;
  sendAll.addEventListener('click', async () => {
    if (mailed) return;
    mailed = true;
    E.haptic.medium();
    E.unlockNote('samvel-start.mp4');
    E.sfx('sent');
    await E.progressButton(sendAll, { total: 142 });
    E.haptic.success();
    await wait(400);
    tgBottom.classList.add('is-hidden');

    await wait(300);
    E.push({ title: 'Бывшая', text: 'Удали мой номер', av: 'av-violet' });
    await wait(1100);
    E.push({ title: 'Игорь хозяин кв.', text: 'Дизайнер, за квартиру когда заплатишь? Уже 3 дня просрочил', av: 'av-gray' });
    await wait(1100);
    E.push({ title: 'Бабуля', text: 'Внучек, что такое дизайн? Приходи, я пирогов напекла', av: 'av-green' });
    await wait(1300);
    E.push({
      title: 'Самвел · Шаурма 24',
      text: 'Видеосообщение',
      av: 'av-red',
      ttl: 0,
      onTap: () => {
        E.unlockNote('samvel-start.mp4');
        openSamvel();
      }
    });
    await wait(1800);
    openSamvel();
  });

  /* ---------- Чат с Самвелом ---------- */
  let samvelOpened = false;
  async function openSamvel() {
    if (samvelOpened) return;
    samvelOpened = true;
    E.prefetch(['samvel-victory.mp4', 'samvel-fail.mp4', 'mihalych.mp4']);
    E.haptic.tap();
    E.clearPushes();
    E.pushScreen(channelScreen, samvelScreen);
    await wait(600);
    await samvel.status('записывает видео…', 900);
    const brief = samvel.note();
    await wait(450);
    await E.playNote(brief, 'samvel-start.mp4');
    pickLoop();
  }

  const SAMVEL = { letter: 'С', av: 'av-red' };
  const signOf = (choice) => $('sheet').querySelector(`.frame[data-choice="${choice}"] .sign`);

  async function pickLoop() {
    for (;;) {
      const choice = await E.choose($('sheet'));
      await samvel.photo(signOf(choice));
      await samvel.status('записывает видео…', 1300);
      const answer = samvel.note();
      await wait(450);
      const win = choice === 'lux';
      await E.playNote(answer, win ? 'samvel-victory.mp4' : 'samvel-fail.mp4');

      if (win) {
        state.money += 1000;
        state.food += 2;
        E.result({
          node: signOf(choice), win: true, amount: 1000, avatar: SAMVEL,
          comment: 'Вах! По-дубайски!',
          button: 'Дальше',
          onButton: async () => {
            E.unlockNote('mihalych.mp4');
            await E.closeResult();
            if (window.startLevel2) {
              window.startLevel2(state);
            } else {
              E.toast('Михалыч из автосервиса — скоро');
            }
          },
        });
        setTimeout(() => E.push({ title: 'Т-Банк', text: '+1 000 ₽ от Самвела А.', av: 'av-yellow', letter: 'Т', ttl: 3200, sound: 'ding' }), 1300);
        return;
      }

      await new Promise((retry) => E.result({
        node: signOf(choice), win: false, avatar: SAMVEL,
        comment: 'Это что, музей? Где мясо?!',
        button: 'Переделать',
        onButton: retry,
      }));
      await E.closeResult();
    }
  }
})();
