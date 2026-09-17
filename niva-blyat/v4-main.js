// V5.2 visual pass: Neo-Geo-inspired backdrop, photo Niva, animated wheels, pixel gopnik.
function drawNivaWheelV5(x,y,r,rot){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);
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
function drawGopnikV52(lean,squat){
  ctx.save();
  ctx.translate(-6,-91+squat*7);ctx.rotate(lean*.28);
  ctx.imageSmoothingEnabled=false;
  var px=2;
  function P(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x/px)*px,Math.round(y/px)*px,Math.round(w/px)*px,Math.round(h/px)*px);}
  // legs / shoes
  P(-34,4,24,18,'#111315');P(-28,0,16,8,'#24282b');P(8,4,24,18,'#111315');P(12,0,16,8,'#24282b');
  P(-38,20,30,8,'#080a0b');P(8,20,30,8,'#080a0b');P(-34,18,24,3,'#34383a');P(10,18,24,3,'#34383a');
  // torso volume
  P(-23,-22,46,8,'#2d3235');P(-26,-14,52,24,'#171a1c');P(-22,10,44,10,'#101214');
  P(-14,-18,3,31,'#d9dde0');P(-8,-18,3,31,'#d9dde0');P(8,-18,3,31,'#d9dde0');P(14,-18,3,31,'#d9dde0');
  P(-20,-14,5,24,'#363b3e');P(16,-12,4,20,'#0b0d0e');
  // neck/head
  P(-4,-30,10,9,'#9f674c');P(-8,-45,18,16,'#c78d66');P(-10,-41,4,9,'#9b654b');P(8,-41,4,8,'#9b654b');
  P(-3,-41,3,2,'#2e1d18');P(4,-40,3,2,'#2e1d18');P(3,-36,5,2,'#764836');P(-2,-32,8,2,'#7b4936');
  // hat
  P(-12,-55,26,8,'#121416');P(-8,-61,20,7,'#1c1f21');P(0,-59,5,4,'#a82e29');P(-12,-51,5,6,'#0b0d0e');P(10,-51,5,6,'#0b0d0e');
  // arms to knees
  ctx.save();ctx.translate(-20,-8);ctx.rotate(-.50-lean*.25);P(-22,-4,28,8,'#171a1c');P(-18,-2,6,3,'#303538');P(-22,-1,6,6,'#c18a64');ctx.restore();
  ctx.save();ctx.translate(20,-8);ctx.rotate(.50+lean*.25);P(-5,-4,28,8,'#171a1c');P(10,-2,6,3,'#303538');P(18,-1,6,6,'#c18a64');ctx.restore();
  // cigarette
  P(9,-35,16,2,'#ece8dc');P(24,-34,3,3,'#e46642');
  ctx.restore();
}
function drawNeoGeoBackdropV51(){
  var far=(distance*.42)%520;
  ctx.save();ctx.globalAlpha=.20;
  for(var i=-1;i<4;i++){
    var x=i*520-far;
    rect(x+40,185,8,149,'#263139');rect(x+25,185,38,10,'#263139');
    rect(x+215,214,7,120,'#263139');line(x+218,214,x+245,171,'#263139',3);line(x+245,171,x+270,214,'#263139',3);
    rect(x+382,205,62,129,'#2b353c');rect(x+390,222,8,112,'#20292f');
  }
  ctx.restore();
  var mid=(distance*2.15)%760;
  for(var j=-1;j<3;j++){
    var mx=j*760-mid+130;
    if(zone===0||zone===1){ctx.save();ctx.globalAlpha=.92;rr(mx,275,116,47,2,'#30383e','#1a2024');rect(mx+6,283,104,30,'#1d272c');glow(mx+59,294,58,'#d84c3d',.10);text(j%2?'ПИВО':'24 ЧАСА',mx+58,287,10,j%2?'#f0c94c':'#e65b4a','center');line(mx+8,316,mx+108,316,'#7c8589',2,.55);ctx.restore();}
    if(zone===2){glow(mx+40,248,72,'#d7773f',.09);rect(mx,265,150,57,'#333b3f');rect(mx+10,275,130,35,'#1e282d');text('СТАЛЬ',mx+75,278,11,'#e16947','center');}
    if(zone===3){rr(mx,278,128,42,3,'#485157','#252b2f');windowLight(mx+18,287,true);windowLight(mx+88,287,true);text('ПРОДУКТЫ',mx+64,269,9,'#e5d06e','center');}
  }
  var near=(distance*4.9)%310;
  ctx.save();ctx.globalAlpha=.82;
  for(var k=-1;k<5;k++){var nx=k*310-near;line(nx,327,nx+95,327,'#58656b',3);line(nx+6,307,nx+6,334,'#48545a',3);line(nx+92,307,nx+92,334,'#48545a',3);for(var f=12;f<90;f+=12)line(nx+f,309,nx+f,330,'rgba(95,108,114,.55)',1);}ctx.restore();
  var lamp=(distance*3.9)%430;for(var l=-1;l<4;l++){var lx=l*430-lamp+210;glow(lx,210,88,'#f0b34f',.055);}ctx.save();ctx.globalAlpha=.035;ctx.fillStyle='#0d1114';for(var y=0;y<GROUND;y+=4)ctx.fillRect(0,y,W,1);ctx.restore();
}
function drawCar(){
  var compression=car.impact>0?Math.sin(car.impact*28)*car.impact*25:0;
  ctx.save();ctx.translate(CAR_X,car.y);ctx.rotate(car.pitch);ctx.translate(0,compression*.20);
  if(typeof nivaPhoto!=='undefined'&&nivaPhoto&&nivaPhoto.complete&&nivaPhoto.naturalWidth){
    ctx.drawImage(nivaPhoto,-125,-89,250,125);
    drawNivaWheelV5(-70,6,22,car.wheelRot);drawNivaWheelV5(70,6,22,car.wheelRot);
  }else{rr(-108,-28,216,56,8,'#a95f49','#141719');text('NIVA',0,-7,14,'#fff','center');}
  var lean=clamp(car.vy/720,-.22,.26),squat=clamp(Math.abs(car.vy)/650,0,.35)+Math.abs(compression)*.02;
  drawGopnikV52(lean,squat);
  ctx.restore();
}
function drawParticles(){for(var i=0;i<particles.length;i++){var p=particles[i];ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);}ctx.globalAlpha=1;}
function drawSpeech(){if(speechT<=0)return;var a=clamp(speechT*2,0,1),bx=CAR_X+62,by=car.y-145;ctx.globalAlpha=a;rect(bx-8,by-8,142,38,'rgba(14,16,18,.92)');ctx.fillStyle='rgba(14,16,18,.92)';ctx.beginPath();ctx.moveTo(bx+8,by+30);ctx.lineTo(bx-3,by+49);ctx.lineTo(bx+27,by+31);ctx.fill();text(speechText,bx+63,by,17,'#fff','center');ctx.globalAlpha=1;}
function hud(){rect(18,18,250,70,'rgba(12,14,16,.82)');text(Math.floor(distance)+' m',31,27,24,'#fff');text('BEST '+best+' m',31,57,14,'#bdc6ca');text('BLYAT '+score,W/2,18,38,score?'#e8483e':'#fff','center');rect(W-82,18,64,42,'rgba(12,14,16,.82)');text(muted?'MUTE':'SOUND',W-50,29,11,muted?'#8d969a':'#efd05f','center');if(startedHint>0&&state==='play'){ctx.globalAlpha=clamp(startedHint,0,1);text('TAP POUR REMONTER — LE PREMIER TROU EST LE TUTO',W/2,104,16,'#efd05f','center');ctx.globalAlpha=1;}if(zoneFlash>0&&state==='play'){ctx.globalAlpha=clamp(zoneFlash,0,1);text(['PANELKA','TAIGA','INDUSTRIAL BLYAT','VILLAGE OF DESTINY'][zone],W-26,72,15,'#fff','right');ctx.globalAlpha=1;}}
function title(){ctx.fillStyle='rgba(0,0,0,.58)';ctx.fillRect(0,0,W,H);text('NIVA BLYAT',W/2,96,70,'#e8483e','center');text('DOOMER RUN',W/2,180,24,'#efd05f','center');text('PANELKA • GOPNIK • HARDBASS • NEIGE SALE',W/2,214,13,'#d0d7da','center');text('TAP = DÉMARRER + SAUTER',W/2,322,24,'#fff','center');text('Une Niva. Un gopnik. Une route qui te déteste.',W/2,363,15,'#d7dde0','center');}
function gameover(){ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,0,W,H);text('BLYAT.',W/2,111,70,'#e8483e','center');text(score+' PASSAGES',W/2,205,34,'#fff','center');text(deathText,W/2,268,17,'#efd05f','center');text('BEST '+bestScore,W/2,302,14,'#cbd2d5','center');text('TAP = ENCORE',W/2,374,28,'#fff','center');}
function pauseOverlay(){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);text('PAUSE',W/2,205,44,'#fff','center');text('TAP POUR REPRENDRE',W/2,278,20,'#efd05f','center');}
function render(){ctx.save();if(shake>0)ctx.translate(rand(-6,6)*shake,rand(-5,5)*shake);background();drawNeoGeoBackdropV51();for(var i=0;i<obstacles.length;i++)drawObstacle(obstacles[i]);drawParticles();drawCar();drawSpeech();hud();ctx.restore();if(flash>0){ctx.fillStyle='rgba(255,255,255,'+clamp(flash*3,0,.45)+')';ctx.fillRect(0,0,W,H);}if(state==='title')title();if(state==='gameover')gameover();if(state==='paused')pauseOverlay();}
function loop(ts){var dt=Math.min(.033,(ts-last)/1000||0);last=ts;update(dt);render();requestAnimationFrame(loop);}render();requestAnimationFrame(loop);
window.addEventListener('pointerdown',function(e){e.preventDefault();var p=canvasPoint(e);if(p.x>870&&p.y<82){ensureAudio();setMute(!muted);return;}tap();},{passive:false});
window.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();tap();}if(e.code==='KeyM'){ensureAudio();setMute(!muted);}});
document.addEventListener('visibilitychange',function(){if(document.hidden&&state==='play'){pausedByVisibility=true;state='paused';try{if(audio)audio.ac.suspend();}catch(e){}}else if(!document.hidden&&state==='paused'){pausedByVisibility=false;try{if(audio)audio.ac.resume();}catch(e){}}});
