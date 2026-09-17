/* V5.6 — illustrated roadside hazards.  Visuals only: v4-game.js owns every hitbox. */
(function(){
  var legacyDrawObstacle=window.drawObstacle;
  var snowBear=new Image(), woodStop=new Image(), pedestrian=new Image(), tireStack=new Image();
  snowBear.src='./obstacle-snow-bear-v56.png?v=56hazards';
  woodStop.src='./obstacle-wood-stop-v57.png?v=57scale';
  pedestrian.src='./obstacle-pedestrian-v57.png?v=57scale';
  tireStack.src='./obstacle-tires-v58.png?v=58variety';

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
      if(o.skin==null)o.skin=Math.floor(Math.random()*2);
      if(o.skin===0)vodkaCrates(o);else snowDumpster(o);return;
    }
    if(o.type==='babushka'){
      if(o.skin==null)o.skin=Math.floor(Math.random()*2);
      var isPedestrian=o.skin===0, sprite=isPedestrian?pedestrian:snowBear;
      if(ready(sprite)){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,o.x-(isPedestrian?34:42),GROUND-(isPedestrian?66:66),isPedestrian?68:84,isPedestrian?66:66);ctx.restore();return;}
    }
    if(o.type==='barrier'){
      if(o.skin==null)o.skin=Math.floor(Math.random()*2);
      var barrierSprite=o.skin===0?woodStop:tireStack;
      if(ready(barrierSprite)){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(barrierSprite,o.x-42,GROUND-64,84,64);ctx.restore();return;}
    }
    if(o.type==='pipe'){overheadCable(o);return;}
    if((o.type==='gate'||o.type==='double')){checkpoint(o);return;}
    legacyDrawObstacle(o);
  };
})();
