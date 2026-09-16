function reset(doJump){
  state='play';elapsed=0;distance=0;score=0;speed=195;spawnTimer=2.0;obstacles=[];particles=[];shake=0;flash=0;deathText='';zone=0;zoneFlash=1.6;startedHint=2.4;speechText='';speechT=0;lastSpeech=-99;roadRattleT=.7;
  car.y=GROUND-46;car.vy=0;car.pitch=0;car.impact=0;car.spin=0;
  if(audio){stepIndex=0;nextStep=audio.ac.currentTime+.05;}
  spawnObstacle(430,'pothole',true);
  if(doJump)jump();
}
function obstacleGap(){var minGap=score<8?184:score<18?164:148,center=rand(238,344);return {top:center-minGap/2,bottom:center+minGap/2};}
function spawnObstacle(x,forced,isFirst){
  var pool=score<4?['pothole','truck','pipe']:score<10?['pothole','truck','pipe','gate','barrier']:['pothole','truck','pipe','gate','barrier','babushka','double'];
  var type=forced||pick(pool),o={type:type,x:x==null?W+130:x,passed:false,hit:false,first:!!isFirst};
  if(type==='pothole'){o.w=isFirst?48:(score<3?72:104);o.y=GROUND-4;o.h=30;}
  if(type==='truck'){o.w=106;o.y=GROUND-88;o.h=88;}
  if(type==='pipe'){o.w=100;o.y=0;o.h=270+rand(-18,22);}
  if(type==='gate'){var g=obstacleGap();o.w=82;o.gTop=g.top;o.gBottom=g.bottom;}
  if(type==='barrier'){o.w=62;o.y=GROUND-62;o.h=62;}
  if(type==='babushka'){o.w=38;o.y=GROUND-55;o.h=55;}
  if(type==='double'){var g2=obstacleGap();o.w=118;o.gTop=g2.top;o.gBottom=g2.bottom;o.offset=78;}
  obstacles.push(o);
}
function jump(){car.vy=-450;car.pitch=-.18;car.impact=.13;startedHint=0;tone(245,.035,.08,'square',audio?audio.ac.currentTime:null);haptic(8);}
function tap(){
  ensureAudio();if(audio&&audio.ac.state==='suspended')audio.ac.resume();
  if(state==='title'||state==='gameover'){reset(true);return;}
  if(state!=='play')return;
  car.vy=Math.max(car.vy-330,-640);car.pitch=-.16;car.impact=.12;startedHint=0;tone(245,.03,.065,'square',audio?audio.ac.currentTime:null);if(Math.random()<.16)suspensionCreak(.2);haptic(7);
}

