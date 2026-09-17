/* V5.4 — illustrated Moscow stage and hand-painted gopnik sprite. Gameplay stays untouched. */
(function(){
  var proceduralFallback=window.background;
  var stage=new Image(), gopnikSprite=new Image();
  stage.decoding='async';
  stage.src='./moscow-night-stage-v53.png?v=54illustrated-34aa304';
  gopnikSprite.decoding='async';
  gopnikSprite.src='./gopnik-pixel-sprite-v54.png?v=54illustrated-34aa304';

  window.background=function(){
    if(!(stage.complete&&stage.naturalWidth)){proceduralFallback();return;}
    /* Source artwork is near-16:9; slight overscan prevents edge seams. */
    ctx.drawImage(stage,-3,0,W+6,H);
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
    ctx.drawImage(gopnikSprite,-70,-126,140,146);
    ctx.restore();
  };

  /* The illustrated stage replaces the earlier procedural extra foreground layer. */
  window.drawNeoGeoBackdropV51=function(){};
})();
