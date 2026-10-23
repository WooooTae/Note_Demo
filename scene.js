import {actionPose,ACTION_SECONDS,SKETCH_SECONDS,SKETCH_STAGGER,ENTRANCE_SECONDS,ERASE_SECONDS} from './animation.js';
let frame=0,audio;
const doodleAtlas=new Image();doodleAtlas.src='assets/heroes-doodle.png';
const summonsAtlas=new Image();summonsAtlas.src='assets/summons-doodle.png';
const duoAtlas=new Image();duoAtlas.src='assets/blade-gunner.png';
const duoBoxes=[[15,85,835,755],[940,85,825,755]];
const atlasFor=id=>id<6?doodleAtlas:id<8?summonsAtlas:duoAtlas;
const boxFor=id=>id<6?heroBoxes[id]:id<8?extraBoxes[id-6]:duoBoxes[id-8];
const extraBoxes=[[20,75,490,445],[550,65,485,455],[1070,185,455,335],[35,535,475,470],[540,550,480,450]];
const doodleBoss=new Image();doodleBoss.src='assets/boss-doodle.png';
const heroBoxes=[[20,45,545,475],[565,35,475,485],[1070,130,460,390],[15,545,600,440],[615,550,425,440],[1075,575,445,410]];
const heroHeights=[166,174,151,175,166,151,166,166,170,162];
const palettes=[['#ed5d20','#ffad26','#fff0ac'],['#268adb','#7be7ff','#f1ffff'],['#4f9846','#a5da57','#f1ffc6'],['#dca32a','#ffe177','#fffbe0'],['#ce7198','#f5b7cc','#fff1f6'],['#7240a5','#c396ff','#f4e9ff'],['#218f92','#79e7dc','#f2ffff'],['#843caf','#d28bff','#f9e6ff'],['#4e49be','#69d9ff','#f4f5ff'],['#c57929','#ffd071','#fff7d9']];
const limit=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=v=>1-Math.pow(1-limit(v),3);
export function paintPortraits(){
 const draw=()=>document.querySelectorAll('.hero-portrait').forEach(canvas=>{
  const id=Number(canvas.dataset.hero),atlas=atlasFor(id);if(!atlas.naturalWidth)return;
  const [sx,sy,sw,sh]=boxFor(id);canvas.width=220;canvas.height=270;const c=canvas.getContext('2d'),scale=Math.min(212/sw,244/sh);c.clearRect(0,0,220,270);
  if(id===3){const xx=(220-sw*scale)/2,yy=264-sh*scale;c.beginPath();[[0,0],[600,0],[600,145],[475,195],[475,440],[0,440]].forEach(([a,b],j)=>j?c.lineTo(xx+a*scale,yy+b*scale):c.moveTo(xx+a*scale,yy+b*scale));c.closePath();c.clip();}
  c.drawImage(atlas,sx,sy,sw,sh,(220-sw*scale)/2,264-sh*scale,sw*scale,sh*scale);
 });
 draw();for(const atlas of [doodleAtlas,summonsAtlas,duoAtlas])if(!atlas.complete)atlas.addEventListener('load',draw,{once:true});
}
export function sound(kind,enabled){
 if(!enabled)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const now=audio.currentTime;
 for(let i=0;i<(kind==='magic'?3:1);i++){const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.type=kind==='magic'?'sine':'triangle';o.frequency.setValueAtTime((kind==='magic'?480+i*210:220),now+i*.06);o.frequency.exponentialRampToValueAtTime(kind==='magic'?180:45,now+.22+i*.06);g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(.055,now+.02+i*.06);g.gain.exponentialRampToValueAtTime(.0001,now+.32+i*.06);o.start(now);o.stop(now+.4+i*.06);}
 }catch{}
}
export function stopScene(){cancelAnimationFrame(frame);}
function line(c,points,color='#24232c',width=2,fill=null,closed=false){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));if(closed)c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(color){c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}}
function oval(c,x,y,rx,ry,fill=null,stroke=null,width=2){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function letters(c,text,x,y,size=18,color='#37343b'){c.textAlign='center';c.font=`700 ${size}px "Notebook Hand", "Gaegu", "Malgun Gothic", sans-serif`;c.lineJoin='round';c.strokeStyle='#fbf7e9';c.lineWidth=3;c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
function radiance(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,Math.max(1,r));g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function spark(c,x,y,r,color,angle=0){c.save();c.translate(x,y);c.rotate(angle);line(c,[[0,-r],[r*.18,-r*.18],[r,0],[r*.18,r*.18],[0,r],[-r*.18,r*.18],[-r,0],[-r*.18,-r*.18]],null,0,color,true);c.restore();}
function seeded(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function createBackdrop(){
 const bg=document.createElement('canvas');bg.width=1100;bg.height=500;const c=bg.getContext('2d'),rnd=seeded(391);
 c.fillStyle='#eeeee7';c.fillRect(0,0,1100,500);
 for(let y=15;y<500;y+=30)line(c,[[0,y],[1100,y+Math.sin(y)*1.5]],'#8199b640',1);
 line(c,[[46,0],[44,500]],'#b76e6666',1);
 for(let i=0;i<7500;i++){const x=rnd()*1100,y=rnd()*500;c.fillStyle=`rgba(99,83,57,${rnd()*.05})`;c.fillRect(x,y,1+rnd()*2,1);}
 for(let i=0;i<12;i++){c.save();c.globalAlpha=.08;c.translate(rnd()*1100,rnd()*500);c.rotate(rnd()*4);line(c,[[-250,-18],[-80,-5],[10,0],[180,30],[310,25]],'#796e62',1);line(c,[[-250,-15],[-80,-2],[10,3],[180,33],[310,28]],'#ffffff',2);c.restore();}
 for(let y=40;y<500;y+=80){oval(c,20,y,6,6,'#cbc4b5');line(c,[[0,y-4],[24,y-6],[25,y+3],[0,y+6]],'#656466',3);}
 c.save();c.globalAlpha=.16;
 // Long, irregular pencil contours form the distant hills and trees.
 for(let pass=0;pass<2;pass++){c.beginPath();c.moveTo(45,242+pass*3);for(let x=45;x<1100;x+=12)c.lineTo(x,220+Math.sin(x*.009)*22+Math.sin(x*.034)*7+pass*3);c.strokeStyle='#7a8190';c.lineWidth=.9;c.stroke();}
 for(let n=0;n<17;n++){
  const x=55+n*67,y=235+Math.sin(n)*16,h=50+rnd()*78;
  line(c,[[x,y],[x+3,y-h]],'#667b88',1.2);
  if(n%3!==1){for(let k=0;k<5;k++){const yy=y-h+k*h*.19,spread=10+k*6;line(c,[[x-3,yy-14],[x-spread,yy+17],[x-8,yy+13],[x-spread-5,yy+31],[x,yy+19],[x+spread,yy+29],[x+spread-4,yy+14],[x+3,yy-14]],'#687c86',1.1);for(let j=0;j<4;j++)line(c,[[x-spread+j*5,yy+15+j*2],[x-4+j*3,yy+6+j*3]],'#84909a',.7);}}
  else{c.beginPath();for(let k=0;k<42;k++){const a=k/41*Math.PI*2,r=26+Math.sin(k*2.5)*6;const px=x+Math.cos(a)*r,py=y-h*.65+Math.sin(a)*r*1.3;k?c.lineTo(px,py):c.moveTo(px,py);}c.strokeStyle='#6d7e8b';c.lineWidth=1.2;c.stroke();line(c,[[x,y],[x-2,y-h*.6],[x-12,y-h*.7]],'#6d7e8b',1);}
 }
 // A small sketched castle on the far page.
 line(c,[[885,206],[885,110],[900,110],[900,86],[913,86],[913,110],[929,110],[929,206]],'#69718b',1.6);
 line(c,[[950,203],[950,120],[967,120],[967,68],[979,45],[992,70],[992,120],[1010,120],[1010,206]],'#69718b',1.6);
 for(let x=892;x<1004;x+=17)for(let y=140;y<193;y+=19)line(c,[[x,y],[x+5,y-4],[x+5,y+6]],'#7c8498',.8);
 c.restore();
 for(let k=0;k<4;k++){c.beginPath();c.moveTo(55,423+k*3);for(let x=55;x<1080;x+=18)c.lineTo(x,423+k*3+Math.sin(x*.018)*2);c.strokeStyle='#59554c66';c.lineWidth=k===0?1.5:.7;c.stroke();}
 for(let k=0;k<95;k++){const x=55+rnd()*1020,y=300+rnd()*120;line(c,[[x,y],[x+6+rnd()*12,y-1]],'#4b494321',.8);}
 return bg;
}
let backdrop;
const pencilCache=new WeakMap();
function pencilAtlas(source){
 if(!source.naturalWidth)return source;
 if(!pencilCache.has(source)){const layer=document.createElement('canvas');layer.width=source.naturalWidth;layer.height=source.naturalHeight;layer.naturalWidth=layer.width;const brush=layer.getContext('2d');brush.filter='grayscale(.88) contrast(.85)';brush.drawImage(source,0,0);pencilCache.set(source,layer);}
 return pencilCache.get(source);
}
function tapeStrips(c,x,y,amount=1,peel=0){
 for(let n=0;n<2;n++){c.save();c.translate(x+(n?1:-1)*peel*65,y-peel*75);c.rotate((n?.43:-.43)+(n?1:-1)*peel*.8);c.globalAlpha*=1-peel;c.beginPath();const w=155*amount;c.moveTo(-w/2,-15);for(let k=0;k<6;k++)c.lineTo(-w/2+k*3,-15+k%2*3);c.lineTo(w/2,-15);c.lineTo(w/2-3,-10);c.lineTo(w/2,0);c.lineTo(w/2-3,10);c.lineTo(w/2,15);c.lineTo(-w/2,15);c.closePath();c.shadowColor='#534c3430';c.shadowBlur=3;c.shadowOffsetY=2;c.fillStyle='#d7c694b8';c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.strokeStyle='#a89b7877';c.lineWidth=1;c.stroke();line(c,[[-w/2+9,-8],[w/2-8,-8]],'#fffbea90',2);for(let k=0;k<5;k++)line(c,[[-w/2+12+k*25,9],[-w/2+17+k*25,12]],'#b7aa8555',.8);c.restore();}
}

function drawDoodle(c,id,x,y,time,pose={},alpha=1){
 const atlas=pencilAtlas(atlasFor(id));if(!atlas.naturalWidth)return;
 const [sx,sy,sw,sh]=(boxFor(id)),h=heroHeights[id],scale=h/sh;
 const bob=pose.still?0:Math.sin(time*3.3+id)*1.7;
 c.save();c.globalAlpha*=alpha;c.translate(x,y+bob);
 if(pose.dead){c.globalAlpha*=.27;c.rotate(-1.15);}
 c.rotate(pose.rotation||0);c.scale(pose.scaleX||1,pose.scaleY||1);
 // Render a continuous paper puppet mesh: upper-body lean and cape sway
 // vary across strips, while the feet remain anchored to the ground.
 const strips=24,bend=(pose.bend||0)+(pose.still?0:Math.sin(time*2.2+id)*1.3);
 const w=sw*scale;
 if(id===3){c.beginPath();[[0,0],[600,0],[600,145],[475,195],[475,440],[0,440]].forEach(([a,b],j)=>j?c.lineTo(-w/2+a*scale,-h+b*scale):c.moveTo(-w/2+a*scale,-h+b*scale));c.closePath();c.clip();}
 for(let j=0;j<strips;j++){const v=j/strips,sourceH=Math.min(sh-j*sh/strips,sh/strips+.6),shift=bend*Math.pow(1-v,1.6);c.drawImage(atlas,sx,sy+j*sh/strips,sw,sourceH,-w/2+shift,-h+j*h/strips,w,sourceH*scale+.2);}
 c.restore();
}
function drawExtra(c,index,x,y,height,time,dead=false,rotation=0){
 if(!summonsAtlas.naturalWidth)return;const [sx,sy,sw,sh]=extraBoxes[index],w=height*sw/sh;c.save();c.translate(x,y);c.rotate(rotation);if(dead)c.globalAlpha=.18;
 if(index===2&&!dead)c.scale(1+Math.sin(time*3)*.035,1-Math.sin(time*3)*.045);
 oval(c,0,4,w*.3,5,'#44364c22');c.drawImage(pencilAtlas(summonsAtlas),sx,sy,sw,sh,-w/2,-height,w,height);c.restore();
}
function drawInkKing(c,x,y,time,recoil=0,swing=0,dead=false,still=false){
 if(!doodleBoss.naturalWidth)return;
 c.save();c.translate(x+recoil*12,y);if(dead){c.globalAlpha=.22;c.rotate(.18);}else c.rotate(swing*-.13);
 oval(c,10,5,90,10,'#40304424');const h=270,w=290;
 for(let k=0;k<26;k++){const v=k/26,shift=still?0:Math.sin(time*2.4+v*5)*(1-v)*5;const sourceY=70+v*1130,sourceH=Math.min(1130-v*1130,1130/26+1);c.drawImage(pencilAtlas(doodleBoss),0,sourceY,1254,sourceH,-w*.42+shift,-h+v*h,w,sourceH/1130*h+.3);}
 c.restore();
}
function ring(c,x,y,r,color,time,alpha=1){
 c.save();c.translate(x,y);c.scale(1,.35);c.rotate(time*.8);c.globalAlpha*=alpha;
 for(const size of [r,r*.76])oval(c,0,0,size,size,null,color,2);
 for(let k=0;k<10;k++){const a=k*Math.PI/5;line(c,[[Math.cos(a)*r*.76,Math.sin(a)*r*.76],[Math.cos(a)*r,Math.sin(a)*r]],color,1.5);}
 c.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI*.8;c.lineTo(Math.cos(a)*r*.65,Math.sin(a)*r*.65);}c.closePath();c.strokeStyle=color;c.lineWidth=1.5;c.stroke();c.restore();
}
function spray(c,x,y,age,palette,count=40,power=1){
 if(age<0||age>1)return;const fade=1-age;const rnd=seeded(811);
 c.save();c.globalAlpha*=fade;
 for(let k=0;k<count;k++){const a=rnd()*Math.PI*2,speed=(45+rnd()*180)*power,px=x+Math.cos(a)*speed*age,py=y+Math.sin(a)*speed*age+age*age*55,sz=2+rnd()*6;const color=palette[k%palette.length];if(k%4===0)spark(c,px,py,sz*(1-age*.4),color,a);else line(c,[[px,py],[px-Math.cos(a)*sz*3,py-Math.sin(a)*sz*3]],color,1+rnd()*3);}
 c.restore();
}
function slash(c,x,y,progress,palette,rotation=-.65,size=1,alpha=1){
 const p=limit(progress);c.save();c.translate(x,y);c.rotate(rotation);c.scale(size,size);c.globalAlpha*=alpha;
 const start=-Math.PI*.75,end=start+Math.PI*1.55*p;
 for(let layer=0;layer<3;layer++){c.beginPath();c.ellipse(0,0,116+layer*5,60+layer*4,0,start,end);c.strokeStyle=palette[layer];c.lineWidth=24-layer*8;c.shadowColor=palette[0];c.shadowBlur=layer===0?12:0;c.stroke();}
 c.shadowBlur=0;
 for(let k=0;k<14;k++){const a=start+(end-start)*k/14,r=120+(k%3)*9;line(c,[[Math.cos(a)*r,Math.sin(a)*67],[Math.cos(a-.11)*(r+28),Math.sin(a-.11)*84]],palette[k%3],2);}
 c.restore();
}
// Clip only the sprite layer: erasing never covers notebook lines or other characters.
function paperSprite(c,box,birth,death,draw,tools){
 const erasing=death!==null,progress=erasing?limit(death):limit(birth);
 if(erasing&&progress>=1||!erasing&&progress<=0)return;
 if(!erasing&&progress>=1){draw();return;}
 const {x,y,w,h}=box,rows=Math.ceil(h/19),rowH=h/rows,scan=progress*rows,row=Math.min(rows-1,Math.floor(scan)),fraction=scan-row;
 const tipX=x+(row%2?1-fraction:fraction)*w,tipY=y+(row+.5)*rowH;
 c.save();c.beginPath();
 if(erasing){
  c.rect(x,y+(row+1)*rowH,w,h-(row+1)*rowH+2);
  c.rect(row%2?x:tipX,y+row*rowH,row%2?tipX-x:x+w-tipX,rowH);
 }else{
  c.rect(x,y,w,row*rowH);
  c.rect(row%2?tipX:x,y+row*rowH,row%2?x+w-tipX:tipX-x,rowH);
 }
 c.clip();draw();c.restore();tools.push({x:tipX,y:tipY,erasing,progress});
}
function paperTool(c,tool,time){
 const {x,y,erasing,progress}=tool;c.save();c.translate(x,y);
 // Short graphite strokes / eraser crumbs travel with the contact point.
 for(let k=0;k<9;k++){const dx=Math.sin(k*2.3+time*9)*22,dy=6+(k*7+time*35)%24;c.globalAlpha=.65*(1-dy/40);line(c,[[dx,dy],[dx+3,dy+2]],erasing?'#b0a392':'#625b52',erasing?2.8:1);}
 c.globalAlpha=1;
 if(erasing){c.rotate(-.18+Math.sin(progress*58)*.12);c.shadowColor='#40362f33';c.shadowBlur=4;c.shadowOffsetY=4;c.beginPath();c.roundRect(-25,-18,53,29,5);c.fillStyle='#edb1ad';c.fill();c.strokeStyle='#665451';c.lineWidth=2;c.stroke();c.shadowBlur=0;c.shadowOffsetY=0;c.fillStyle='#f8eee0';c.fillRect(-7,-17,19,27);line(c,[[-6,-12],[10,-12]],'#b9aa98',1);line(c,[[-20,5],[-12,5]],'#d58f91',2);}
 else{c.rotate(.62+Math.sin(time*22)*.035);line(c,[[0,0],[-7,-19],[7,-19]],'#514638',1.6,'#d7b68a',true);line(c,[[0,0],[-2,-6],[2,-6]],'#302d29',1,'#302d29',true);line(c,[[-7,-19],[-7,-88],[7,-88],[7,-19]],'#655034',1.8,'#efbc49',true);line(c,[[-2,-20],[-2,-86]],'#ffde83',3);line(c,[[-7,-82],[7,-82]],'#827d72',6);line(c,[[-7,-87],[-7,-99],[7,-99],[7,-87]],'#765e59',1.5,'#d9908b',true);}
 c.restore();
}
export function mountScene(canvas,state,getEvent,onTarget,entrance=false){
 stopScene();backdrop??=createBackdrop();const c=canvas.getContext('2d'),W=1100,H=500,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const leadKind=state.enemy.kind,leadHeight=leadKind==='boss'?260:leadKind==='epic'?210:130;
 const positions=[[110,385],[270,357],[425,385],[570,357]],enemyPositions=[[865,350],[730,421],[1010,420]];
 canvas.onclick=e=>{if(getEvent()||state.status!=='playing'||entrance&&!reduced&&(performance.now()-born)/1000<ENTRANCE_SECONDS)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;for(const id of [1,2,0]){const [ex,ey]=enemyPositions[id],w=id===0?125:72,h=id===0?leadHeight:130;if(state.enemies[id].hp>0&&x>ex-w&&x<ex+w&&y>ey-h&&y<ey+20){onTarget?.(id);break;}}};
 const born=performance.now();
 let impactSound=false,counterSound=false,lastEvent=null;
 function draw(now){
  if(!canvas.isConnected)return;
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),pw=Math.round(rect.width*dpr),ph=Math.round(rect.height*dpr);
  if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
  c.setTransform(pw/W,0,0,ph/H,0,0);c.clearRect(0,0,W,H);
  const tools=[],introAge=(now-born)/1000;
  const birth=i=>entrance&&!reduced?(introAge-i*SKETCH_STAGGER)/SKETCH_SECONDS:1;
  const death=(side,i)=>{const at=getEvent()?.removals?.[side][i];return at===null||at===undefined?null:(now-getEvent().start)/1000<at?null:reduced?1:((now-getEvent().start)/1000-at)/ERASE_SECONDS;};
  const t=now/1000,ev=getEvent(),dt=ev?Math.max(0,(now-ev.start)/1000):0;
  if(ev!==lastEvent){lastEvent=ev;impactSound=false;counterSound=false;}
  if(ev&&dt>=.6&&!ev.previewed){ev.previewed=true;ev.onImpact?.();}if(ev?.summonAttack&&dt>=1.12&&!ev.summonPreviewed){ev.summonPreviewed=true;ev.onSummon?.();}if(ev?.counter&&dt>=ACTION_SECONDS+.39&&!ev.counterPreviewed){ev.counterPreviewed=true;ev.onCounter?.();}
  const pose=ev?actionPose(dt,ev.kind,ev.action):null,heal=ev?.kind==='heal'&&ev.action==='skill',attack=ev&&!['guard','skip'].includes(ev.action)&&!heal;
  const age=dt-.60,enemyT=ev?.counter?dt-ACTION_SECONDS:-1,enemyHit=enemyT>=.39&&enemyT<.8;
  const palette=ev?palettes[state.party[ev.actor].id]:palettes[0],skill=ev?.action==='skill';
  const target=ev?.target??state.target,[bx,by]=enemyPositions[target],[kingX,kingY]=enemyPositions[0],tx=bx-15,ty=by-(target===0?leadHeight*.46:65);
  const enemyHP=ev?.summonPreviewed?ev.afterSupport:ev?.previewed?ev.afterAction:state.enemies.map(e=>e.hp),bossStrikes=(leadKind==='boss'||leadKind==='epic')&&ev?.enemyStrikes.some(hit=>hit.enemy===0);
  c.save();
  if(!reduced){const shake=attack&&age>=0&&age<.22?(1-age/.22)*(skill?5:2):enemyHit?(1-limit((enemyT-.39)/.4))*(ev.heavy?6:3):0;c.translate(Math.sin(now*.09)*shake,Math.cos(now*.12)*shake*.6);}
  c.drawImage(backdrop,0,0);
  // Atmospheric drifting pencil flecks, kept sparse to leave the characters clear.
  if(!reduced)for(let k=0;k<13;k++){const x=(k*93+t*9)%W,y=190+Math.sin(t*.6+k)*55;spark(c,x,y,1.4,'#b7aa8580',k+t*.2);}

  if(skill&&dt<.6){c.save();c.globalAlpha=Math.sin(limit(dt/.6)*Math.PI)*.09;c.fillStyle=palette[0];c.fillRect(0,0,W,H);c.restore();}
  if(bossStrikes&&enemyT>=0&&enemyT<.5)ring(c,kingX,kingY-5,60+enemyT*90,'#704393',-t,1);
  const recoil=attack&&age>=0&&age<.5?Math.sin(age*23)*Math.exp(-age*5):0;
  if(state.enemy.hp>0)paperSprite(c,leadKind==='boss'?{x:kingX-150,y:kingY-285,w:335,h:303}:{x:kingX-(leadKind==='epic'?120:100),y:kingY-leadHeight-10,w:leadKind==='epic'?240:200,h:leadHeight+28},birth(4),death('enemies',0),()=>{
  if(leadKind==='boss')drawInkKing(c,kingX,kingY,t,reduced||target!==0?0:recoil,bossStrikes&&enemyT>=0?Math.sin(limit(enemyT/.7)*Math.PI):0,false,reduced);
  else{
   const striking=ev?.enemyStrikes.some(h=>h.enemy===0)&&enemyT>=.2&&enemyT<.9;
   const leap=striking&&!reduced?Math.sin(limit((enemyT-.2)/.7)*Math.PI):0;
   if(leadKind==='epic'){radiance(c,kingX,kingY-90,145,'#a750da44');ring(c,kingX,kingY,75,'#9e61c4',t*.3,.7);for(let k=0;k<5;k++)spark(c,kingX+Math.sin(t+k*1.2)*72,kingY-90+Math.cos(t+k*1.2)*90,4,'#b77adb',t);}
   drawExtra(c,leadKind==='slime'?2:3,kingX-leap*35+(target===0&&!reduced?recoil*7:0),kingY-leap*20,leadHeight,t,false,0);
   letters(c,leadKind==='epic'?'✦ EPIC · 해골 대장':'먹물 슬라임',kingX,kingY+22,13,leadKind==='epic'?'#8b4ca8':'#67546f');
  }
  },tools);
  for(const id of [1,2]){let [ex,ey]=enemyPositions[id];const hit=target===id&&attack&&age>=0&&age<.4;const striking=ev?.enemyStrikes.some(h=>h.enemy===id)&&enemyT>=.2&&enemyT<.9;
   if(striking&&!reduced){const leap=Math.sin(limit((enemyT-.2)/.7)*Math.PI);ex-=leap*32;ey-=leap*16;}
   if(hit&&!reduced)ex+=Math.sin(age*30)*7;
   if(state.enemies[id].hp>0)paperSprite(c,{x:ex-82,y:ey-(id===1?108:142),w:164,h:id===1?125:160},birth(4+id),death('enemies',id),()=>drawExtra(c,id===1?2:3,ex,ey,id===1?95:130,t,false,hit?Math.sin(age*30)*.07:0),tools);
   letters(c,state.enemies[id].name,ex,ey+18,10,enemyHP[id]?'#67546f':'#a99da4');
   c.fillStyle='#5e4c6555';c.fillRect(ex-33,ey+23,66,5);c.fillStyle='#ab5967';c.fillRect(ex-33,ey+23,66*enemyHP[id]/state.enemies[id].maxHp,5);
  }
  if(state.status==='playing'&&!ev&&enemyHP[state.target]>0){const [ex,ey]=enemyPositions[state.target];oval(c,ex,ey+7,state.target===0?75:46,9,'#bd676416','#b05e68',1.5);letters(c,'▼ 공격 대상',ex,ey-(state.target===0?leadHeight+10:state.target===1?108:143),12,'#a64b5c');}

  if(attack&&age>=0&&age<.15){c.save();c.globalAlpha=(1-age/.15)*.35;radiance(c,tx,ty,120,palette[2]);c.restore();}
  const drawn=[];
  const drawOrder=[0,1,2,3].filter(i=>i!==ev?.actor);if(ev)drawOrder.push(ev.actor);
  for(const i of drawOrder){
   const hero=state.party[i],id=hero.id,[ox,oy]=positions[i];let x=ox,y=oy,rotation=0,bend=0,scaleX=1,scaleY=1;
   const active=ev?.actor===i;
   if(active){
    if(attack){x+=(bx-130-ox)*pose.reach;y+=(by-oy)*pose.reach;x-=pose.wind*12;bend=-pose.wind*10+pose.swing*16;rotation=-pose.wind*.12+pose.swing*.12;scaleX=1+pose.wind*.04;scaleY=1-pose.wind*.07;
     if(!['fire','protect','rogue','runeblade'].includes(ev.kind)){y-=Math.sin(limit(dt/1.4)*Math.PI)*7;bend=pose.swing*6;rotation=-pose.wind*.07;}
     if(hero.effect==='rogue')y-=Math.sin(pose.reach*Math.PI)*15;
    }else if(heal){y-=Math.sin(limit(dt/1.5)*Math.PI)*8;bend=Math.sin(dt*3)*3;}
    else{scaleY=1-Math.sin(limit(dt/1.6)*Math.PI)*.08;bend=-6*Math.sin(limit(dt/1.6)*Math.PI);}
   }
   if(enemyHit&&hero.hp>0&&ev.damageTaken[i]>0&&!reduced){const r=Math.sin((enemyT-.39)*24)*Math.exp(-(enemyT-.39)*6);x-=r*8;rotation-=r*.1;}
   if(reduced){x=active&&attack?ox+(bx-130-ox)*(pose.reach>.1?.45:0):ox;y=oy;rotation=0;bend=0;scaleX=1;scaleY=1;}
   const visibleHero=hero.hp>0&&(death('party',i)===null||death('party',i)<1)&&birth(i)>0;
   if(visibleHero){oval(c,x,y+5,35,5,'#4f493d18');if(hero.guard)ring(c,x,y,44,'#c6a044',t*.3,.65);}
   if(state.turn===i&&state.status==='playing'){oval(c,x,y+7,41,8,'#8e9a4822','#71854d',1.5);if(!ev)letters(c,'▼',x,y-heroHeights[id]-12,15,'#63794a');}
   if(active&&attack&&pose.reach>.08&&!pose.returning&&!reduced){for(let ghost=3;ghost>0;ghost--)drawDoodle(c,id,x-ghost*21,y+ghost*2,t,{bend,rotation,still:true},.05+(3-ghost)*.025);for(let k=0;k<7;k++)line(c,[[x-65-k*14,y-18-k*17],[x-95-k*21,y-17-k*17]],palette[0]+'66',1.5);}
   if(hero.hp>0)paperSprite(c,{x:x-140,y:y-195,w:280,h:215},birth(i),death('party',i),()=>drawDoodle(c,id,x,y,pose?.hitStop?Math.floor(t*8)/8:t,{bend,rotation,scaleX,scaleY,still:reduced||hero.taped}),tools);
   if(visibleHero&&(active&&(ev.action==='guard'||heal||(!attack&&skill))||hero.guard)){const color=heal?'#d779a4':'#d6ad49';oval(c,x,y-75,48,87,color+'0e',color+'aa',2);}
   const tapeHit=ev?.tapeAttack?.target===i&&enemyT>=.3&&!ev.tapeAttack.blocked;
   if(visibleHero&&(hero.taped||tapeHit)){
    const peeling=active&&ev.action==='skip',peel=peeling?limit((dt-.3)/.85):0;
    tapeStrips(c,x,y-85,tapeHit?limit((enemyT-.3)/.3):1,peel);
    if(!ev)letters(c,'테이프 봉인 · 1회',x,y-heroHeights[id]-12,15,'#8b6f3c');
    if(peeling&&dt>.65)letters(c,'테이프를 뗐다!',x,y-185,18,'#766748');
   }
   letters(c,hero.name,x,y+30,12,hero.color);drawn.push([x,y]);
   if(enemyHit&&hero.hp>0&&ev.damageTaken[i]>0){spray(c,x,y-65,(enemyT-.39)*1.8,['#3e2e50','#9770bc','#dfc5ed'],18,.55);letters(c,'−'+ev.damageTaken[i],x,y-155-(enemyT-.39)*50,23,'#70448f');}
  }
  const summonActive=state.summon||(ev?.kind==='summon'&&ev.action==='skill'&&dt>.55?{owner:6,rounds:3}:null);
  if(summonActive){const ownerIndex=state.party.findIndex(p=>p.id===summonActive.owner&&p.hp>0);if(ownerIndex>=0){let [fx,fy]=positions[ownerIndex];fx+=48;fy+=9;const support=ev?.summonAttack;if(support&&dt>.93&&dt<1.58){const [ex,ey]=enemyPositions[support.target],p=dt<1.15?ease((dt-.93)/.22):1-ease((dt-1.3)/.28);fx+=(ex-30-fx)*p;fy+=(ey-fy)*p-Math.sin(p*Math.PI)*40;}drawExtra(c,4,fx,fy-(reduced?0:Math.sin(t*4)*3),55,t);if(!ev)letters(c,'정령 '+summonActive.rounds+'회',fx,fy+13,9,'#398e8d');}}
  if(ev){
   const [sx,sy]=positions[ev.actor];
   if(skill&&dt<.58){const charge=ease(dt/.58);ring(c,sx,sy,30+charge*38,palette[0],t,1);radiance(c,sx,sy-75,40+charge*50,palette[0]+'40');for(let k=0;k<9;k++){const a=k*Math.PI*2/9+t*2,r=70*(1-charge*.6);spark(c,sx+Math.cos(a)*r,sy-80+Math.sin(a)*r,2+charge*2,palette[1],a);}}
   if(ev.tapeAttack&&enemyT>=0&&enemyT<1.15){const [ax,ay]=positions[ev.tapeAttack.target],q=limit(enemyT/.45);if(q<1){const rx=kingX+(ax-kingX)*q,ry=kingY-130+(ay-80-kingY+130)*q-Math.sin(q*Math.PI)*95;oval(c,rx,ry,23,17,'#d9c999','#97855f',3);oval(c,rx,ry,11,8,'#eeeee7','#a08f6e',2);}letters(c,ev.tapeAttack.blocked?'보호로 테이프를 막았다!':'잉크의 왕 · 테이프 봉인!',550,125,25,'#8b7046');if(ev.tapeAttack.blocked&&q===1){ring(c,ax,ay-40,70,'#d0ad61',t,1-limit((enemyT-.45)/.7));}}
   if(ev.action==='guard'&&dt<1.4){const p=ease(dt/.4);ring(c,sx,sy,47,palette[0],t*.5,1);c.save();c.globalAlpha=Math.min(1,(1.6-dt)*3);line(c,[[sx,sy-148],[sx+35,sy-130],[sx+28,sy-77],[sx,sy-53],[sx-28,sy-77],[sx-35,sy-130]],'#e7c46c',3,'#ffe8a922',true);line(c,[[sx,sy-136],[sx,sy-68]],'#fff7d6',3);c.restore();letters(c,'GUARD · MP +5',sx,sy-180,16,'#8f7937');}
   if(attack){
    if(ev.kind==='summon'&&dt>.28&&dt<1.4){const p=ease((dt-.28)/.42),fade=1-limit((dt-.95)/.45);ring(c,sx+45,sy,55,'#35a7a5',-t,fade);radiance(c,sx+45,sy-40,75,'#68e3d65a');if(skill&&dt>.4){const px=sx+50+(tx-sx-50)*p,py=sy-45+(ty-sy+45)*p-Math.sin(p*Math.PI)*65;drawExtra(c,4,px,py,70,t,false,-.13);for(let k=0;k<7;k++)spark(c,px-15-k*12,py-30+Math.sin(k+t)*9,3,'#93f5df',t+k);}else if(!skill){line(c,[[sx,sy-100],[sx+(tx-sx)*p,sy-100+(ty-sy+100)*p]],'#62d5cb',6);}}
    if(ev.kind==='drain'&&dt>.32&&dt<1.42){const p=ease((dt-.32)/.29),fade=1-limit((dt-.98)/.44);c.save();c.globalAlpha=fade;c.beginPath();c.moveTo(sx+35,sy-105);c.bezierCurveTo(sx+130,sy-170,tx-110,ty-100,tx,ty);c.strokeStyle='#59306b';c.lineWidth=skill?12:5;c.stroke();c.strokeStyle='#cf81f0';c.lineWidth=skill?4:2;c.stroke();if(p===1){ring(c,tx,ty+30,65,'#a859cd',t,1);for(let k=0;k<7;k++){const q=((dt-.6)*1.8+k/7)%1;if(q<0)continue;const px=tx+(sx+20-tx)*q,py=ty+(sy-90-ty)*q-Math.sin(q*Math.PI)*55;oval(c,px,py,4,6,'#d4a5ef','#85439d',1);}if(skill&&ev.drain){radiance(c,sx,sy-70,70,'#d09bea44');letters(c,ev.healing[ev.actor]?'+'+ev.healing[ev.actor]:'HP MAX',sx,sy-185,20,'#8850a6');}}c.restore();}
    if(ev.kind==='runeblade'&&dt>.38&&dt<1.4){const p=ease((dt-.38)/.32),fade=1-limit((dt-.96)/.44);ring(c,tx,ty+35,70,'#7563c9',t,fade);slash(c,tx,ty,p,skill?palette:['#9bafbd','#dce8f0','#ffffff'],-.65,skill?1.1:.75,fade);if(skill){for(let k=0;k<6;k++){const a=k*Math.PI/3+t; spark(c,tx+Math.cos(a)*78,ty+Math.sin(a)*64,8*fade,'#8bdfff',a);}line(c,[[tx-75,ty+60],[tx+65*p,ty-80]],'#d4f7ff',3);}}
    if(ev.kind==='gun'&&dt>.30&&dt<1.4){const count=skill?(ev.skillName==='마탄 저격'?1:4):2;for(let k=0;k<count;k++){const q=limit((dt-.32-k*.065)/.26),px=sx+48+(tx-sx-48)*q,py=sy-105+(ty-sy+105)*q+(k%2?8:-8),fade=1-limit((dt-.83-k*.04)/.35);c.save();c.globalAlpha=fade;line(c,[[px-70,py],[px,py]],'#ed9a3c66',skill?9:5);line(c,[[px-28,py],[px,py]],'#fff0af',3);oval(c,px,py,skill&&count===1?11:5,3,'#ffc65e','#8a581f',1);if(q<1)spark(c,sx+48,sy-105,18,'#ffcc69',t+k);c.restore();}if(skill&&age>=0&&age<.6){ring(c,tx,ty,42,palette[0],0,1-age/.6);line(c,[[tx-60,ty],[tx+60,ty]],palette[0],1.5);line(c,[[tx,ty-60],[tx,ty+60]],palette[0],1.5);}}
    if(ev.kind==='fire'&&dt>.45&&dt<1.32){const p=ease((dt-.45)/.35),fade=1-limit((dt-.92)/.4);slash(c,tx,ty,p,skill?['#e95a19','#ffb52e','#fff4b5']:['#a5afb7','#dee7eb','#fffdf5'],-.75,skill?1.15:.8,fade);if(skill){for(let k=0;k<13;k++){const a=-2.8+k*.3,r=130+(k%3)*12;const fx=tx+Math.cos(a)*r,fy=ty+Math.sin(a)*90;c.save();c.globalAlpha=fade;line(c,[[fx,fy],[fx+Math.cos(a)*15,fy-28-(k%4)*6],[fx+10,fy-6],[fx+22,fy-17],[fx+11,fy+8]],null,0,k%2?'#ffb83e':'#f06b20',true);c.restore();}}}
    if((ev.kind==='magic'||ev.kind==='heal')&&dt>.3&&dt<1.25){
     const p=ease((dt-.31)/.31),px=sx+(tx-sx)*p,py=sy-115+(ty-sy+115)*p;const color=ev.kind==='heal'?palettes[4]:palettes[1];
     if(dt<.66){for(let k=7;k>0;k--){const q=limit(p-k*.025);radiance(c,sx+(tx-sx)*q,sy-115+(ty-sy+115)*q,12+(8-k)*2,color[0]+'44');}radiance(c,px,py,skill?65:35,color[0]+'aa');oval(c,px,py,skill?21:11,skill?21:11,color[2],color[1],3);}
     if(age>=0){const r=ease(age/.4)*(skill?125:65);c.save();c.globalAlpha=1-limit(age/.65);for(let k=0;k<3;k++)oval(c,tx,ty,r+k*7,r+k*7,null,color[k],3-k*.6);for(let k=0;k<8;k++){const a=k*Math.PI/4+t*.2;spark(c,tx+Math.cos(a)*r,ty+Math.sin(a)*r,5,color[1],a);}c.restore();}
    }
    if(ev.kind==='arrow'&&dt>.3&&dt<1.25){const count=skill?5:1;for(let k=0;k<count;k++){const travel=limit((dt-.32-k*.045)/.26),endY=ty+(k-(count-1)/2)*19;const px=sx+(tx-sx)*travel,py=sy-100+(endY-sy+100)*travel;c.save();c.globalAlpha=1-limit((dt-.78-k*.03)/.3);line(c,[[px-105,py+4],[px,py]],'#9fcf5b55',9);line(c,[[px-85,py+2],[px,py]],'#6c9e3d',2.5);line(c,[[px-13,py-7],[px+3,py],[px-14,py+8]],'#fff2b4',3);line(c,[[px-70,py],[px-81,py-9],[px-76,py+1],[px-85,py+8]],'#44652c',2);c.restore();}if(skill&&age>=0&&age<.45){c.save();c.globalAlpha=1-age/.45;for(let k=0;k<8;k++)spark(c,tx+Math.sin(k*2.1)*65,ty+Math.cos(k*2.1)*65,7,'#91b84d',k);c.restore();}}
    if(ev.kind==='protect'&&dt>.38&&dt<1.35){const p=ease((dt-.38)/.25),fade=1-limit((dt-.9)/.4);c.save();c.globalAlpha=fade;line(c,[[tx-270,ty+20],[tx+85*p,ty-10]],'#f5bf3177',27);line(c,[[tx-240,ty+17],[tx+85*p,ty-10]],'#ffeb8f',12);line(c,[[tx-170,ty+13],[tx+85*p,ty-10]],'#fffef2',4);spark(c,tx+40,ty,46,'#ffe47e',Math.PI/4);c.restore();if(skill&&ev.guard==='party'&&age>=0)for(const [x,y] of positions){ring(c,x,y,48,'#d6ae38',t,fade);oval(c,x,y-75,48,86,'#f5db6c0d','#e8bf5090',1.5);}}
    if(ev.kind==='rogue'&&dt>.43&&dt<1.4){const fade=1-limit((dt-1)/.4);slash(c,tx-6,ty,ease((dt-.43)/.28),['#4b256e','#b781ef','#fff0ff'],-.7,skill?.95:.7,fade);if(skill&&dt>.63)slash(c,tx+10,ty,ease((dt-.63)/.23),['#5e3291','#d9aaff','#ffffff'],.7,1,fade);}
    if(age>=0&&age<.85){spray(c,tx,ty,age*1.2,palette,skill?48:22,skill?1.1:.65);if(age<.4)radiance(c,tx,ty,100*(1-age/.4),palette[1]+'66');letters(c,'−'+ev.damage,tx,ty-90-ease(age/.8)*28,skill?36:26,palette[0]);}
    if(age>=0&&age<.16&&!reduced){c.save();c.globalAlpha=(1-age/.16)*.1;c.fillStyle=palette[2];c.fillRect(50,95,W-70,H-135);c.restore();}
   }
   if(heal&&dt>.35&&dt<1.5){for(let i=0;i<4;i++){if(state.party[i].hp<=0)continue;const [x,y]=positions[i],p=limit((dt-.35)/1.15),fade=Math.sin(p*Math.PI);radiance(c,x,y-70,95,'#ee9fc74a');ring(c,x,y,50,'#c979a3',-t,fade);c.save();c.globalAlpha=fade;for(let k=0;k<8;k++){const a=k*2.4;const px=x+Math.sin(a+t)*38,py=y-25-(p*110+k*17)%130;oval(c,px,py,3,7,'#edb1c9','#c06f97',.7);spark(c,px+10,py+15,3,'#fff5c9',a);}c.restore();letters(c,ev.healing[i]?'+'+ev.healing[i]:'HP MAX',x,y-170-ease(p)*15,ev.healing[i]?23:13,'#b8628a');}}
   if(skill&&ev.guard&&age>=0&&age<.85){positions.forEach(([x,y],i)=>{if(state.party[i].hp<=0||(ev.guard==='self'&&i!==ev.actor))return;ring(c,x,y,50,palette[0],t,1-age/.85);oval(c,x,y-75,48,86,palette[1]+'11',palette[1]+'aa',2);});}
   if(skill&&ev.area&&age>=0&&age<.85){state.enemies.forEach((e,i)=>{if(i===ev.target||!ev.damageByTarget[i])return;const [x,y]=enemyPositions[i],fy=y-70,fade=1-age/.85;ring(c,x,y-10,62,palette[0],t,fade);spray(c,x,fy,age*1.2,palette,36,1);if(ev.kind==='fire'||ev.kind==='rogue'||ev.kind==='runeblade')slash(c,x,fy,ease(age/.25),palette,-.6,1,fade);else if(ev.kind==='arrow'||ev.kind==='gun'){for(let k=0;k<4;k++)line(c,[[x-55+k*22,fy-100+age*80],[x-20+k*22,fy-15+age*80]],palette[1],3);}else{radiance(c,x,fy,90*fade,palette[1]+'66');spark(c,x,fy,40*fade,palette[1],t);}letters(c,'−'+ev.damageByTarget[i],x,fy-70-ease(age/.8)*28,28,palette[0]);});}
   if(ev.summonAttack&&dt>=1.12&&dt<1.6){const [ex,ey]=enemyPositions[ev.summonAttack.target];spray(c,ex,ey-60,(dt-1.12)*2,['#269e9e','#95ffdf','#edfffa'],22,.65);letters(c,'정령 −'+ev.summonAttack.damage,ex,ey-130-(dt-1.12)*25,18,'#288f8e');}
   if(bossStrikes&&enemyT>=0&&enemyT<1.2){
    if(enemyT<.35){letters(c,leadKind==='epic'?(ev.heavy?'해골 대장의 강공!':'공허의 파동 준비!'):(ev.heavy?'잉크 폭발 준비!':'잉크가 번지고 있다…'),kingX-15,102,18,'#6e448b');radiance(c,kingX,kingY-120,60+enemyT*80,'#8a45b377');}
    if(enemyT>.27){const p=ease((enemyT-.27)/.65),fade=1-limit((enemyT-.8)/.4),ex=kingX-p*640;c.save();c.globalAlpha=fade;
     for(let k=0;k<3;k++)slash(c,ex,kingY-85,p,['#2f2044','#8245bc','#d49cff'],1.1,(ev.heavy?1.7:1.25)+k*.08,.4);
     for(let k=0;k<24;k++){const xx=ex+Math.sin(k*3.2)*90,yy=kingY-120+Math.cos(k*3.2)*125;oval(c,xx,yy,2+k%4,3+k%3,k%2?'#382442':'#78469b');}
     c.restore();if(enemyHit)letters(c,leadKind==='epic'?(ev.heavy?'공허 폭발!':'공허 파동!'):(ev.heavy?'잉크 폭발!':'잉크 파동!'),550,115,27,'#6d3c8c');}
   }
   if(skill&&dt<.58){c.save();c.globalAlpha=Math.min(1,dt/.12)*Math.min(1,(.58-dt)/.12);line(c,[[385,90],[710,90]],'#eee7d3',34);letters(c,ev.skillName||state.party[ev.actor].skill,548,97,21,palette[0]);c.restore();}
   if(enemyHit&&!bossStrikes&&!ev.tapeAttack)letters(c,'몬스터 반격!',550,115,23,'#735087');
   if(attack&&age>=0&&!impactSound){impactSound=true;sound('hit',ev.sound);}
   if(enemyHit&&!counterSound){counterSound=true;sound('hit',ev.sound);}
  }
  for(const tool of tools)paperTool(c,tool,t);
  if(state.status==='victory'){for(let k=0;k<22;k++)spark(c,(k*83+Math.sin(t+k)*20)%W,(t*30+k*37)%H,3+(k%3),palettes[k%6][1],t+k);}
  c.restore();frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);
}
