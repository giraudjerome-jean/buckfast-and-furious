var audio=null,nextStep=0,stepIndex=0,bpm=150;
function ensureAudio(){
  if(audio)return;
  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  var ac=new AC(),master=ac.createGain();master.gain.value=muted?0:.14;master.connect(ac.destination);
  var noise=ac.createBuffer(1,ac.sampleRate*.28,ac.sampleRate),d=noise.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  var eg=ac.createGain(),ef=ac.createBiquadFilter(),eo=ac.createOscillator(),eo2=ac.createOscillator();
  ef.type='lowpass';ef.frequency.value=230;eg.gain.value=.028;eo.type='sawtooth';eo2.type='triangle';eo.frequency.value=52;eo2.frequency.value=104;eo.connect(ef);eo2.connect(ef);ef.connect(eg);eg.connect(master);eo.start();eo2.start();
  audio={ac:ac,master:master,noise:noise,engineGain:eg,engine1:eo,engine2:eo2};nextStep=ac.currentTime+.04;
}
function setMute(v){muted=v?true:false;store.set('nivaMuted',muted?1:0);if(audio)audio.master.gain.setTargetAtTime(muted?0:.14,audio.ac.currentTime,.02);}
function tone(freq,dur,vol,type,when){if(!audio||muted)return;var ac=audio.ac,o=ac.createOscillator(),g=ac.createGain(),t=when==null?ac.currentTime:when;o.type=type||'square';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(Math.max(.0001,vol),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(audio.master);o.start(t);o.stop(t+dur+.03);}
function noiseHit(t,dur,vol,filterFreq,type){if(!audio||muted)return;var ac=audio.ac,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=audio.noise;f.type=type||'bandpass';f.frequency.value=filterFreq;f.Q.value=1.4;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(audio.master);s.start(t);s.stop(t+dur+.02);}
function kick(t){if(!audio||muted)return;var ac=audio.ac,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(155,t);o.frequency.exponentialRampToValueAtTime(43,t+.12);g.gain.setValueAtTime(.92,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(g);g.connect(audio.master);o.start(t);o.stop(t+.16);}
function clap(t){noiseHit(t,.075,.11,1800,'bandpass');}
function hat(t,open){noiseHit(t,open?.07:.03,open?.03:.022,5900,'highpass');}
function bass(t,note,dur){if(!audio||muted)return;var ac=audio.ac,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(note,t);f.type='lowpass';f.frequency.setValueAtTime(340,t);f.frequency.exponentialRampToValueAtTime(150,t+(dur||.18));f.Q.value=4.2;g.gain.setValueAtTime(.145,t);g.gain.exponentialRampToValueAtTime(.001,t+(dur||.18));o.connect(f);f.connect(g);g.connect(audio.master);o.start(t);o.stop(t+(dur||.18)+.03);}
function stab(t,note,vol){if(!audio||muted)return;var ac=audio.ac,o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='square';o2.type='square';o.frequency.value=note;o2.frequency.value=note*1.01;f.type='bandpass';f.frequency.value=970;f.Q.value=2;g.gain.setValueAtTime(vol||.038,t);g.gain.exponentialRampToValueAtTime(.001,t+.075);o.connect(f);o2.connect(f);f.connect(g);g.connect(audio.master);o.start(t);o2.start(t);o.stop(t+.08);o2.stop(t+.08);}
function suspensionCreak(intensity){if(!audio||muted)return;var ac=audio.ac,t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(145+rand(-25,20),t);o.frequency.exponentialRampToValueAtTime(70+rand(-7,11),t+.2);f.type='bandpass';f.frequency.value=230;f.Q.value=3;g.gain.setValueAtTime(.018+.052*intensity,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(f);f.connect(g);g.connect(audio.master);o.start(t);o.stop(t+.23);noiseHit(t,.11,.015+.03*intensity,720,'bandpass');}
function metalClonk(intensity){if(!audio||muted)return;var t=audio.ac.currentTime;tone(92,.09,.055*intensity,'triangle',t);tone(171,.055,.026*intensity,'square',t+.008);noiseHit(t,.06,.05*intensity,1100,'bandpass');}
function roadTick(){if(!audio||muted)return;var t=audio.ac.currentTime;noiseHit(t,.025,.008,1450,'bandpass');}
function updateEngine(){if(!audio)return;var f=48+(speed-CFG.startSpeed)*.18+Math.abs(car.vy)*.015;audio.engine1.frequency.setTargetAtTime(f,audio.ac.currentTime,.04);audio.engine2.frequency.setTargetAtTime(f*2.01,audio.ac.currentTime,.04);audio.engineGain.gain.setTargetAtTime(muted?0:(car.grounded?.022:.015),audio.ac.currentTime,.05);}
function tickAudio(){
  if(!audio||state!=='play'||pausedByVisibility)return;var ac=audio.ac,stepDur=60/bpm/2,bassPat=[55,55,65.4,49,55,73.4,65.4,49];
  updateEngine();
  while(nextStep<ac.currentTime+.10){
    var t=nextStep,s=stepIndex%8,bar=Math.floor(stepIndex/8)%4;
    if(s%2===0)kick(t);
    if((bar>0)&&(s===2||s===6))clap(t);
    if(bar>0||s%2===0)hat(t,bar>=2&&s===7);
    if(bar>=1&&s%2===0)bass(t,bassPat[s],bar>=2?.19:.14);
    if(bar>=2&&(s===1||s===5))stab(t,bar===3?220:165,.042);
    if(bar===3&&s===7)stab(t,247,.034);
    stepIndex++;nextStep+=stepDur;
  }
}
function sayGopnik(kind,force){
  if(elapsed-lastSpeech<4.2&&!force)return;
  var bank={pass:[{show:'DAVAI!',ru:'Давай!'},{show:'NORMALNO!',ru:'Нормально!'},{show:'BLYAT, EASY!',ru:'Блять, легко!'}],close:[{show:'OY BLYAT!',ru:'Ой, блять!'},{show:'CYKA!',ru:'Сука!'},{show:'NU NAHUI!',ru:'Ну нахуй!'}],death:[{show:'BLYAT!',ru:'Блять!'},{show:'YOB TVOYU MAT!',ru:'Ёб твою мать!'},{show:'DEBIL!',ru:'Дебил!'},{show:'IDI NAHUI!',ru:'Иди нахуй!'}],zone:[{show:'DAVAI DAVAI!',ru:'Давай давай!'},{show:'POEHALI!',ru:'Поехали!'}]};
  if(!force&&Math.random()>(kind==='pass'?.22:.5))return;
  var p=pick(bank[kind]||bank.pass);speechText=p.show;speechT=1.05;lastSpeech=elapsed;
  try{if('speechSynthesis' in window&&!muted&&Math.random()<.58){var u=new SpeechSynthesisUtterance(p.ru);u.lang='ru-RU';u.rate=1.16;u.pitch=.7;u.volume=.52;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}}catch(e){}
}
