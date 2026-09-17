/* V5.6 — illustrated roadside hazards.  Visuals only: v4-game.js owns every hitbox. */
(function(){
  var legacyDrawObstacle=window.drawObstacle;
  var snowBear=new Image(), woodStop=new Image(), pedestrian=new Image();
  snowBear.src='./obstacle-snow-bear-v56.png?v=56hazards';
  woodStop.src='./obstacle-wood-stop-v57.png?v=57scale';
  pedestrian.src='./obstacle-pedestrian-v57.png?v=57scale';

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
  function checkpoint(o){
    var xs=[o.x-o.w/2];if(o.type==='double')xs.push(o.x-o.w/2+o.offset);
    for(var k=0;k<xs.length;k++){
      var x=xs[k], shift=o.type==='double'&&k?Math.sin(o.x*.01)*23:0;
      var top=clamp(o.gTop+shift,122,300), bottom=clamp(o.gBottom+shift,260,400), w=o.type==='double'?42:o.w;
      ctx.save();
      ctx.fillStyle='#283742';ctx.fillRect(x,0,w,top);ctx.fillRect(x,bottom,w,GROUND-bottom+9);
      ctx.fillStyle='#d9e5e7';ctx.fillRect(x+2,top-7,w-4,7);ctx.fillRect(x+2,bottom,w-4,7);
      ctx.fillStyle='#aa463c';ctx.fillRect(x+5,top-18,w-10,10);ctx.fillRect(x+5,bottom+8,w-10,10);
      ctx.fillStyle='rgba(255,215,106,.7)';ctx.fillRect(x+w*.5-2,top-33,4,8);
      ctx.restore();
    }
  }
  window.drawObstacle=function(o){
    if(o.type==='pothole'){ice(o);return;}
    if(o.type==='truck'){
      vodkaCrates(o);return;
    }
    if(o.type==='babushka'){
      var isPedestrian=(Math.floor(Math.abs(o.x)/100)%2)===0, sprite=isPedestrian?pedestrian:snowBear;
      if(ready(sprite)){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,o.x-(isPedestrian?34:42),GROUND-(isPedestrian?66:66),isPedestrian?68:84,isPedestrian?66:66);ctx.restore();return;}
    }
    if(o.type==='barrier'&&ready(woodStop)){
      ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(woodStop,o.x-42,GROUND-64,84,64);ctx.restore();return;
    }
    if((o.type==='gate'||o.type==='double')){checkpoint(o);return;}
    legacyDrawObstacle(o);
  };
})();
