/* Two authored panels explain the action and its consequence. */
const AVIASALES_ENDINGS={
  landed_clean:{title:'НА БОРТУ!',comment:'Чистая посадка',line:'Ваян: «В следующий раз — через трап!»',dialogue:['В следующий раз —\nчерез трап!','Паспорт сухой.\nОстальное высохнет.'],caption:'Курс — на аэропорт.',frames:['landed-deck-v3','onboard-pov-v2'],alts:['Макс уже приземлился на открытой кормовой палубе: обе стопы стоят на доске, которая целиком лежит на палубе. Ваян подстраховывает его рукой.','Вид глазами Макса: в руке сухой паспорт, рядом чемодан и доска. Впереди Ваян у штурвала, за бортом бухта.']},
  landed_edge:{title:'ЕЛЕ УСПЕЛ!',comment:'Ваян подстраховал',line:'Ваян: «В следующий раз — через трап!»',dialogue:['В следующий раз —\nчерез трап!','Паспорт сухой.\nОстальное высохнет.'],caption:'Курс — на аэропорт.',frames:['landed-deck-v3','onboard-pov-v2'],alts:['Макс уже приземлился на открытой кормовой палубе: обе стопы стоят на доске, которая целиком лежит на палубе. Ваян подстраховывает его рукой.','Вид глазами Макса: сухой паспорт в руке, чемодан под коленями, впереди капитан и синее море.']},
  timeout:{title:'НЕ УСПЕЛ',comment:'Катер ушёл раньше, чем ты добрался до трамплина.',line:'Макс: «Ваян?..»',frames:['timeout-boat','timeout-max'],alts:['Катер уходит по бухте, оставляя длинный след.','Макс остался на доске с чемоданом и паспортом и смотрит вслед катеру.']},
  soaked:{title:'ПАСПОРТ НАМОК',comment:'Паспорт полностью промок. Заезд окончен.',line:'Макс: «Ну вот…»',frames:['passport-detail','existing-soaked'],alts:['Крупный план мокрого паспорта на синей доске под рукой Макса.','Расстроенный Макс по шею в море держится за доску с мокрым паспортом.']},
  missed_boat:{title:'МИМО КАТЕРА',comment:'До трамплина успел. С посадкой не получилось.',line:'Макс: «Почти…»',frames:['miss-contact','miss-aftermath'],alts:['Макс промахивается мимо кормы; руки героя и капитана не достают друг до друга.','Макс в воде у доски с мокрым паспортом, катер удаляется позади.']}
};
class AviasalesEnding {
  constructor(game){
    this.game=game;this.version=0;
    this.screen=document.createElement('section');this.screen.className='flight-ending hidden';this.screen.setAttribute('aria-label','Финал истории');this.screen.setAttribute('role','dialog');this.screen.setAttribute('aria-modal','true');
    this.screen.innerHTML='<div class="ending-status"><span class="ending-passport"></span><strong class="ending-clock"></strong><span class="ending-label"></span></div><div class="ending-heading"><span class="ending-counter"></span><h2></h2></div><div class="ending-comic" role="group" aria-label="Эпилог в двух кадрах"><figure class="ending-panel ending-panel-action"><img decoding="async"><p class="ending-bubble ending-speech"></p><img class="ending-title-art" decoding="async" alt="" hidden><figcaption></figcaption></figure><figure class="ending-panel ending-panel-pov ending-detail-frame"><img class="ending-detail" decoding="async"><p class="ending-bubble ending-thought"></p></figure></div><p class="ending-line"></p><button class="yellow-button" type="button">ЕЩЁ ЗАЕЗД ↻</button>';
    this.art=this.screen.querySelector('img');this.detailFrame=this.screen.querySelector('.ending-detail-frame');this.detail=this.screen.querySelector('.ending-detail');this.button=this.screen.querySelector('button');
    this.screen.querySelector('h2').id='flight-ending-title';this.screen.setAttribute('aria-labelledby','flight-ending-title');
    this.button.addEventListener('click',()=>{if(performance.now()<this.readyAt)return;this.next();});
    game.container.append(this.screen);this.preload();
  }
  static key(result){return result.reason==='departed'?'timeout':result.reason==='soaked'?'soaked':result.reason==='missed_boat'?'missed_boat':result.landingQuality||'landed_clean';}
  static file(frame){return 'assets/comics/'+(frame==='existing-soaked'?'comic-passport-soaked-aviasales.webp':'comic-finale-'+frame+'-aviasales.webp');}
  preload(){for(const data of Object.values(AVIASALES_ENDINGS))for(const frame of data.frames){const img=new Image();img.fetchPriority='low';img.src=AviasalesEnding.file(frame);}}
  reset(){this.version++;this.active=false;this.screen.classList.add('hidden');this.game.container.classList.remove('ending-open');}
  begin(result){
    this.active=true;this.index=0;this.key=AviasalesEnding.key(result);this.data=AVIASALES_ENDINGS[this.key];this.result=result;
    const g=this.game;this.screen.classList.remove('hidden');g.container.classList.add('ending-open');document.getElementById('result-screen').classList.add('hidden');
    this.screen.querySelector('.ending-passport').textContent='ПАСПОРТ '+result.max+'%';
    this.screen.querySelector('.ending-clock').textContent=FlightRun.time(g.flight.remaining);
    this.screen.querySelector('.ending-label').textContent=g.flight.run.locked?'КАТЕР ОТПРАВИЛСЯ':'ЗАЕЗД ОКОНЧЕН';
    document.getElementById('result-title').textContent=this.data.title;document.getElementById('result-comment').textContent=this.data.comment;
    const image=document.getElementById('result-scene');image.src=AviasalesEnding.file(this.data.frames[1]);image.alt=this.data.alts[1];
    document.getElementById('result-art').setAttribute('aria-label',image.alt);
    document.getElementById('result-crab-line').textContent=this.data.line;
    const metric=document.getElementById('result-beer-bonus');metric.previousElementSibling.textContent=g.flight.run.locked?'ДО ТРАМПЛИНА':'ВРЕМЯ ЗАЕЗДА';metric.textContent=(g.flight.run.entryTime??g.flight.run.elapsed).toFixed(1).replace('.',',')+' с';
    document.getElementById('result-screen').dataset.reason=this.key;
    document.getElementById('result-screen').querySelector('.eyebrow').textContent=(result.outcome==='victory'?'ПОСАДКА ПОДТВЕРЖДЕНА':'ЗАЕЗД ОКОНЧЕН')+' · '+FlightRun.time(g.flight.remaining);
    this.show();
  }
  show(){
    const version=++this.version,data=this.data;
    this.screen.dataset.panel='combined';this.screen.dataset.outcome=this.key;
    this.screen.dataset.layout=data.dialogue?'comic':this.key==='timeout'?'timeout':'result';
    const titleArt=this.screen.querySelector('.ending-title-art');
    titleArt.hidden=this.key!=='timeout';
    if(!titleArt.hidden){titleArt.src='assets/comics/ending-timeout-title-v1.webp';titleArt.alt='НЕ УСПЕЛ';}
    this.screen.querySelector('h2').textContent=data.title;
    this.screen.querySelector('.ending-counter').textContent=this.result.outcome==='victory'?'ЭПИЛОГ · БУХТА ПХУКЕТ':'ЗАЕЗД ОКОНЧЕН';
    this.art.hidden=false;this.detailFrame.hidden=false;
    this.art.alt=data.alts[0];this.detail.alt=data.alts[1];
    this.art.src=AviasalesEnding.file(data.frames[0]);this.detail.src=AviasalesEnding.file(data.frames[1]);
    this.art.onerror=()=>{if(this.version===version)this.screen.querySelector('figcaption').textContent=data.alts[0];};
    this.detail.onerror=()=>{if(this.version===version)this.detail.alt=data.alts[1];};
    this.screen.querySelector('figcaption').textContent='';
    this.screen.querySelector('.ending-line').textContent=data.caption||data.line;
    this.screen.querySelectorAll('.ending-bubble').forEach((bubble,i)=>{
      bubble.textContent=data.dialogue?.[i]||'';bubble.hidden=!data.dialogue?.[i];
      bubble.setAttribute('aria-label',(i?'Макс: ':'Ваян: ')+(data.dialogue?.[i]||''));
    });
    this.screen.querySelector('.ending-label').textContent=data.comment;
    this.screen.querySelector('.ending-clock').textContent=(this.game.flight.run.entryTime??this.game.flight.run.elapsed).toFixed(1).replace('.',',')+' с';
    this.screen.querySelector('.ending-clock').setAttribute('aria-label','Время заезда');
    this.button.textContent='ЕЩЁ ЗАЕЗД ↻';this.readyAt=performance.now()+400;this.button.focus({preventScroll:true});
    this.screen.classList.remove('panel-enter');void this.screen.offsetWidth;this.screen.classList.add('panel-enter');
  }
  next(){
    if(!this.active)return;
    this.reset();this.game.start(false);
  }
}
if(typeof window!=='undefined')window.AviasalesEnding=AviasalesEnding;
