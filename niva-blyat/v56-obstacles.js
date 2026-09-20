/* V6.1 — finished illustrated obstacle roster. Physics and hitboxes stay in v4-game.js. */
(function(){
  var bear=new Image(), washer=new Image(), vending=new Image(), fishingHut=new Image(), piano=new Image(), skateBabushka=new Image();
  var rocketRider=new Image(), cyclist=new Image(), armoredBear=new Image(), samovarBot=new Image(), policeNiva=new Image();
  bear.src='./obstacle-bear-profile-v63.png?v=63perspective';
  washer.src='./obstacle-washer-front-v63.png?v=63perspective';
  vending.src='./obstacle-vending-front-v63.png?v=63perspective';
  fishingHut.src='./obstacle-hut-front-v63.png?v=63perspective';
  piano.src='./obstacle-piano-profile-v63.png?v=63perspective';
  skateBabushka.src='./obstacle-skate-babushka-v65.png?v=65moving';
  rocketRider.src='./obstacle-rocket-rider-v67.png?v=67sheet';
  cyclist.src='./obstacle-cyclist-v70.png?v=70clean-cut';
  armoredBear.src='./obstacle-armored-bear-v67.png?v=67sheet';
  samovarBot.src='./obstacle-samovar-bot-v69.png?v=69clean-cut';
  policeNiva.src='./obstacle-police-niva-v67.png?v=67sheet';

  function ready(image){ return image.complete && image.naturalWidth; }
  function choose(o,count){
    if(o.skin==null) o.skin=pick([0,0,0,1,1,1,2,2,2,4,4,7,3,5,6]);
    return o.skin%count;
  }
  function art(o){
    var images=[bear,piano,skateBabushka,rocketRider,cyclist,armoredBear,samovarBot,policeNiva];
    var sizes=[[128,96],[160,112],[154,118],[178,126],[162,128],[166,128],[112,128],[196,118]], i=choose(o,images.length);
    if(i===3&&o.flightY==null)o.flightY=Math.random()<.5?175:235;
    return {image:images[i],w:sizes[i][0],h:sizes[i][1],i:i,y:i===3?o.flightY:GROUND-sizes[i][1]};
  }
  collides=function(o){
    var a=art(o), b=carBox();
    if(a.i===3){
      var rocketBox={x:o.x-a.w*.37,y:a.y+24,w:a.w*.74,h:62};
      return intersects(b,rocketBox);
    }
    return intersects(b,{x:o.x-a.w*.34,y:a.y+7,w:a.w*.68,h:a.h-12});
  };
  function sprite(image,o,w,h,airborne){
    if(!ready(image)) return false;
    ctx.imageSmoothingEnabled=false;
    if(image===bear){
      var sx=Math.round(o.x-w/2-10), sy=GROUND-7, sw=w+28;
      ctx.save();
      ctx.fillStyle='#34251d'; ctx.fillRect(sx,sy,sw,4); ctx.fillRect(sx+4,sy+5,sw-8,3);
      ctx.fillStyle='#9b7247'; ctx.fillRect(sx+3,sy,sw-8,2); ctx.fillRect(sx+8,sy+5,sw-16,1);
      ctx.fillStyle='#d7e7f0'; ctx.fillRect(sx+sw-7,sy-1,7,2); ctx.fillRect(sx+sw-12,sy+5,8,2);
      ctx.restore();
    }
    ctx.drawImage(image,Math.round(o.x-w/2),Math.round(GROUND-h-(airborne||0)),w,h);
    return true;
  }
  function blackIce(o){
    var x=o.x-o.w/2, y=GROUND-13, w=o.w, h=15;
    ctx.save();
    ctx.fillStyle='#07111e'; ctx.beginPath();
    ctx.moveTo(x,y+9); ctx.lineTo(x+13,y+2); ctx.lineTo(x+w*.56,y); ctx.lineTo(x+w,y+7); ctx.lineTo(x+w-10,y+h); ctx.lineTo(x+7,y+h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#8eaecd'; ctx.lineWidth=1.5; ctx.globalAlpha=.7; ctx.stroke();
    ctx.strokeStyle='#3d668e'; ctx.globalAlpha=.9; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x+12,y+10); ctx.lineTo(x+w*.35,y+5); ctx.lineTo(x+w*.62,y+11); ctx.lineTo(x+w-15,y+5); ctx.stroke();
    ctx.fillStyle='#bad7ec'; ctx.globalAlpha=.6; ctx.fillRect(x+w*.19,y+4,4,1); ctx.fillRect(x+w*.74,y+9,5,1);
    ctx.restore();
  }
  function snowWake(x,weight,seed){
    var tick=Math.floor(elapsed*24), count=weight===1?4:weight===2?6:9;
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(var n=0;n<count;n++){
      var drift=5+((n*9+tick*3+seed)%34), rise=((n*5+tick)%11);
      ctx.globalAlpha=.22+(n%3)*.13;ctx.fillStyle=n%2?'#e8f5fb':'#9ebdce';
      ctx.fillRect(Math.round(x+drift),Math.round(GROUND-2-rise*.42),n%4===0?2:1,n%4===0?2:1);
    }
    ctx.restore();
  }
  function moving(o){
    var a=art(o);
    if(a.i===2){snowWake(o.x-39,1,7);snowWake(o.x+36,1,19);}
    if(a.i===4){snowWake(o.x-43,2,13);snowWake(o.x+45,2,31);}
    if(a.i===7){snowWake(o.x-62,3,17);snowWake(o.x+63,3,37);}
    if((a.i===3||a.i===5||a.i===6||a.i===7)&&o.x<700&&!o.warned){o.warned=true;tone(138,.09,.07,'square',audio?audio.ac.currentTime:null);}
    if((a.i===3||a.i===5||a.i===6||a.i===7)&&o.x<680){ctx.save();ctx.globalAlpha=.55+.35*Math.sin(elapsed*11);ctx.fillStyle='#ff7152';ctx.fillRect(Math.round(o.x-2),Math.round(a.y-15),4,4);ctx.restore();}
    sprite(a.image,o,a.w,a.h,a.i===3?GROUND-a.h-a.y:0);
  }
  var nativeOnPass=onPass;
  onPass=function(o){
    var a=art(o), b=carBox(), bottom=a.y+a.h-10, gap=Math.abs(b.y-bottom);
    nativeOnPass(o);
    if(gap>0&&gap<26){score++;nearMissT=.45;shake=Math.max(shake,.12);burst(CAR_X+65,b.y+34,7,'#e7f5fb',.55);tone(980,.05,.055,'square',audio?audio.ac.currentTime:null);speechText='PRÈS ! +1';speechT=.6;}
  };
  function checkpoint(o){
    var x=o.x-o.w/2, w=o.w, top=GROUND-o.h, base=GROUND;
    ctx.save();
    ctx.fillStyle='#121c2b'; ctx.fillRect(x+8,top+8,9,base-top-8); ctx.fillRect(x+w-17,top+8,9,base-top-8);
    ctx.fillStyle='#647b91'; ctx.fillRect(x+10,top+13,4,base-top-17); ctx.fillRect(x+w-15,top+13,4,base-top-17);
    ctx.fillStyle='#26384c'; ctx.fillRect(x+4,top+7,w-8,8); ctx.fillStyle='#a8c4d5'; ctx.fillRect(x+8,top+7,w-16,2);
    ctx.fillStyle='#e8f1f4'; ctx.fillRect(x+2,top+3,w-4,5); ctx.fillRect(x+8,top,w*.22,4); ctx.fillRect(x+w*.62,top,w*.26,4);
    ctx.strokeStyle='#161e28'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x+16,top+21); ctx.lineTo(x+w-16,base-8); ctx.moveTo(x+w-16,top+21); ctx.lineTo(x+16,base-8); ctx.stroke();
    ctx.strokeStyle='#e54a35'; ctx.lineWidth=3; ctx.globalAlpha=.85; ctx.beginPath(); ctx.moveTo(x+24,top+26); ctx.lineTo(x+w*.46,base-18); ctx.moveTo(x+w-24,top+26); ctx.lineTo(x+w*.54,base-18); ctx.stroke();
    ctx.fillStyle='#ffc95a'; ctx.shadowColor='#ffb347'; ctx.shadowBlur=7; ctx.fillRect(x+w/2-3,top+10,6,4); ctx.restore();
  }
  function catenary(o){
    var x=o.x-o.w/2, w=o.w, y=o.y, h=o.h;
    ctx.save();
    ctx.fillStyle='#152131'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#50677d'; ctx.fillRect(x+3,y,4,h);
    ctx.fillStyle='#e8f2f7'; ctx.fillRect(x-2,y,w+4,7); ctx.fillRect(x+9,y-4,w*.18,4); ctx.fillRect(x+w*.59,y-4,w*.25,4);
    ctx.strokeStyle='#0c1520'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+9,y+18); ctx.quadraticCurveTo(x+w*.5,y+42,x+w-9,y+18); ctx.stroke();
    ctx.strokeStyle='#7891a8'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+14,y+24); ctx.quadraticCurveTo(x+w*.5,y+47,x+w-14,y+24); ctx.stroke();
    ctx.fillStyle='#ffbf4d'; ctx.shadowColor='#ffc04d'; ctx.shadowBlur=5; ctx.fillRect(x+w*.27,y+31,3,3); ctx.fillRect(x+w*.72,y+31,3,3); ctx.restore();
  }

  window.drawObstacle=function(o){
    moving(o);
  };
})();
