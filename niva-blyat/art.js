function background(){
  var palettes=[['#7f8e9a','#b7c0c5','#4b555c','#626e75'],['#778895','#b0bdc4','#445058','#5b6970'],['#6f7e88','#aab5ba','#40484e','#586268'],['#7c8991','#b6bec2','#4c575e','#657178']];
  var p=palettes[zone],g=ctx.createLinearGradient(0,0,0,GROUND);g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,GROUND);

  var far=(distance*1.2)%170;ctx.fillStyle='rgba(46,53,58,.26)';
  for(var i=-2;i<8;i++){var fx=i*170-far;rect(fx,210+(i%3)*18,125,125-(i%3)*18,'rgba(46,53,58,.26)');}

  var off=(distance*2.45)%240;ctx.fillStyle=p[2];
  for(var j=-2;j<7;j++){
    var x=j*240-off;
    if(zone===0){
      rect(x,148,188,184,p[2]);rect(x+8,156,172,8,'rgba(20,23,26,.16)');
      for(var r=0;r<5;r++)for(var c=0;c<5;c++)rect(x+17+c*32,178+r*27,14,12,(r+c+j)%7===0?'#c5b879':'#3c474e');
      rect(x+112,160,58,162,'rgba(17,20,22,.13)');rect(x+36,202,10,102,'rgba(18,20,22,.16)');
      text('ПАНЕЛЬКА',x+94,153,9,'#b8c0c4','center');
    }else if(zone===1){
      for(var t=0;t<3;t++){var tx=x+t*62;ctx.beginPath();ctx.moveTo(tx,334);ctx.lineTo(tx+39,150+t*14);ctx.lineTo(tx+78,334);ctx.fill();rect(tx+37,298,5,42,p[2]);}
    }else if(zone===2){
      rect(x,236,192,98,p[2]);rect(x+28,118,24,216,p[2]);rect(x+96,154,20,180,p[2]);rect(x+145,195,35,139,p[2]);
      ctx.fillStyle='rgba(46,52,56,.18)';ctx.beginPath();ctx.arc(x+40,110,34,0,Math.PI*2);ctx.fill();ctx.fillStyle=p[2];text('ДЫМ',x+102,250,11,'#c5cdd0','center');
    }else{
      rect(x+12,270,142,64,p[2]);ctx.beginPath();ctx.moveTo(x,270);ctx.lineTo(x+83,215);ctx.lineTo(x+166,270);ctx.fill();rect(x+65,236,9,34,'#414b51');
    }
  }

  var lamp=(distance*5)%210;
  for(var k=-1;k<6;k++){var lx=k*210-lamp+80;rect(lx,235,4,98,'#4e565b');rect(lx-18,235,39,4,'#4e565b');ctx.fillStyle='#d3c486';ctx.beginPath();ctx.arc(lx-16,242,4,0,Math.PI*2);ctx.fill();}
  var bus=(distance*3.7)%720;rect(720-bus,286,118,48,'rgba(72,81,87,.78)');rect(728-bus,294,48,30,'#58666f');rect(782-bus,294,45,30,'#58666f');text('АВТОБУС',779-bus,302,9,'#c8d0d3','center');
  if(zone===0){text('ЖИЗНЬ — БОЛЬ',880-(distance*2.2%1080),360,13,'rgba(95,101,105,.55)','center');}
  if(zone===2){text('NO FUTURE',760-(distance*1.8%1020),365,13,'rgba(92,98,102,.45)','center');}

  rect(0,332,W,106,'#e7ecee');ctx.fillStyle='#c5cdd1';for(var q=-20;q<W+20;q+=48){ctx.beginPath();ctx.arc(q,398,30,Math.PI,0);ctx.fill();}
  rect(0,GROUND,W,H-GROUND,'#464b4f');rect(0,GROUND,W,8,'#2b2f32');var stripe=(distance*9.5)%130;for(var sx=-130;sx<W+130;sx+=130)rect(sx-stripe,493,72,5,'#737a7e');rect(0,520,W,20,'#dce2e5');
  ctx.fillStyle='rgba(15,18,20,.08)';ctx.fillRect(0,0,W,H);
}

