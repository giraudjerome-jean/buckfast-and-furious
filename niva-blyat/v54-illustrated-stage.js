/* V5.4 — illustrated Moscow stage and hand-painted gopnik sprite. Gameplay stays untouched. */
(function(){
  var proceduralFallback=window.background;
  var stages=[new Image(),new Image(),new Image()], gopnikSprite=new Image();
  stages[0].decoding='async'; stages[0].src='./moscow-night-stage-v53.png?v=54scroll-6f55c5f';
  stages[1].decoding='async'; stages[1].src='./moscow-night-stage-v54-a.png?v=54scroll-6f55c5f';
  stages[2].decoding='async'; stages[2].src='./moscow-night-stage-v54-b.png?v=54scroll-6f55c5f';
  gopnikSprite.decoding='async';
  gopnikSprite.src='./gopnik-pixel-sprite-v55.png?v=55sprites-f4c9f97';

  window.background=function(){
    if(!stages.every(function(stage){return stage.complete&&stage.naturalWidth;})){proceduralFallback();return;}
    /* Three full-width panels = a long city stage before the loop comes back. */
    var strip=W*stages.length, offset=(distance*5.2)%strip;
    for(var panel=-1;panel<=stages.length;panel++){
      var index=(panel%stages.length+stages.length)%stages.length;
      ctx.drawImage(stages[index],Math.round(panel*W-offset)-2,0,W+4,H);
    }
    /* The scene is static by design; only the near snow moves with the run. */
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(var i=0;i<28;i++){
      var x=(i*113+Math.floor(distance*(i%3+1.2)))%(W+30)-15;
      var y=(i*61+Math.floor(elapsed*(8+i%4)))%430;
      var size=i%5===0?2:1;
      ctx.fillStyle=i%3===0?'rgba(236,246,255,.78)':'rgba(218,234,244,.46)';
      ctx.fillRect(x,y,size,size);
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
    ctx.drawImage(gopnikSprite,-68,-142,136,113);
    ctx.restore();
  };

  /* The illustrated stage replaces the earlier procedural extra foreground layer. */
  window.drawNeoGeoBackdropV51=function(){};
})();
