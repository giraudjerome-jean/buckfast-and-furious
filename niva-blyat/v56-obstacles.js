/* V5.6 — illustrated roadside hazards.  Visuals only: v4-game.js owns every hitbox. */
(function(){
  var legacyDrawObstacle=window.drawObstacle;
  var vodkaTruck=new Image(), snowBear=new Image(), snowTank=new Image();
  vodkaTruck.src='./obstacle-vodka-truck-v56.png?v=56hazards';
  snowBear.src='./obstacle-snow-bear-v56.png?v=56hazards';
  snowTank.src='./obstacle-snow-tank-v56.png?v=56hazards';

  function ready(image){return image.complete&&image.naturalWidth>0;}
  function ice(o){
    var half=o.w*.52, y=GROUND+7;
    ctx.save();
    var sheen=ctx.createRadialGradient(o.x-12,y-4,2,o.x,y,half+14);
    sheen.addColorStop(0,'rgba(210,231,244,.45)');
    sheen.addColorStop(.4,'rgba(67,104,126,.45)');
    sheen.addColorStop(1,'rgba(12,20,29,.85)');
    ctx.fillStyle=sheen;ctx.beginPath();ctx.ellipse(o.x,y,half+8,13,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(219,239,250,.55)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(o.x-half*.72,y-2);ctx.lineTo(o.x-half*.18,y-7);ctx.lineTo(o.x+half*.08,y-2);ctx.lineTo(o.x+half*.65,y-6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(o.x-3,y-8);ctx.lineTo(o.x+7,y+3);ctx.lineTo(o.x+20,y+5);ctx.stroke();
    ctx.restore();
    if(o.first){rr(o.x-31,GROUND-44,62,23,5,'rgba(15,23,31,.9)','#94b8ca');text('JUMP',o.x,GROUND-39,12,'#f3d866','center');}
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
    if(o.type==='truck'&&ready(vodkaTruck)){
      ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(vodkaTruck,o.x-70,GROUND-102,140,102);ctx.restore();return;
    }
    if(o.type==='babushka'&&ready(snowBear)){
      ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(snowBear,o.x-46,GROUND-76,92,76);ctx.restore();return;
    }
    if(o.type==='barrier'&&ready(snowTank)){
      ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(snowTank,o.x-62,GROUND-68,124,68);ctx.restore();return;
    }
    if((o.type==='gate'||o.type==='double')){checkpoint(o);return;}
    legacyDrawObstacle(o);
  };
})();
