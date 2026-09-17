// V5 photo-Niva renderer with animated wheels.
function drawNivaWheelV5(x,y,r,rot){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.fillStyle='#111416';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2c3134';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#bfc3c4';ctx.beginPath();ctx.arc(0,0,r*.57,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#70777a';ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='#545b5e';
  for(var i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.beginPath();ctx.arc(0,-r*.38,r*.07,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.strokeStyle='#646b6e';ctx.lineWidth=1.4;
  for(var s=0;s<6;s++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,-r*.13);ctx.lineTo(0,-r*.48);ctx.stroke();}
  ctx.fillStyle='#353a3d';ctx.beginPath();ctx.arc(0,0,r*.18,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawCar(){
  var altitude=clamp((CFG.groundY-car.y)/180,0,1);
  var compression=car.impact>0?Math.sin(car.impact*28)*car.impact*25:0;
  ctx.save();
  ctx.translate(CAR_X,car.y);
  ctx.rotate(car.pitch);
  ctx.save();ctx.rotate(-car.pitch);ctx.globalAlpha=.28*(1-altitude*.58);ctx.fillStyle='#0f1214';ctx.beginPath();ctx.ellipse(0,55+altitude*6,112-altitude*27,14-altitude*4,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;
  ctx.translate(0,compression*.20);
  if(typeof nivaPhoto!=='undefined' && nivaPhoto && nivaPhoto.complete && nivaPhoto.naturalWidth){
    ctx.drawImage(nivaPhoto,-125,-78,250,111);
    // Cover the baked-in wheel faces and redraw them with rotation.
    drawNivaWheelV5(-71,12,18.5,car.wheelRot);
    drawNivaWheelV5(82,12,18.5,car.wheelRot);
  }else{
    rr(-108,-28,216,56,8,'#a95f49','#141719');
    text('NIVA',0,-7,14,'#fff','center');
  }
  var lean=clamp(car.vy/720,-.22,.26),squat=clamp(Math.abs(car.vy)/650,0,.35)+Math.abs(compression)*.02;
  ctx.save();ctx.translate(-2,-92+squat*8);ctx.rotate(lean*.42);
  rr(-36,21,34,9,4,'#0e1011');rr(8,21,34,9,4,'#0e1011');
  poly([[-28,4],[-8,4],[-2,23],[-31,23]],'#111314');poly([[10,4],[30,4],[35,23],[5,23]],'#111314');
  rr(-18,-18,40,37,6,'#0f1112');rect(-14,-16,3,30,'#e6e6e6');rect(-6,-16,3,30,'#e6e6e6');rect(10,-16,3,30,'#e6e6e6');rect(18,-16,3,30,'#e6e6e6');
  rect(-2,-27,9,9,'#c9946c');ctx.fillStyle='#d2a078';ctx.beginPath();ctx.arc(3,-36,11,0,Math.PI*2);ctx.fill();
  rr(-11,-50,28,9,2,'#111314');rr(-7,-59,20,11,2,'#111314');rect(0,-56,5,5,'#c33e36');
  var armLift=clamp(-car.vy/520,0,.75);ctx.save();ctx.translate(-19,-8);ctx.rotate(-.2-armLift*.65);rr(-19,-3,25,8,4,'#101213');rect(-20,-1,7,5,'#d2a078');ctx.restore();ctx.save();ctx.translate(22,-8);ctx.rotate(.2+armLift*.65);rr(-5,-3,25,8,4,'#101213');rect(14,-1,7,5,'#d2a078');ctx.restore();
  line(13,-32,28,-29,'#e9e3d6',2);ctx.fillStyle='#d96a44';ctx.beginPath();ctx.arc(29,-29,2,0,Math.PI*2);ctx.fill();ctx.save();ctx.globalAlpha=.26;ctx.strokeStyle='#d9dfe1';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(31,-31);ctx.bezierCurveTo(37,-37,29,-42,37,-48);ctx.stroke();ctx.restore();
  ctx.restore();
  ctx.restore();
}
function drawParticles(){for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);}ctx.globalAlpha=1;}
function drawSpeech(){if(speechT<=0)return;var a=clamp(speechT*2,0,1),bx=CAR_X+62,by=car.y-145;ctx.globalAlpha=a;rect(bx-8,by-8,142,38,'rgba(14,16,18,.92)');ctx.fillStyle='rgba(14,16,18,.92)';ctx.beginPath();ctx.moveTo(bx+8,by+30);ctx.lineTo(bx-3,by+49);ctx.lineTo(bx+27,by+31);ctx.fill();text(speechText,bx+63,by,17,'#fff','center');ctx.globalAlpha=1;}
function hud(){rect(18,18,250,70,'rgba(12,14,16,.82)');text(Math.floor(distance)+' m',31,27,24,'#fff');text('BEST '+best+' m',31,57,14,'#bdc6ca');text('BLYAT '+score,W/2,18,38,score?'#e8483e':'#fff','center');rect(W-82,18,64,42,'rgba(12,14,16,.82)');text(muted?'MUTE':'SOUND',W-50,29,11,muted?'#8d969a':'#efd05f','center');if(startedHint>0&&state==='play'){ctx.globalAlpha=clamp(startedHint,0,1);text('TAP POUR REMONTER — LE PREMIER TROU EST LE TUTO',W/2,104,16,'#efd05f','center');ctx.globalAlpha=1;}if(zoneFlash>0&&state==='play'){ctx.globalAlpha=clamp(zoneFlash,0,1);text(['PANELKA','TAIGA','INDUSTRIAL BLYAT','VILLAGE OF DESTINY'][zone],W-26,72,15,'#fff','right');ctx.globalAlpha=1;}}
function title(){ctx.fillStyle='rgba(0,0,0,.58)';ctx.fillRect(0,0,W,H);text('NIVA BLYAT',W/2,96,70,'#e8483e','center');text('DOOMER RUN',W/2,180,24,'#efd05f','center');text('PANELKA • GOPNIK • HARDBASS • NEIGE SALE',W/2,214,13,'#d0d7da','center');text('TAP = DÉMARRER + SAUTER',W/2,322,24,'#fff','center');text('Une Niva. Un gopnik. Une route qui te déteste.',W/2,363,15,'#d7dde0','center');}
function gameover(){ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,0,W,H);text('BLYAT.',W/2,111,70,'#e8483e','center');text(score+' PASSAGES',W/2,205,34,'#fff','center');text(deathText,W/2,268,17,'#efd05f','center');text('BEST '+bestScore,W/2,302,14,'#cbd2d5','center');text('TAP = ENCORE',W/2,374,28,'#fff','center');}
function pauseOverlay(){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);text('PAUSE',W/2,205,44,'#fff','center');text('TAP POUR REPRENDRE',W/2,278,20,'#efd05f','center');}
function render(){ctx.save();if(shake>0)ctx.translate(rand(-6,6)*shake,rand(-5,5)*shake);background();for(var i=0;i<obstacles.length;i++)drawObstacle(obstacles[i]);drawParticles();drawCar();drawSpeech();hud();ctx.restore();if(flash>0){ctx.fillStyle='rgba(255,255,255,'+clamp(flash*3,0,.45)+')';ctx.fillRect(0,0,W,H);}if(state==='title')title();if(state==='gameover')gameover();if(state==='paused')pauseOverlay();}
function loop(ts){var dt=Math.min(.033,(ts-last)/1000||0);last=ts;update(dt);render();requestAnimationFrame(loop);}render();requestAnimationFrame(loop);
window.addEventListener('pointerdown',function(e){e.preventDefault();var p=canvasPoint(e);if(p.x>870&&p.y<82){ensureAudio();setMute(!muted);return;}tap();},{passive:false});
window.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();tap();}if(e.code==='KeyM'){ensureAudio();setMute(!muted);}});
document.addEventListener('visibilitychange',function(){if(document.hidden&&state==='play'){pausedByVisibility=true;state='paused';try{if(audio)audio.ac.suspend();}catch(e){}}else if(!document.hidden&&state==='paused'){pausedByVisibility=false;try{if(audio)audio.ac.resume();}catch(e){}}});
