/* V5.3 — winter-night pixel stage. Visual layer only: physics and collisions live in v4-game.js. */
(function(){
  function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function wire(x1,y1,x2,y2,c,w){ctx.strokeStyle=c;ctx.lineWidth=w||1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function sign(x,y,w,label,ink,light){
    px(x-3,y-3,w+6,25,'#090d10'); px(x,y,w,19,ink); px(x+2,y+2,w-4,15,'#151b20');
    glow(x+w/2,y+10,46,light,.12); text(label,x+w/2,y+4,9,light,'center');
  }
  function building(x,base,w,h,seed){
    var top=base-h, edge='#11181d', face=(seed%3===0?'#252f36':seed%3===1?'#2b353c':'#303a40');
    px(x-5,top+10,5,h-10,edge); px(x,top,w,h,face); px(x+w-8,top+8,8,h-8,'#1c252b');
    px(x,top,w,6,'#3c4850'); px(x+7,top+10,w-18,3,'rgba(160,184,193,.11)');
    var cols=Math.max(3,Math.floor((w-22)/24)), rows=Math.max(3,Math.floor((h-29)/23));
    for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){
      var on=((r*13+c*7+seed*3)%19===0)||((r+c*5+seed)%31===0), wx=x+11+c*((w-22)/cols), wy=top+23+r*23;
      if(on){glow(wx+5,wy+4,16,'#f1b85b',.10);px(wx,wy,10,8,'#b8904a');px(wx+1,wy+1,8,3,'#ead27b');}
      else {px(wx,wy,10,8,'#151e24');px(wx+1,wy+1,8,2,'#26323a');}
    }
    px(x+w*.61,top+15,Math.max(7,w*.09),h-25,'rgba(8,12,15,.24)');
    wire(x+w*.61,top+16,x+w*.61,base-7,'rgba(155,174,181,.09)',1);
  }
  function rail(x,y,w){
    wire(x,y,x+w,y,'#76848a',2);wire(x,y+7,x+w,y+7,'#36434a',3);
    for(var i=0;i<w;i+=24){wire(x+i,y-4,x+i+11,y+11,'#4f5e65',2);wire(x+i+11,y+11,x+i+24,y-4,'#263138',1);}
  }
  function gopnik(lean,squat){
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(-6,-96+squat*5);ctx.rotate(lean*.18);ctx.scale(1.55,1.55);
    var O='#07090a', A='#101518', B='#20282d', C='#344047', W='#dce1df', WD='#87949a', F='#b86f50', FL='#d79a70', R='#b73732';
    function p(x,y,w,h,c){px(x,y,w,h,c);}
    // squat shoes and chunky folded legs
    p(-32,17,25,7,O);p(-28,14,19,4,B);p(8,17,27,7,O);p(12,14,19,4,B);
    p(-25,2,18,15,O);p(-22,3,13,11,B);p(7,2,20,15,O);p(10,3,14,11,B);
    p(-28,-3,20,8,O);p(-24,-3,15,7,'#1b2328');p(7,-3,21,8,O);p(10,-3,15,7,'#1b2328');
    // jacket: heavy dark tracksuit, pixel highlights and stripes
    p(-20,-30,40,8,O);p(-24,-22,48,28,O);p(-20,-20,40,25,B);p(-16,-18,7,21,C);p(12,-18,6,21,'#10161a');
    p(-7,-21,3,26,W);p(-2,-21,2,26,WD);p(5,-21,3,26,W);p(10,-21,2,26,WD);
    p(-18,-12,8,3,'#4b5960');p(11,-7,7,3,'#46535a');p(-13,4,25,3,'#0b0e10');
    // arms follow knees, gloves/hands readable
    p(-31,-17,9,21,O);p(-28,-14,6,17,B);p(-33,1,8,6,F);p(-31,1,4,3,FL);
    p(22,-17,9,21,O);p(22,-14,6,17,B);p(25,1,8,6,F);p(26,1,4,3,FL);
    // neck and face with cap, eyebrows and cigarette
    p(-4,-38,9,10,F);p(-8,-53,18,18,F);p(-5,-51,12,13,FL);p(-9,-47,4,10,'#8d4d3a');p(8,-46,4,10,'#8d4d3a');
    p(-4,-47,3,2,O);p(4,-47,3,2,O);p(5,-42,3,2,'#7f4535');p(-2,-39,7,2,'#773d31');
    p(-12,-59,27,8,O);p(-8,-65,20,7,'#151a1d');p(-10,-57,24,5,B);p(0,-63,4,4,R);p(1,-62,2,2,'#e25a47');
    p(9,-43,12,2,'#e8e5db');p(20,-43,2,2,'#e4573d');
    ctx.globalAlpha=.32;wire(22,-45,27,-50,'#dbe1e4',1);wire(27,-50,24,-55,'#dbe1e4',1);ctx.globalAlpha=1;
    ctx.restore();
  }
  window.background=function(){
    var sky=ctx.createLinearGradient(0,0,0,GROUND);sky.addColorStop(0,'#071018');sky.addColorStop(.48,'#172630');sky.addColorStop(1,'#64747c');ctx.fillStyle=sky;ctx.fillRect(0,0,W,GROUND);
    // snow-lit haze and far skyline
    ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#9eb7c2';for(var h=0;h<4;h++){ctx.beginPath();ctx.ellipse(155+h*265,110+(h%2)*35,175,25,0,0,Math.PI*2);ctx.fill();}ctx.restore();
    var far=(distance*.55)%180;for(var i=-2;i<7;i++){var x=i*180-far, bh=76+(i%4)*22;px(x,334-bh,154,bh,'#18232b');for(var q=0;q<4;q++)px(x+18+q*29,334-bh+19+(q%2)*18,8,6,'#5f6a6c');}
    var mid=(distance*1.48)%300;for(var j=-2;j<6;j++)building(j*300-mid,334,215,135+(j%3)*38,j+zone*5);
    // horizon signage, tram wires and utility poles
    var prop=(distance*2.65)%830;sign(830-prop,268,91,'24 ЧАСА','#572724','#f0bd57');sign(1270-prop,250,103,'ПИВО','#173541','#6ed1de');
    for(var k=-1;k<6;k++){var pole=k*205-(distance*2.9)%205+48;px(pole,193,4,141,'#182228');px(pole-20,194,45,4,'#202b31');wire(pole-18,202,pole+188,211,'#35464f',1);wire(pole+17,205,pole+223,216,'#2a3941',1);}
    var lamp=(distance*4.05)%260;for(var l=-1;l<6;l++){var lx=l*260-lamp+80;px(lx,226,5,108,'#222c31');px(lx-18,226,38,4,'#253036');glow(lx-15,234,47,'#e7a94b',.15);ctx.fillStyle='#ffd272';ctx.beginPath();ctx.arc(lx-15,234,3,0,Math.PI*2);ctx.fill();}
    rail(-(distance*4.6)%220,324,W+220);
    // snow bank, black road, lane paint
    var snow=ctx.createLinearGradient(0,333,0,425);snow.addColorStop(0,'#d8e0e3');snow.addColorStop(1,'#92a2aa');ctx.fillStyle=snow;ctx.fillRect(0,333,W,91);ctx.fillStyle='#b6c4c9';for(var s=-30;s<W+30;s+=52){ctx.beginPath();ctx.arc(s,402,27,Math.PI,0);ctx.fill();}
    var road=ctx.createLinearGradient(0,GROUND,0,H);road.addColorStop(0,'#252d31');road.addColorStop(1,'#080b0d');ctx.fillStyle=road;ctx.fillRect(0,GROUND,W,H-GROUND);px(0,GROUND,W,6,'#101619');px(0,518,W,22,'#bccbd0');
    var stripe=(distance*8.8)%140;for(var z=-140;z<W+140;z+=140)px(z-stripe,491,76,5,'#89969a');
    for(var cr=0;cr<8;cr++){var cx=cr*137-(distance*5.4)%137;wire(cx,454+(cr%3)*16,cx+22,459+(cr%3)*16,'rgba(3,5,6,.65)',2);}
    // pixel snowfall — two parallax passes
    for(var n=0;n<38;n++){var sx=(n*97+Math.floor(distance*(n%2?1.1:2.7)))%(W+60)-30,sy=(n*47+Math.floor(elapsed*(n%3+7)))%420,sz=n%4===0?2:1;px(sx,sy,sz,sz,'rgba(237,247,250,'+(n%3===0?.72:.42)+')');}
    var vg=ctx.createRadialGradient(W*.5,230,90,W*.5,250,600);vg.addColorStop(.2,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  };
  window.drawGopnikV52=gopnik;
})();
