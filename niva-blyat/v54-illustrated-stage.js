/* V5.4 — illustrated Moscow stage and hand-painted gopnik sprite. Gameplay stays untouched. */
(function(){
  var proceduralFallback=window.background;
  var stages=[new Image(),new Image(),new Image()], ghettoStage=new Image(), gopnikSprite=new Image();
  stages[0].decoding='async'; stages[0].src='./moscow-night-stage-v53.png?v=54scroll-6f55c5f';
  stages[1].decoding='async'; stages[1].src='./moscow-night-stage-v54-a.png?v=54scroll-6f55c5f';
  stages[2].decoding='async'; stages[2].src='./moscow-night-stage-v54-b.png?v=54scroll-6f55c5f';
  ghettoStage.decoding='async'; ghettoStage.src='./moscow-ghetto-stage-v79.png?v=79ghetto';
  gopnikSprite.decoding='async';
  gopnikSprite.src='./gopnik-pixel-sprite-v55.png?v=55sprites-f4c9f97';

  window.background=function(){
    if(!stages.every(function(stage){return stage.complete&&stage.naturalWidth;})||!(ghettoStage.complete&&ghettoStage.naturalWidth)){proceduralFallback();return;}
    /* Three full-width panels = a long city stage before the loop comes back. */
    var activeStages=zone===3?[ghettoStage]:stages, strip=W*activeStages.length, offset=(distance*5.2)%strip;
    for(var panel=-1;panel<=activeStages.length;panel++){
      var index=(panel%activeStages.length+activeStages.length)%activeStages.length;
      ctx.drawImage(activeStages[index],Math.round(panel*W-offset)-2,0,W+4,H);
    }
    /* The run advances from blue night to blizzard, industry and a dirty red dawn. */
    var moods=[
      {wash:'rgba(28,65,124,.10)',snow:28,wind:0},
      {wash:'rgba(99,71,150,.16)',snow:58,wind:1},
      {wash:'rgba(185,98,39,.13)',snow:36,wind:0},
      {wash:'rgba(154,42,45,.16)',snow:22,wind:0}
    ], mood=moods[Math.min(3,zone)];
    ctx.fillStyle=mood.wash;ctx.fillRect(0,0,W,H);
    if(zone===2){ctx.save();ctx.globalAlpha=.10;ctx.fillStyle='#e6a15d';for(var smoke=0;smoke<5;smoke++){var sx=(smoke*237-distance*.34)%(W+190)-95;ctx.beginPath();ctx.ellipse(sx,98+(smoke%2)*38,100,25,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
    if(zone===3){ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#f06e4e';ctx.fillRect(0,366,W,2);ctx.restore();}
    /* Near snow becomes a blowing blizzard in the second part of the run. */
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(var i=0;i<mood.snow;i++){
      var x=(i*113+Math.floor(distance*(i%3+1.2)))%(W+30)-15+(mood.wind?Math.sin(elapsed*3+i)*22:0);
      var y=(i*61+Math.floor(elapsed*(8+i%4)))%430;
      var size=i%7===0?2:1;
      ctx.fillStyle=i%3===0?'rgba(236,246,255,.78)':'rgba(218,234,244,.46)';
      ctx.fillRect(x,y,mood.wind&&i%5===0?size+3:size,size);
    }
    ctx.restore();
  };

  /* The baked car image already owns its ground shadow. No extra shadow is drawn here. */
  window.drawGopnikV52=function(lean,squat){
    if(!(gopnikSprite.complete&&gopnikSprite.naturalWidth))return;
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    ctx.translate(-3,-48+squat*4);
    ctx.rotate(lean*.18);
    /* Shoes meet the painted roof line instead of cutting through the cabin. */
    ctx.drawImage(gopnikSprite,-68,-128,136,113);
    /* Tiny animated cigarette smoke: deliberately chunky to match the pixel stage. */
    var smokeTime=elapsed*2.45;
    for(var puff=0;puff<6;puff++){
      var drift=Math.sin(smokeTime+puff*1.7)*2.8;
      var rise=(elapsed*15+puff*5)%8;
      /* Start exactly at the cigarette: no detached smoke cloud. */
      var sx=Math.round(30+puff*2.2+drift);
      var sy=Math.round(-116-puff*6-rise);
      ctx.globalAlpha=.78-puff*.09;
      ctx.fillStyle=puff%2?'#b9c5ce':'#edf2f3';
      ctx.fillRect(sx,sy,puff<2?3:4,puff<2?3:4);
    }
    ctx.globalAlpha=1;
    ctx.restore();
  };

  /* The illustrated stage replaces the earlier procedural extra foreground layer. */
  window.drawNeoGeoBackdropV51=function(){};
})();