function drawCar(){
  ctx.save();ctx.translate(CAR_X,car.y);ctx.rotate(car.pitch);var impact=Math.sin(car.impact*30)*car.impact*7;ctx.translate(0,impact);
  ctx.save();ctx.rotate(-car.pitch);ctx.globalAlpha=.22;ctx.fillStyle='#101214';ctx.beginPath();ctx.ellipse(0,60,104,14,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;
  for(var j=0;j<2;j++){var wx=j?74:-62;ctx.fillStyle='#141617';ctx.beginPath();ctx.arc(wx,38,26,0,Math.PI*2);ctx.fill();ctx.fillStyle='#72777a';ctx.beginPath();ctx.arc(wx,38,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(wx-7,38);ctx.lineTo(wx+7,38);ctx.moveTo(wx,31);ctx.lineTo(wx,45);ctx.stroke();}
  ctx.fillStyle='#d1c8b7';ctx.strokeStyle='#151719';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-110,24);ctx.lineTo(-104,-18);ctx.lineTo(-70,-52);ctx.lineTo(48,-52);ctx.lineTo(82,-22);ctx.lineTo(118,-20);ctx.lineTo(126,18);ctx.lineTo(120,31);ctx.closePath();ctx.fill();ctx.stroke();
  rect(-96,-10,18,9,'#8c4c34');rect(-12,7,22,8,'#6e4c2c');rect(88,-4,19,9,'#8c4c34');rect(93,-12,26,13,'#24282a');ctx.fillStyle='#d8d1a3';ctx.beginPath();ctx.arc(91,-7,6,0,Math.PI*2);ctx.fill();rect(116,11,15,5,'#222628');
  rect(-57,-46,47,29,'#3c4c55');ctx.fillStyle='#3c4c55';ctx.beginPath();ctx.moveTo(0,-46);ctx.lineTo(43,-46);ctx.lineTo(73,-21);ctx.lineTo(0,-21);ctx.closePath();ctx.fill();ctx.strokeStyle='#151719';ctx.strokeRect(-57,-46,47,29);ctx.beginPath();ctx.moveTo(0,-46);ctx.lineTo(43,-46);ctx.lineTo(73,-21);ctx.lineTo(0,-21);ctx.closePath();ctx.stroke();
  ctx.fillStyle='#89593c';for(var s=0;s<13;s++)ctx.fillRect(-94+(s*31%186),-2+(s*13%28),3+(s%3),2);
  ctx.strokeStyle='#242729';ctx.lineWidth=3;ctx.strokeRect(-54,-64,104,8);ctx.beginPath();ctx.moveTo(-38,-64);ctx.lineTo(-38,-56);ctx.moveTo(32,-64);ctx.lineTo(32,-56);ctx.stroke();
  text('NIVA',-10,-3,15,'#343738','center');
  ctx.save();ctx.translate(-8,-78);rect(-34,25,68,6,'#202325');
  ctx.fillStyle='#d3a880';ctx.beginPath();ctx.arc(2,-26,10,0,Math.PI*2);ctx.fill();
  rect(-11,-36,26,8,'#111');rect(-7,-45,18,10,'#111');rect(0,-42,4,4,'#c74239');
  rect(-18,-17,39,31,'#0f1112');rect(-34,10,30,15,'#0f1112');rect(5,10,30,15,'#0f1112');rect(-27,19,17,13,'#0f1112');rect(11,19,17,13,'#0f1112');
  rect(-15,-15,3,25,'#eee');rect(-7,-15,3,25,'#eee');rect(8,-15,3,25,'#eee');rect(16,-15,3,25,'#eee');
  rect(-30,-9,17,7,'#d3a880');rect(18,-9,17,7,'#d3a880');
  ctx.strokeStyle='#e9e4d9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(11,-24);ctx.lineTo(24,-21);ctx.stroke();ctx.fillStyle='rgba(215,218,220,.42)';ctx.beginPath();ctx.arc(28,-25,5,0,Math.PI*2);ctx.fill();
  ctx.restore();ctx.restore();
}

function drawObstacle(o){
  if(o.type==='pothole'){
    var rw=o.w/2;ctx.fillStyle='#202326';ctx.beginPath();ctx.ellipse(o.x,GROUND+10,rw,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#101214';ctx.beginPath();ctx.ellipse(o.x,GROUND+11,rw*.68,7,0,0,Math.PI*2);ctx.fill();
    if(o.first)text('1 TAP',o.x,GROUND-35,15,'#f0d05f','center');
  }else if(o.type==='truck'){
    rect(o.x-53,o.y,106,88,'#56604f');rect(o.x-38,o.y+10,47,34,'#34414a');rect(o.x+13,o.y+6,34,48,'#636e59');ctx.fillStyle='#151718';ctx.beginPath();ctx.arc(o.x-29,GROUND+1,17,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(o.x+34,GROUND+1,17,0,Math.PI*2);ctx.fill();text('УРАЛ',o.x,o.y+54,13,'#d9d5c5','center');
  }else if(o.type==='barrier'){
    rect(o.x-31,GROUND-58,62,12,'#d7d8d2');rect(o.x-27,GROUND-56,12,10,'#9e4039');rect(o.x-3,GROUND-56,12,10,'#9e4039');rect(o.x+21,GROUND-56,8,10,'#9e4039');rect(o.x-25,GROUND-46,7,46,'#4b5053');rect(o.x+18,GROUND-46,7,46,'#4b5053');
  }else if(o.type==='babushka'){
    ctx.fillStyle='#6f5256';ctx.beginPath();ctx.arc(o.x,GROUND-45,12,0,Math.PI*2);ctx.fill();rect(o.x-13,GROUND-35,26,27,'#765a5e');rect(o.x-17,GROUND-13,12,13,'#2a2c2e');rect(o.x+5,GROUND-13,12,13,'#2a2c2e');rect(o.x+13,GROUND-30,10,16,'#b4aa92');text('!',o.x,GROUND-71,16,'#f0d05f','center');
  }else if(o.type==='pipe'){
    rect(o.x-50,0,100,o.h,'#626a6e');rect(o.x-58,o.h-22,116,22,'#484f53');rect(o.x-46,o.h-16,92,8,'#973e38');
  }else{
    var xs=[o.x-o.w/2];if(o.type==='double')xs.push(o.x-o.w/2+o.offset);
    for(var k=0;k<xs.length;k++){var sh=o.type==='double'&&k===1?Math.sin(o.x*.01)*28:0,gt=clamp(o.gTop+sh,118,308),gb=clamp(o.gBottom+sh,252,406),bw=o.type==='double'?42:o.w;rect(xs[k],0,bw,gt,'#676d70');rect(xs[k],gb,bw,GROUND-gb+8,'#676d70');rect(xs[k]+5,gt-17,bw-10,17,'#983f39');rect(xs[k]+5,gb,bw-10,17,'#983f39');}
  }
}
