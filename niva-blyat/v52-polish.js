// V5.2 polish: remove duplicate car shadow, upgrade gopnik to hard-edged arcade pixel-art, enrich foreground.
if(typeof drawCarShadowV51==='function'){
  drawCarShadowV51=function(){};
}

function drawGopnikV51(lean,squat){
  ctx.save();
  var prevSmooth=ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled=false;
  ctx.translate(-5,-97+squat*5);
  ctx.rotate(lean*.20);
  ctx.scale(1.28,1.28);

  var O='#08090a', K='#101316', K2='#1a1f23', K3='#2c3338';
  var W='#d9dde0', W2='#9ca5aa';
  var S1='#7b4a34', S2='#a86747', S3='#c88960', S4='#e2a87d';
  var R='#9f2d2b', R2='#d34d3d';

  function p(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function q(points,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill();}

  // rear leg / shoe
  q([[-30,13],[-18,5],[-5,9],[-10,21],[-31,21]],O);
  p(-29,14,18,6,K);p(-29,19,22,5,O);p(-27,15,10,2,K3);
  // front leg / shoe
  q([[7,8],[20,5],[31,14],[29,21],[7,21]],O);
  p(11,13,18,6,K);p(8,19,23,5,O);p(18,14,9,2,K3);

  // bent thighs with stepped pixel silhouettes
  q([[-23,-3],[-9,-5],[-1,7],[-7,16],[-25,12]],O);
  q([[-20,-2],[-10,-3],[-3,7],[-8,12],[-21,9]],K2);
  q([[6,6],[12,-4],[23,-2],[28,11],[18,16],[8,12]],O);
  q([[9,7],[14,-2],[22,-1],[25,10],[18,12],[11,10]],K2);

  // torso outline then shaded track jacket
  q([[-18,-31],[13,-31],[22,-19],[20,3],[12,9],[-15,9],[-24,1],[-24,-18]],O);
  q([[-15,-28],[11,-28],[18,-17],[16,1],[9,6],[-13,6],[-20,0],[-20,-17]],K2);
  p(-15,-27,7,28,K3);p(9,-27,6,27,K);
  p(-4,-28,3,33,W);p(1,-28,3,33,W2);
  p(-16,-24,2,19,W);p(-12,-24,2,19,W2);
  p(12,-24,2,19,W);p(8,-24,2,19,W2);
  p(-11,-8,20,2,'#31383d');
  p(-9,-2,15,2,'#111416');

  // arms, foreshortened toward knees
  q([[-20,-17],[-28,-11],[-31,2],[-24,5],[-17,-7]],O);
  q([[-19,-15],[-25,-9],[-27,1],[-23,2],[-16,-8]],K2);
  p(-29,1,7,5,S2);p(-27,1,4,2,S4);
  q([[15,-17],[24,-11],[30,0],[26,5],[18,-6]],O);
  q([[14,-14],[21,-9],[26,0],[24,2],[17,-7]],K2);
  p(24,1,7,5,S2);p(25,1,4,2,S4);

  // neck
  p(-4,-37,9,8,S2);p(-1,-36,6,7,S3);

  // head silhouette and face planes
  q([[-9,-52],[-4,-59],[7,-58],[12,-51],[10,-40],[5,-34],[-4,-35],[-10,-42]],O);
  q([[-7,-51],[-3,-56],[6,-55],[10,-49],[8,-41],[4,-36],[-3,-37],[-8,-42]],S2);
  p(-4,-54,8,6,S3);p(1,-49,8,8,S4);p(-6,-44,6,6,S1);
  p(-4,-49,3,2,O);p(5,-48,3,2,O); // eyes
  p(8,-45,3,2,S1);p(8,-42,2,3,S1); // nose
  p(1,-39,6,2,'#6d3c30');
  p(-6,-52,3,7,'#6f3f30');

  // beanie / ushanka-like cap with stepped highlight
  q([[-11,-58],[-7,-64],[7,-65],[13,-59],[12,-53],[-10,-53]],O);
  q([[-8,-58],[-5,-62],[6,-62],[10,-58],[9,-55],[-8,-55]],K2);
  p(-5,-62,11,2,K3);p(0,-61,4,3,R);p(1,-60,3,2,R2);

  // cigarette and ember
  p(9,-43,10,2,'#eee9dd');p(19,-43,2,2,R2);
  ctx.globalAlpha=.28;ctx.strokeStyle='#e8ecee';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(21,-44);ctx.lineTo(24,-48);ctx.lineTo(22,-52);ctx.lineTo(26,-56);ctx.stroke();ctx.globalAlpha=1;

  // tiny pixel highlights to mimic hand-shaded arcade sprite
  p(-14,-26,3,3,'#41494e');p(12,-22,2,3,'#343b40');p(-17,-12,2,4,'#4b5358');p(19,-10,2,4,'#3a4247');
  p(-15,4,4,2,'#555d61');p(13,4,4,2,'#4b5357');

  ctx.imageSmoothingEnabled=prevSmooth;
  ctx.restore();
}

if(typeof drawNeoGeoBackdropV51==='function'){
  var _drawNeoGeoBackdropV51=drawNeoGeoBackdropV51;
  drawNeoGeoBackdropV51=function(){
    _drawNeoGeoBackdropV51();
    var off=(distance*5.6)%420;
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(var i=-1;i<4;i++){
      var x=i*420-off+70;
      // hard-edged arcade foreground props
      ctx.globalAlpha=.9;
      rect(x,300,6,34,'#424b50');
      rect(x-15,300,35,4,'#424b50');
      rect(x-12,288,28,12,'#23292d');
      if((i+zone)%2===0){
        rect(x-9,290,22,7,'#6d201f');
        text('СССР',x+2,288,7,'#e0c766','center');
      }
      // chunky snow pixels
      rect(x-18,329,9,4,'rgba(236,241,242,.55)');
      rect(x-7,327,14,6,'rgba(236,241,242,.48)');
      rect(x+8,330,10,3,'rgba(236,241,242,.42)');
    }
    // pixel glints / windows
    ctx.globalAlpha=.14;
    for(var gx=24;gx<W;gx+=96){
      var gy=150+((gx/24|0)%5)*27;
      rect(gx,gy,3,3,'#ffd16a');
      rect(gx+4,gy,2,2,'#fff0b0');
    }
    ctx.restore();
  };
}
