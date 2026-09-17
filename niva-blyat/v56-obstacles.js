/* V5.6 — illustrated roadside hazards.  Visuals only: v4-game.js owns every hitbox. */
(function(){
  var legacyDrawObstacle=window.drawObstacle;
  var snowBear=new Image(), woodStop=new Image(), pedestrian=new Image(), tireStack=new Image(), samovar=new Image(), washer=new Image();
  snowBear.src='./obstacle-snow-bear-v56.png?v=56hazards';
  woodStop.src='./obstacle-wood-stop-v57.png?v=57scale';
  pedestrian.src='./obstacle-pedestrian-v57.png?v=57scale';
  tireStack.src='./obstacle-tires-v58.png?v=58variety';
  samovar.src='./obstacle-samovar-v59.png?v=59absurd';
  washer.src='./obstacle-washer-v60.png?v=60absurd';

  function ready(image){return image.complete&&image.naturalWidth>0;}
  function ice(o){
    var half=o.w*.52, y=GROUND+8;
    ctx.save();
    ctx.fillStyle='#101923';ctx.beginPath();ctx.moveTo(o.x-half-8,y);ctx.lineTo(o.x-half*.56,y-9);ctx.lineTo(o.x+half*.16,y-11);ctx.lineTo(o.x+half+9,y-3);ctx.lineTo(o.x+half*.52,y+10);ctx.lineTo(o.x-half*.38,y+11);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(152,185,199,.52)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(o.x-half*.7,y-1);ctx.lineTo(o.x-half*.23,y-6);ctx.lineTo(o.x+2,y+1);ctx.lineTo(o.x+half*.43,y-6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(o.x+1,y+1);ctx.lineTo(o.x-10,y+9);ctx.moveTo(o.x+1,y+1);ctx.lineTo(o.x+18,y+9);ctx.stroke();
    ctx.restore();
    if(o.first){rr(o.x-31,GROUND-44,62,23,5,'rgba(15,23,31,.9)','#94b8ca');text('JUMP',o.x,GROUND-39,12,'#f3d866','center');}
  }
  function vodkaCrates(o){
    var x=o.x-43,y=GROUND-51;ctx.save();
    rr(x,y,86,51,3,'#744633','#281d19');
    for(var i=0;i<3;i++){rect(x+7+i*25,y+8,18,34,'#a06a42','#311e18');rect(x+10+i*25,y+13,12,23,'#d9c9a9','#44342c');rect(x+14+i*25,y+16,4,16,'#7d3028');}
    rect(x+3,y+44,80,5,'#e0e8eb');ctx.restore();
  }
  function snowDumpster(o){
    var x=o.x-47,y=GROUND-66;ctx.save();
    rr(x,y,94,64,5,'#3e5558','#17262a');rect(x+5,y+6,84,10,'#dce8e9');
    rect(x+10,y+22,72,28,'#2d4144','#162326');rect(x+17,y+27,56,5,'#688083');
    for(var i=0;i<3;i++)rect(x+17+i*23,y+55,11,8,'#182225');
    ctx.fillStyle='#d95343';ctx.fillRect(x+38,y+31,16,9);text('ЖЭК',o.x,y+33,7,'#ecdbc0','center');ctx.restore();
  }
  function matryoshka(o){
    var x=o.x,y=GROUND-51;ctx.save();
    ctx.fillStyle='#c6473e';ctx.beginPath();ctx.ellipse(x,y+25,18,26,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e4c9a1';ctx.beginPath();ctx.arc(x,y+19,9,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#253849';ctx.beginPath();ctx.arc(x-3,y+18,1.5,0,7);ctx.arc(x+3,y+18,1.5,0,7);ctx.fill();
    ctx.strokeStyle='#f0ebdc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y+24,4,0,Math.PI);ctx.stroke();
    ctx.fillStyle='#dbe8ea';ctx.fillRect(x-20,y+47,40,4);ctx.restore();
  }
  function barrel(o){
    var x=o.x-27,y=GROUND-50;ctx.save();
    rr(x,y,54,50,9,'#3f6780','#1d3543');rect(x,y+10,54,5,'#d2e2e7');rect(x,y+34,54,5,'#d2e2e7');
    ctx.fillStyle='#f1b743';ctx.beginPath();ctx.arc(o.x,y+24,7,0,7);ctx.fill();ctx.fillStyle='#25333b';ctx.fillRect(o.x-2,y+19,4,10);ctx.restore();
  }
  function tvSled(o){
    var x=o.x-31,y=GROUND-52;ctx.save();
    rr(x,y,62,43,4,'#5a493d','#171e25');rr(x+7,y+7,48,28,3,'#1b3446','#96c6cf');
    rect(x+12,y+39,6,8,'#483020');rect(x+45,y+39,6,8,'#483020');
    ctx.strokeStyle='#b88a46';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-2,y+49);ctx.lineTo(x+64,y+49);ctx.stroke();ctx.restore();
  }
  function satellite(o){
    var x=o.x,y=68;ctx.save();ctx.strokeStyle='#b8ced5';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,37,17,-.3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#324d5b';ctx.beginPath();ctx.ellipse(x,y,31,13,-.3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#dfecef';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+14,y-10);ctx.lineTo(x+35,y-30);ctx.stroke();
    ctx.strokeStyle='#18242b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+17);ctx.lineTo(x-12,o.h-13);ctx.stroke();ctx.restore();
  }
  function checkpoint(o){
    var xs=[o.x-o.w/2];if(o.type==='double')xs.push(o.x-o.w/2+o.offset);
    for(var k=0;k<xs.length;k++){
      var x=xs[k], shift=o.type==='double'&&k?Math.sin(o.x*.01)*23:0;
      var top=clamp(o.gTop+shift,122,300), bottom=clamp(o.gBottom+shift,260,400), w=o.type==='double'?42:o.w;
      ctx.save();
      ctx.fillStyle='#283742';ctx.fillRect(x,0,w,top);ctx.fillRect(x,bottom,w,GROUND-bottom+9);
      ctx.fillStyle='#101b22';ctx.fillRect(x+6,top-1,w-12,5);ctx.fillRect(x+6,bottom+3,w-12,5);
      ctx.fillStyle='#d9e5e7';ctx.fillRect(x+2,top-7,w-4,7);ctx.fillRect(x+2,bottom,w-4,7);
      ctx.fillStyle='#aa463c';ctx.fillRect(x+5,top-18,w-10,10);ctx.fillRect(x+5,bottom+8,w-10,10);
      ctx.fillStyle='rgba(255,215,106,.7)';ctx.fillRect(x+w*.5-2,top-33,4,8);
      ctx.strokeStyle='rgba(176,203,213,.58)';ctx.beginPath();ctx.moveTo(x+4,top-29);ctx.lineTo(x+w-4,top-18);ctx.stroke();
      ctx.restore();
    }
  }
  function overheadCable(o){
    var left=o.x-o.w/2,right=o.x+o.w/2,low=o.h;
    ctx.save();
    ctx.fillStyle='#263640';ctx.fillRect(left,0,o.w,low);
    ctx.fillStyle='#d7e3e7';ctx.fillRect(left+3,low-10,o.w-6,6);
    ctx.fillStyle='#bf493d';ctx.fillRect(left+7,low-25,o.w-14,10);
    ctx.strokeStyle='#12191f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(left+14,0);ctx.lineTo(left+18,low-32);ctx.moveTo(right-14,0);ctx.lineTo(right-18,low-32);ctx.stroke();
    ctx.strokeStyle='rgba(188,211,219,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left+6,low-43);ctx.lineTo(right-7,low-61);ctx.moveTo(left+12,low-30);ctx.lineTo(right-13,low-48);ctx.stroke();
    for(var i=0;i<3;i++){ctx.fillStyle='#e6bb52';ctx.fillRect(left+19+i*22,low-37-i%2*4,5,5);}ctx.restore();
  }
  window.drawObstacle=function(o){
    if(o.type==='pothole'){ice(o);return;}
    if(o.type==='truck'){
      if(o.skin==null)o.skin=Math.floor(Math.random()*4);
      if(o.skin===0)vodkaCrates(o);else if(o.skin===1)snowDumpster(o);else if(o.skin===2&&ready(samovar)){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(samovar,o.x-47,GROUND-72,94,72);ctx.restore();}else if(ready(washer)){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(washer,o.x-42,GROUND-70,84,70);ctx.restore();}else vodkaCrates(o);return;
    }
    if(o.type==='babushka'){
      if(o.skin==null)o.skin=Math.floor(Math.random()*3);
      if(o.skin===2){matryoshka(o);return;}
      var isPedestrian=o.skin===0, sprite=isPedestrian?pedestrian:snowBear;
      if(ready(sprite)){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,o.x-(isPedestrian?34:42),GROUND-(isPedestrian?66:66),isPedestrian?68:84,isPedestrian?66:66);ctx.restore();return;}
    }
    if(o.type==='barrier'){
      if(o.skin==null)o.skin=Math.floor(Math.random()*4);
      if(o.skin===2){barrel(o);return;}if(o.skin===3){tvSled(o);return;}
      var barrierSprite=o.skin===0?woodStop:tireStack;
      if(ready(barrierSprite)){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(barrierSprite,o.x-42,GROUND-64,84,64);ctx.restore();return;}
    }
    if(o.type==='pipe'){if(o.skin==null)o.skin=Math.floor(Math.random()*2);if(o.skin===1)satellite(o);overheadCable(o);return;}
    if((o.type==='gate'||o.type==='double')){checkpoint(o);return;}
    legacyDrawObstacle(o);
  };
})();
