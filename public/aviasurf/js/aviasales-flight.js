/* The departure clock uses active real time, independently of surf slow motion. */
class FlightRun {
  constructor(duration=45){this.duration=duration;this.reset();}
  reset(){this.elapsed=0;this.entryTime=null;this.remainingAtEntry=null;}
  get locked(){return this.entryTime!==null;}
  get remaining(){return this.locked?this.remainingAtEntry:Math.max(0,this.duration-this.elapsed);}
  advance(seconds){if(!this.locked&&Number.isFinite(seconds)&&seconds>0)this.elapsed=Math.min(this.duration,this.elapsed+seconds);}
  lock(time,passport){if(this.locked||!Number.isFinite(time)||time<0||time>=this.duration||passport<=1e-8)return false;this.elapsed=this.entryTime=time;this.remainingAtEntry=this.duration-time;return true;}
  failure(passport){return passport<=1e-8?'soaked':!this.locked&&this.remaining<=1e-8?'departed':null;}
  static time(seconds){const n=Math.max(0,Math.ceil(seconds));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
}

class AviasalesFlight {
  constructor(game){
    this.game=game;this.run=new FlightRun(41);
    game.container.classList.add('aviasales-game');
    if(!document.getElementById('flight-styles')){
      const css=document.createElement('link');css.id='flight-styles';css.rel='stylesheet';css.href='css/aviasales.css';document.head.append(css);
    }
    this.ticket=document.createElement('div');this.ticket.className='flight-ticket';
    this.ticket.innerHTML='<span class="flight-label">КАТЕР УЙДЁТ ЧЕРЕЗ</span><strong id="flight-timer" role="timer" aria-live="off" aria-label="До отправления катера">01:00</strong><span class="flight-distance">ДО ТРАМПЛИНА <b id="flight-distance">1 260 м</b></span>';
    document.getElementById('hud').insertBefore(this.ticket,document.getElementById('pause-button'));
    this.timer=this.ticket.querySelector('#flight-timer');this.distance=this.ticket.querySelector('#flight-distance');
    this.status=document.createElement('p');this.status.className='flight-announcement';this.status.setAttribute('role','status');this.status.setAttribute('aria-live','polite');game.container.append(this.status);
    if(game.debugMode){this.debug=document.createElement('output');this.debug.className='flight-debug';game.container.append(this.debug);}
    this.reset();
  }
  get remaining(){return this.run.remaining;}
  get displayRemaining(){return this.remaining*60/this.run.duration;}
  failure(){return this.run.failure(this.game.mug.level);}
  reset(){
    this.run.reset();this.result=null;this.landingQuality=null;this.warningSecond=null;this.lowPassportWarned=false;this.waterloggedWarned=false;
    if(this.status)this.status.textContent='';
    this.render();
  }
  preloadArt(){
    if(this.artPreloaded)return;this.artPreloaded=true;
    for(const src of ['comic-passport-soaked-aviasales.webp','comic-boat-departing-aviasales.webp']){
      const image=new Image();image.fetchPriority='low';image.src='assets/comics/'+src;
    }
  }
  advance(seconds){
    if(this.game.state!=='playing'||this.result||this.run.locked)return;
    const previous=this.displayRemaining;this.run.advance(seconds);
    const second=Math.ceil(this.displayRemaining);
    if(second<=10&&second>0&&second!==this.warningSecond){
      this.warningSecond=second;
      this.game.audio.playDepartureTick?.(second);
      if(previous>10)this.status.textContent='Катер отходит через 10 секунд!';
    }
    this.render();
  }
  checkEnd(){
    if(this.game.state!=='playing'||this.run.locked)return false;
    const reason=this.failure();
    if(reason){this.game.finish(this.game.elapsed,reason);return true;}
    return false;
  }
  render(){
    if(!this.timer)return;
    const g=this.game,passport=Math.max(0,Math.ceil(g.mug.level*100));
    this.timer.textContent=FlightRun.time(this.displayRemaining);
    this.timer.setAttribute('aria-label',this.run.locked?'Запас времени при въезде на трамплин':'До отправления катера');
    this.ticket.querySelector('.flight-label').textContent=this.run.locked?'УСПЕЛ ДО ОТПРАВЛЕНИЯ':'КАТЕР УЙДЁТ ЧЕРЕЗ';
    const line=this.ticket.querySelector('.flight-distance');line.firstChild.textContent=this.run.locked?'ПОПАДИ НА КОРМУ ':'ДО ТРАМПЛИНА ';
    this.distance.textContent=Math.max(0,Math.ceil(g.distance-(g.p?.z||0))).toLocaleString('ru-RU')+' м';
    this.distance.hidden=this.run.locked;
    if(this.debug)this.debug.textContent='Кадр '+Math.round((this.frameSeconds||0)*1000)+' мс · физика '+g.elapsed.toFixed(1)+' с · таймер '+this.run.elapsed.toFixed(1)+' с';
    this.ticket.dataset.urgency=this.run.locked?'locked':this.displayRemaining<=10?'critical':this.displayRemaining<=20?'warning':'normal';
    const ticket=g.container.querySelector('.passport-ticket')||g.container.querySelector('.beer-ticket');
    ticket?.setAttribute('aria-label','Сухость паспорта '+passport+' процентов');
    if(ticket)ticket.dataset.condition=passport<=20?'critical':passport<=40?'warning':'normal';
    if(passport<=40&&!this.waterloggedWarned&&g.state==='playing'){
      this.waterloggedWarned=true;this.status.textContent='Чемодан намок! Доска теряет ход.';
    }
    if(passport<=20&&!this.lowPassportWarned&&g.state==='playing'){
      this.lowPassportWarned=true;this.status.textContent='Паспорт почти промок. При нуле заезд закончится.';
    }
  }
  complete(result){
    const g=this.game,success=result.outcome==='victory',soaked=result.reason==='soaked',missed=result.reason==='missed_boat';this.result=result;
    const screen=document.getElementById('result-screen');screen.dataset.reason=result.reason||'arrived';
    document.getElementById('result-title').textContent=success?'УСПЕЛ НА КАТЕР!':soaked?'ПАСПОРТ НАМОК':missed?'МИМО КАТЕРА':'КАТЕР УШЁЛ';
    document.getElementById('result-comment').textContent=success?'Следующая остановка — аэропорт.':soaked?'Весь промок. Придётся начать заново.':missed?'До трамплина успел. С посадкой не получилось.':'До трамплина оставалось '+Math.max(0,Math.ceil(g.distance-g.p.z)).toLocaleString('ru-RU')+' м. Попробуем ещё раз?';
    screen.querySelector('.eyebrow').textContent=success?'ПОСАДКА ПОДТВЕРЖДЕНА':'ЗАЕЗД ОКОНЧЕН';
    const art=document.getElementById('result-scene');
    art.src='assets/comics/'+(success?'comic-boarding-aviasales.webp':soaked?'comic-passport-soaked-aviasales.webp':'comic-boat-departing-aviasales.webp');
    art.alt=success?'Макс с чемоданом и паспортом поднимается на катер':soaked?'Расстроенный Макс по шею в море держится за доску с мокрым паспортом':'Катер отходит от пирса, Макс не успел на посадку';
    document.getElementById('result-art').setAttribute('aria-label',art.alt);
    document.getElementById('result-stamp').hidden=true;
    const metric=document.getElementById('result-beer-bonus');
    metric.previousElementSibling.textContent=success?'ЗАПАС ВРЕМЕНИ':'ПРОШЛО ВРЕМЕНИ';
    metric.textContent=FlightRun.time(success?(this.run.remainingAtEntry??this.remaining):this.run.elapsed);
    screen.querySelector('.duel-results').setAttribute('aria-label','Сухость паспорта и время заезда');
    document.getElementById('replay-button').setAttribute('aria-label',success?'Ещё один заезд':'Попробовать ещё раз');
    this.render();
    if(this.status)this.status.textContent=success?'Ты успел на катер.':soaked?'Паспорт полностью промок. Заезд окончен.':missed?'Промах мимо катера. Заезд окончен.':'Катер ушёл. Заезд окончен.';
  }
}
if(typeof window!=='undefined'){window.FlightRun=FlightRun;window.AviasalesFlight=AviasalesFlight;}
if(typeof module!=='undefined'&&module.exports)module.exports={FlightRun};
