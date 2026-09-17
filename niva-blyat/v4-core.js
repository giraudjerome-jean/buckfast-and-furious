'use strict';
var canvas=document.getElementById('game');
var ctx=canvas.getContext('2d');
var W=960,H=540,GROUND=438,CAR_X=250;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
var rand=function(a,b){return a+Math.random()*(b-a);};
var pick=function(a){return a[(Math.random()*a.length)|0];};
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v===null?d:(+v||0);}catch(e){return d;}},set:function(k,v){try{localStorage.setItem(k,String(v));}catch(e){}}};

var CFG={
  startSpeed:188,maxSpeed:344,speedRamp:3.35,scoreSpeed:.68,
  gravity:910,tapImpulse:-326,startImpulse:-430,maxRise:-610,
  groundY:GROUND-46,ceilingY:82,
  carBox:{x:-59,y:-29,w:118,h:60},
  earlyScriptCount:15
};

var state='title',last=0,elapsed=0,distance=0,best=store.get('nivaV4Best',0),score=0,bestScore=store.get('nivaV4Score',0);
var speed=CFG.startSpeed,obstacles=[],particles=[],shake=0,flash=0,deathText='',zone=0,zoneFlash=0;
var car={y:CFG.groundY,vy:0,pitch:0,impact:0,spin:0,wheelRot:0,grounded:true};
var startedHint=0,speechText='',speechT=0,lastSpeech=-99,roadRattleT=.65;
var director={scriptIndex:0,nextSpawnT:0,lastType:'',proceduralCount:0};
var pausedByVisibility=false,muted=store.get('nivaMuted',0)===1;
var nearMissT=0;

window.addEventListener('error',function(ev){try{ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='700 24px monospace';ctx.fillText('NIVA BLYAT — JS ERROR',36,60);ctx.font='16px monospace';ctx.fillText(String(ev.message||'unknown').slice(0,100),36,96);}catch(e){}});
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function text(t,x,y,s,c,align){ctx.font='900 '+s+'px ui-monospace,monospace';ctx.textAlign=align||'left';ctx.textBaseline='top';ctx.lineWidth=Math.max(2,s*.085);ctx.strokeStyle='#111';ctx.strokeText(t,x,y);ctx.fillStyle=c||'#fff';ctx.fillText(t,x,y);}
function haptic(v){try{if(navigator.vibrate)navigator.vibrate(v);}catch(e){}}
function canvasPoint(e){var r=canvas.getBoundingClientRect(),scale=Math.min(r.width/W,r.height/H),dw=W*scale,dh=H*scale,ox=(r.width-dw)/2,oy=(r.height-dh)/2;return {x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale};}
function burst(x,y,n,c,scale){scale=scale||1;for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:rand(-100,100)*scale,vy:rand(-150,-25)*scale,life:rand(.28,.68),max:.68,c:c,s:rand(2,5)});}
function updateParticles(dt){for(var i=0;i<particles.length;i++){var p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;}particles=particles.filter(function(p){return p.life>0;});}