function carBox(){return {x:CAR_X-66,y:car.y-32,w:132,h:66};}
function intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function collides(o){
  var b=carBox();
  if(o.type==='pothole'){
    var hitHalf=o.first?8:o.w/2;
    var left=o.x-hitHalf,right=o.x+hitHalf;
    var low=car.y>(o.first?GROUND-47:GROUND-60);
    var checkX=CAR_X+18;
    return low&&checkX>left&&checkX<right;
  }
  if(o.type==='truck')return intersects(b,{x:o.x-o.w/2,y:o.y,w:o.w,h:o.h});
  if(o.type==='barrier')return intersects(b,{x:o.x-o.w/2,y:o.y,w:o.w,h:o.h});
  if(o.type==='babushka')return intersects(b,{x:o.x-o.w/2,y:o.y,w:o.w,h:o.h});
  if(o.type==='pipe')return intersects(b,{x:o.x-o.w/2,y:0,w:o.w,h:o.h});
  if(o.type==='gate'){var x=o.x-o.w/2;return intersects(b,{x:x,y:0,w:o.w,h:o.gTop})||intersects(b,{x:x,y:o.gBottom,w:o.w,h:GROUND-o.gBottom+20});}
  if(o.type==='double'){
    var x1=o.x-o.w/2,x2=x1+o.offset;
    var a1=intersects(b,{x:x1,y:0,w:42,h:o.gTop})||intersects(b,{x:x1,y:o.gBottom,w:42,h:GROUND-o.gBottom+20});
    var sh=Math.sin(o.x*.01)*28,gt=clamp(o.gTop+sh,118,308),gb=clamp(o.gBottom+sh,252,406);
    var a2=intersects(b,{x:x2,y:0,w:42,h:gt})||intersects(b,{x:x2,y:gb,w:42,h:GROUND-gb+20});
    return a1||a2;
  }
  return false;
}
function die(o){
  if(state!=='play')return;state='gameover';shake=.8;flash=.18;car.spin=rand(-3.1,3.1);car.vy=-260;burst(CAR_X,car.y,22,'#d1d4d5',1);burst(CAR_X,car.y+20,9,'#e8483e',.6);tone(58,.28,.28,'sawtooth',audio?audio.ac.currentTime:null);suspensionCreak(1);haptic([55,30,75]);sayGopnik(true);
  best=Math.max(best,Math.floor(distance));bestScore=Math.max(bestScore,score);store.set('nivaDoomerBest',best);store.set('nivaDoomerScore',bestScore);
  deathText={pothole:'POTHOLE: 1 — NIVA: 0',truck:'URAL SAYS NYET',pipe:'GOPNIK TOO TALL',gate:'CONCRETE SOCIALISM',barrier:'BARRIER SAYS BLYAT',babushka:'BABUSHKA HAS PRIORITY',double:'DOUBLE BLYAT'}[o&&o.type]||'TOO MUCH RUSSIA';
}

function update(dt){
  updateParticles(dt);shake=Math.max(0,shake-dt*2.8);flash=Math.max(0,flash-dt);car.impact=Math.max(0,car.impact-dt);zoneFlash=Math.max(0,zoneFlash-dt);startedHint=Math.max(0,startedHint-dt);speechT=Math.max(0,speechT-dt);
  if(state==='title')return;
  if(state==='gameover'){car.vy+=980*dt;car.y+=car.vy*dt;car.pitch+=car.spin*dt;if(car.y>GROUND-46){car.y=GROUND-46;car.vy*=-.16;car.spin*=.66;}return;}
  elapsed+=dt;distance+=speed*dt/15;speed=Math.min(365,195+elapsed*4.25+score*.95);
  car.vy+=950*dt;car.y+=car.vy*dt;car.pitch+=((clamp(car.vy/650,-.38,.46))-car.pitch)*dt*5.4;
  if(car.y>GROUND-46){
    var landing=car.vy;car.y=GROUND-46;if(landing>105){burst(CAR_X,GROUND-8,6,'#d8dde0',.35);car.impact=.12;suspensionCreak(clamp((landing-100)/450,.15,1));}car.vy=0;car.pitch*=.72;
  }
  if(car.y>=GROUND-47){roadRattleT-=dt;if(roadRattleT<=0){suspensionCreak(rand(.045,.11));roadRattleT=rand(.65,1.35);}}
  if(car.y<82){car.y=82;die({type:'pipe'});}

  spawnTimer-=dt;if(spawnTimer<=0){spawnObstacle();var density=Math.max(1.0,1.82-score*.016);spawnTimer=density+rand(.18,.56);}
  for(var i=0;i<obstacles.length;i++){
    var o=obstacles[i];o.x-=speed*dt;
    if(!o.hit&&collides(o)){o.hit=true;die(o);break;}
    var passX=o.type==='double'?o.x+o.offset+28:o.x+o.w/2;
    if(!o.passed&&passX<CAR_X-82){o.passed=true;score++;tone(720,.05,.09,'square',audio?audio.ac.currentTime:null);if(score%5===0){zone=(zone+1)%4;zoneFlash=1.3;}sayGopnik(false);}
  }
  obstacles=obstacles.filter(function(o){return o.x>-180;});
  tickAudio();
}
