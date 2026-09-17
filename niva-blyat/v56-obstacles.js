/* V6.1 — finished illustrated obstacle roster. Physics and hitboxes stay in v4-game.js. */
(function(){
  var bear=new Image(), stop=new Image(), pedestrian=new Image(), tires=new Image();
  var samovar=new Image(), washer=new Image(), vending=new Image(), satellite=new Image();
  bear.src='./obstacle-snow-bear-v56.png?v=56hazards';
  stop.src='./obstacle-wood-stop-v57.png?v=57scale';
  pedestrian.src='./obstacle-pedestrian-v57.png?v=57scale';
  tires.src='./obstacle-tires-v58.png?v=58variety';
  samovar.src='./obstacle-samovar-v59.png?v=59absurd';
  washer.src='./obstacle-washer-v60.png?v=60absurd';
  vending.src='./obstacle-vending-v61.png?v=61polished';
  satellite.src='./obstacle-satellite-v61.png?v=61polished';

  function ready(image){ return image.complete && image.naturalWidth; }
  function choose(o,count){
    if(o.skin==null) o.skin=Math.floor(Math.random()*count);
    return o.skin%count;
  }
  function sprite(image,o,w,h){
    if(!ready(image)) return false;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(image,Math.round(o.x-w/2),Math.round(GROUND-h),w,h);
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
    if(o.type==='pothole'){ blackIce(o); return; }
    if(o.type==='truck'){
      var big=[samovar,washer,vending], bigSize=[[112,90],[110,90],[102,94]], bi=choose(o,big.length);
      sprite(big[bi],o,bigSize[bi][0],bigSize[bi][1]); return;
    }
    if(o.type==='barrier'){
      var compact=[stop,tires,satellite], compactSize=[[90,68],[88,66],[102,78]], ci=choose(o,compact.length);
      sprite(compact[ci],o,compactSize[ci][0],compactSize[ci][1]); return;
    }
    if(o.type==='babushka'){
      var people=[pedestrian,bear], peopleSize=[[64,66],[86,66]], pi=choose(o,people.length);
      sprite(people[pi],o,peopleSize[pi][0],peopleSize[pi][1]); return;
    }
    if(o.type==='pipe'){ catenary(o); return; }
    if(o.type==='gate' || o.type==='double'){ checkpoint(o); return; }
    blackIce(o);
  };
})();
