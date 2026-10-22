// Articulated, procedural ink characters inspired by the supplied concept sheet.
let frame=0, audio;
const paintedAtlas=new Image();paintedAtlas.src='assets/characters-painted.png';
const spriteRegions=[
 {box:[0,145,410,648],polygon:[[0,0],[410,0],[410,256],[365,375],[350,530],[351,793],[0,793]]},
 {box:[350,220,480,573],polygon:[[410,260],[660,210],[830,210],[830,345],[788,420],[760,510],[720,600],[711,793],[351,793],[350,530],[365,375]]},
 {box:[715,290,425,503],polygon:[[830,290],[995,290],[1030,260],[1100,290],[1135,450],[1120,570],[1100,670],[1090,793],[711,793],[720,600],[760,510],[788,420],[830,345]]},
 {box:[1090,30,415,763],polygon:[[1135,30],[1505,30],[1505,400],[1460,480],[1465,793],[1090,793],[1100,670],[1120,570],[1135,450],[1100,290]]},
 {box:[1460,0,523,793],polygon:[[1505,0],[1983,0],[1983,793],[1500,793],[1500,560],[1475,480],[1505,400]]}
];
export function paintPortraits(){
 const draw=()=>document.querySelectorAll('.hero-portrait').forEach(canvas=>{
 const i=Number(canvas.dataset.hero),r=spriteRegions[i],[sx,sy,sw,sh]=r.box,c=canvas.getContext('2d');
 canvas.width=200;canvas.height=280;c.clearRect(0,0,200,280);
 const scale=Math.min(190/sw,270/sh);c.translate((200-sw*scale)/2,280-sh*scale);c.scale(scale,scale);
 c.beginPath();r.polygon.forEach(([x,y],j)=>j?c.lineTo(x-sx,y-sy):c.moveTo(x-sx,y-sy));c.closePath();c.clip();c.drawImage(paintedAtlas,sx,sy,sw,sh,0,0,sw,sh);
 });
 if(paintedAtlas.complete&&paintedAtlas.naturalWidth)draw();else paintedAtlas.addEventListener('load',draw,{once:true});
}
export function sound(kind,enabled){if(!enabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.type=kind==='magic'?'sine':'triangle';o.frequency.setValueAtTime(kind==='magic'?660:180,audio.currentTime);o.frequency.exponentialRampToValueAtTime(kind==='magic'?220:45,audio.currentTime+.25);g.gain.setValueAtTime(.09,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.3);o.start();o.stop(audio.currentTime+.31);}catch{}}
export function stopScene(){cancelAnimationFrame(frame);}
export function mountScene(canvas,state,getEvent){
 stopScene();const c=canvas.getContext('2d');const W=1100,H=470;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const colors=['#cf5937','#438bbb','#668d4b','#c3a34d'];
 function path(points,stroke='#292b32',width=3,fill=null,close=false){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));if(close)c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}}
 function ellipse(x,y,rx,ry,fill,stroke='#292b32',line=3){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
 function text(t,x,y,size=16,color='#383b34'){c.font=`700 ${size}px "Gaegu",sans-serif`;c.textAlign='center';c.fillStyle=color;c.fillText(t,x,y);}
 function glow(x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 function paintedCharacter(i,x,y,t,pose=0,dead=false,hit=false){
  if(!paintedAtlas.complete||!paintedAtlas.naturalWidth)return;
  const region=spriteRegions[i], [sx,sy,sw,sh]=region.box;
  const height=i===4?264:i===3?225:175,scale=height/sh;
  c.save();c.translate(x,y);if(!reduced)c.translate(0,Math.sin(t*2.4+i)*2);
  if(dead){c.globalAlpha=.28;c.rotate(i===4?.18:-.8);}
  else if(pose)c.rotate((i===4?-.06:.12)*pose);
  if(hit)c.filter='brightness(1.45)';
  ellipse(0,4,i===4?76:39,i===4?10:6,'#45384922',null);
  c.scale(scale*(1+(reduced?0:Math.sin(t*2+i)*.007)),scale);
  c.translate(-sw/2,-sh);
  c.beginPath();region.polygon.forEach(([px,py],j)=>j?c.lineTo(px-sx,py-sy):c.moveTo(px-sx,py-sy));c.closePath();c.clip();
  c.drawImage(paintedAtlas,sx,sy,sw,sh,0,0,sw,sh);c.restore();
 }
 function hero(i,x,y,t,pose=0,dead=false,guard=false){
  paintedCharacter(i,x,y,t,pose,dead);
  if(guard){ellipse(x,y-78,55,92,'#86c9e51c','#75aeba',2);text('◇',x,y-183,25,'#438bbb');}
 }
 function boss(x,y,t,hit,attack,dead){
  c.save();if(hit&&!reduced)c.translate(Math.sin(t*90)*5,0);paintedCharacter(4,x+15,y,t,attack,dead,hit);c.restore();
 }
 function draw(now){if(!canvas.isConnected)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);c.clearRect(0,0,W,H);const t=now/1000;const ev=getEvent();const dt=ev?(now-ev.start)/1000:0;const attacking=ev&&ev.action!=='guard';const impact=attacking&&dt>.53&&dt<.88;const counter=ev?.counter&&dt>1.25&&dt<2.05;
 if((impact||counter)&&!reduced)c.translate(Math.sin(t*80)*(counter?4:2),Math.cos(t*70)*2);
 c.fillStyle='#f6f1e3';c.fillRect(-10,-10,W+20,H+20);for(let y=16;y<H;y+=30)path([[0,y],[W,y]],'#9fafa72d',1);
 path([[46,0],[46,H]],'#c27f7455',1);for(let y=45;y<H;y+=88)ellipse(20,y,6,6,'#dfdbcf',null);
 // Sketched woodland, distant notebook castle, and uneven pencil ground.
 c.save();c.globalAlpha=.17;for(let i=0;i<11;i++){const x=80+i*99,y=230+(i%3)*15;path([[x,y],[x+4,y-115],[x-35,y-65],[x+2,y-80],[x+33,y-44],[x+6,y-55]],'#556b5c',2);}
 path([[800,210],[800,105],[817,105],[817,81],[833,81],[833,105],[851,105],[851,210]],'#514a68',2);path([[863,210],[863,128],[886,128],[886,60],[901,37],[919,61],[919,128],[943,128],[943,210]],'#514a68',2);c.restore();
 for(let i=0;i<4;i++)path([[60,389+i*3],[280,383+i*5],[545,389+i*2],[800,385+i*4],[1050,389+i*3]],'#6e6b5444',1);
 const bx=835,by=337;glow(bx,by-70,150,'#a58bbb24');boss(bx,by,t,impact,counter?Math.sin((dt-1.25)*5):0,state.enemy.hp===0);
 const positions=[[145,342],[270,295],[356,385],[480,323]];
 for(let i=0;i<4;i++){let [x,y]=positions[i];let pose=0;if(ev?.actor===i&&attacking){const progress=Math.max(0,Math.min(1,dt/.4));const back=dt>.85?Math.max(0,1-(dt-.85)/.35):1;if(i===0||i===3){x+=(bx-135-x)*Math.sin(progress*Math.PI/2)*back;y+=(by-y)*progress*back;}pose=dt>.3&&dt<.85?Math.sin((dt-.3)/.55*Math.PI):0;}
  if(state.turn===i&&state.status==='playing'){ellipse(x,y+9,44,9,'#859b4a22','#839950',1.5);if(!ev)text('▼',x,y-165+(reduced?0:Math.sin(t*4)*3),16,'#6b7f45');}
  hero(i,x,y,t,pose,state.party[i].hp===0,state.party[i].guard||(ev?.actor===i&&ev.action==='guard'));text(state.party[i].name,x,y+29,13,colors[i]);
  if(counter&&state.party[i].hp>0){const dmg=ev.damageTaken[i];glow(x,y-60,65,'#76519d55');text(`−${dmg}`,x,y-110-(dt-1.25)*40,26,'#87519c');}
 }
 if(ev){const col=colors[ev.actor];if(ev.action==='guard'){glow(...positions[ev.actor],80,'#78bbc544');text('GUARD · MP +5',positions[ev.actor][0],positions[ev.actor][1]-180,18,'#4a8b9d');}
 else if(dt>.3&&dt<1.08){const p=Math.min(1,(dt-.3)/.3);c.save();c.globalAlpha=Math.min(1,(1.08-dt)*4);if(ev.actor===0||ev.actor===3){c.translate(bx,by-100);c.rotate(-.7);for(let k=0;k<3;k++){c.beginPath();c.ellipse(0,0,90+k*12,40+k*4,0,Math.PI*.1,Math.PI*(.1+p*1.3));c.strokeStyle=[col,'#ffdb8c','#fff7d2'][k];c.lineWidth=ev.action==='skill'?14-k*4:6-k;c.stroke();}}
 if(ev.actor===1){const [x,y]=positions[1];const px=x+(bx-x)*p,py=y-100+(by-y)*p;glow(px,py,ev.action==='skill'?90:45,'#43bafb99');ellipse(px,py,ev.action==='skill'?24:13,ev.action==='skill'?24:13,'#e0faff','#59bae5',4);for(let k=0;k<6;k++){const a=t*5+k*Math.PI/3;path([[px+Math.cos(a)*40,py+Math.sin(a)*40],[px+Math.cos(a)*53,py+Math.sin(a)*53]],'#68bfe5',3);}}
 if(ev.actor===2){const [x,y]=positions[2];for(let k=0;k<(ev.action==='skill'?3:1);k++){const px=x+(bx-x)*p,py=y-100+(by-y)*p+k*17-17;path([[px-90,py+12],[px,py]],'#6f984d',3);path([[px-13,py-6],[px,py],[px-10,py+10]],'#42693b',3);}}
 c.restore();if(impact){glow(bx,by-100,100,col+'66');text(`−${ev.damage}`,bx,by-220-(dt-.53)*55,35,col);for(let k=0;k<14;k++){const a=k*2.4,r=(dt-.53)*220;path([[bx+Math.cos(a)*r,by-100+Math.sin(a)*r],[bx+Math.cos(a)*(r+14),by-100+Math.sin(a)*(r+14)]],col,3);}}}
 if(counter){const p=(dt-1.25)/.8;for(let k=0;k<3;k++){c.beginPath();c.ellipse(bx-250*p,by-80,100+p*420+k*17,30+p*90,0,0,Math.PI*2);c.strokeStyle=`rgba(103,68,139,${(1-p)*.7})`;c.lineWidth=7-k*2;c.stroke();}text(ev.heavy?'잉크 폭발!':'잉크 파동!',550,100,26,'#75508c');}
 }
 if(state.status==='victory'){for(let k=0;k<22;k++){const x=(k*83+Math.sin(t+k)*20)%W,y=(t*30+k*37)%H;text('✧',x,y,15,colors[k%4]);}}
 frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);
}
