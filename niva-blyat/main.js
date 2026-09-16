function drawParticles(){for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);}ctx.globalAlpha=1;}
function drawSpeech(){if(speechT<=0)return;var a=clamp(speechT*2,0,1),bx=CAR_X+58,by=car.y-145;ctx.globalAlpha=a;rect(bx-8,by-8,132,38,'rgba(16,18,20,.9)');ctx.fillStyle='rgba(16,18,20,.9)';ctx.beginPath();ctx.moveTo(bx+8,by+30);ctx.lineTo(bx-3,by+49);ctx.lineTo(bx+26,by+31);ctx.fill();text(speechText,bx+58,by,17,'#fff','center');ctx.globalAlpha=1;}
function hud(){
  rect(18,18,278,80,'rgba(13,15,17,.86)');text('DISTANCE '+Math.floor(distance)+' m',32,28,24,'#fff');text('BEST '+best+' m',32,58,15,'#cbd2d5');
  text('BLYAT '+score,W/2,18,42,score?'#e8483e':'#fff','center');text('BEST '+bestScore,W/2,66,14,'#d1d7da','center');
  if(startedHint>0&&state==='play'){ctx.globalAlpha=clamp(startedHint,0,1);text('LE 1er TAP T’A DÉJÀ FAIT SAUTER — 1 TAP SUFFIT POUR LE TROU',W/2,112,16,'#f0d05f','center');ctx.globalAlpha=1;}
  if(zoneFlash>0&&state==='play'){ctx.globalAlpha=clamp(zoneFlash,0,1);text(['PANELKA DOOMER','TAIGA DOOMER','INDUSTRIAL BLYAT','VILLAGE OF DESTINY'][zone],W-24,26,15,'#fff','right');ctx.globalAlpha=1;}
}
function title(){ctx.fillStyle='rgba(0,0,0,.54)';ctx.fillRect(0,0,W,H);text('NIVA BLYAT',W/2,100,72,'#e8483e','center');text('DOOMER RUN',W/2,187,25,'#f0d05f','center');text('PANELKA • GOPNIK • HARDBASS • NEIGE SALE',W/2,220,14,'#d2d8db','center');text('TAP = DÉMARRER + SAUTER',W/2,326,25,'#fff','center');text('Le premier trou se passe avec ce même tap.',W/2,369,16,'#fff','center');}
function gameover(){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);text('BLYAT.',W/2,116,72,'#e8483e','center');text(score+' PASSAGES',W/2,212,34,'#fff','center');text(deathText,W/2,274,17,'#f0d05f','center');text('TAP = ENCORE',W/2,372,28,'#fff','center');}
function render(){
  ctx.save();if(shake>0)ctx.translate(rand(-7,7)*shake,rand(-6,6)*shake);background();for(var i=0;i<obstacles.length;i++)drawObstacle(obstacles[i]);drawParticles();drawCar();drawSpeech();hud();ctx.restore();
  if(flash>0){ctx.fillStyle='rgba(255,255,255,'+clamp(flash*3,0,.48)+')';ctx.fillRect(0,0,W,H);}if(state==='title')title();if(state==='gameover')gameover();
}
function loop(ts){var dt=Math.min(.033,(ts-last)/1000||0);last=ts;update(dt);render();requestAnimationFrame(loop);}
render();requestAnimationFrame(loop);
window.addEventListener('pointerdown',function(e){e.preventDefault();tap();},{passive:false});
window.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();tap();}});
