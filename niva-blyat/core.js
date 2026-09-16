'use strict';
var canvas=document.getElementById('game');
var ctx=canvas.getContext('2d');
var W=960,H=540,GROUND=438,CAR_X=250;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
var rand=function(a,b){return a+Math.random()*(b-a);};
var pick=function(a){return a[(Math.random()*a.length)|0];};
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v===null?d:(+v||0);}catch(e){return d;}},set:function(k,v){try{localStorage.setItem(k,String(v));}catch(e){}}};

var state='title',last=0,elapsed=0,distance=0,best=store.get('nivaDoomerBest',0),score=0,bestScore=store.get('nivaDoomerScore',0);
var speed=195,spawnTimer=0,obstacles=[],particles=[],shake=0,flash=0,deathText='',zone=0,zoneFlash=0;
var car={y:GROUND-46,vy:0,pitch:0,impact:0,spin:0};
var audio=null,nextStep=0,stepIndex=0,bpm=150;
var startedHint=0,speechText='',speechT=0,lastSpeech=-99,roadRattleT=.6;

window.addEventListener('error',function(ev){try{ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='700 24px monospace';ctx.fillText('NIVA BLYAT — JS ERROR',36,60);ctx.font='16px monospace';ctx.fillText(String(ev.message||'unknown').slice(0,100),36,96);}catch(e){}});

function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function text(t,x,y,s,c,align){ctx.font='900 '+s+'px ui-monospace,monospace';ctx.textAlign=align||'left';ctx.textBaseline='top';ctx.lineWidth=Math.max(2,s*.085);ctx.strokeStyle='#111';ctx.strokeText(t,x,y);ctx.fillStyle=c||'#fff';ctx.fillText(t,x,y);}
function haptic(v){try{if(navigator.vibrate)navigator.vibrate(v);}catch(e){}}

function ensureAudio(){
  if(audio)return;
  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  var ac=new AC(),master=ac.createGain();master.gain.value=.14;master.connect(ac.destination);
  var noise=ac.createBuffer(1,ac.sampleRate*.22,ac.sampleRate),d=noise.getChannelData(0);
  for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  audio={ac:ac,master:master,noise:noise};nextStep=ac.currentTime+.04;
}
function tone(freq,dur,vol,type,when){
  if(!audio)return;var ac=audio.ac,o=ac.createOscillator(),g=ac.createGain(),t=when==null?ac.currentTime:when;
  o.type=type||'square';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(Math.max(.0001,vol),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(audio.master);o.start(t);o.stop(t+dur+.03);
}
function kick(t){
  if(!audio)return;var ac=audio.ac,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(44,t+.12);g.gain.setValueAtTime(.95,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(g);g.connect(audio.master);o.start(t);o.stop(t+.16);
}
function clap(t){
  if(!audio)return;var ac=audio.ac,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=audio.noise;f.type='bandpass';f.frequency.value=1800;f.Q.value=.7;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);s.connect(f);f.connect(g);g.connect(audio.master);s.start(t);s.stop(t+.08);
}
function hat(t){
  if(!audio)return;var ac=audio.ac,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=audio.noise;f.type='highpass';f.frequency.value=5200;g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.001,t+.035);s.connect(f);f.connect(g);g.connect(audio.master);s.start(t);s.stop(t+.04);
}
function bass(t,note){
  if(!audio)return;var ac=audio.ac,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(note,t);f.type='lowpass';f.frequency.value=380;f.Q.value=4;g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(f);f.connect(g);g.connect(audio.master);o.start(t);o.stop(t+.2);
}
function hardbassStab(t,note){
  if(!audio)return;var ac=audio.ac,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='square';o.frequency.setValueAtTime(note,t);f.type='bandpass';f.frequency.value=920;f.Q.value=2.2;g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.075);o.connect(f);f.connect(g);g.connect(audio.master);o.start(t);o.stop(t+.08);
}
function suspensionCreak(intensity){
  if(!audio)return;var ac=audio.ac,t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(155+rand(-25,20),t);o.frequency.exponentialRampToValueAtTime(72+rand(-8,12),t+.18);f.type='bandpass';f.frequency.value=240;f.Q.value=2.5;g.gain.setValueAtTime(.025+.06*intensity,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(f);f.connect(g);g.connect(audio.master);o.start(t);o.stop(t+.23);
}
function tickAudio(){
  if(!audio||state!=='play')return;var ac=audio.ac,stepDur=60/bpm/2,pattern=[55,55,65.4,49,55,73.4,65.4,49];
  while(nextStep<ac.currentTime+.10){
    var t=nextStep,s=stepIndex%8;
    if(s%2===0)kick(t);
    if(s===2||s===6)clap(t);
    hat(t);
    if(s%2===0)bass(t,pattern[s]);
    if(score>=3&&(s===1||s===5))hardbassStab(t,score>=10?220:165);
    if(score>=8&&s===7)hardbassStab(t,247);
    stepIndex++;nextStep+=stepDur;
  }
}

function burst(x,y,n,c,scale){scale=scale||1;for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:rand(-120,120)*scale,vy:rand(-160,-35)*scale,life:rand(.3,.75),max:1,c:c,s:rand(2,6)});}
function updateParticles(dt){for(var i=0;i<particles.length;i++){var p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=430*dt;}particles=particles.filter(function(p){return p.life>0;});}

function sayGopnik(force){
  if(elapsed-lastSpeech<5&&!force)return;
  if(!force&&Math.random()>.34)return;
  var arr=[
    {show:'BLYAT!',ru:'Блять!'},
    {show:'CYKA!',ru:'Сука!'},
    {show:'DAVAI!',ru:'Давай!'},
    {show:'NU BLYAT…',ru:'Ну блять!'},
    {show:'YOB TVOYU MAT!',ru:'Ёб твою мать!'},
    {show:'IDI NAHUI!',ru:'Иди нахуй!'},
    {show:'DEBIL!',ru:'Дебил!'}
  ];
  var p=pick(arr);speechText=p.show;speechT=1.15;lastSpeech=elapsed;
  try{
    if('speechSynthesis' in window&&Math.random()<.55){var u=new SpeechSynthesisUtterance(p.ru);u.lang='ru-RU';u.rate=1.2;u.pitch=.72;u.volume=.58;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}
  }catch(e){}
}
