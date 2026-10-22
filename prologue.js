import {paintPortraits} from './scene.js';

// The child never learns that the notebook comes alive (original story premise).
const prologuePages=[
 {title:'늘 혼자였던 아이',line:'학교에서도, 집에서도 늘 혼자였던 아이.',whisper:'함께 놀 친구가 있다면 좋을 텐데.',art:'텅 빈 교실, 노트 앞에 혼자 앉아 있는 아이'},
 {title:'연필 끝에서 만난 친구들',line:'아이는 매일 공책에 자신만의 친구들을 그렸습니다.',whisper:'용감한 기사도, 신비한 마법사도… 내 친구가 되어줄래?',art:'따뜻한 책상 조명 아래 공책에 작은 용사들을 그리는 아이'},
 {title:'모두가 잠든 밤',line:'그리고 어느 날 밤, 아이가 잠들자…',whisper:'조용한 방 안에서, 종이 넘기는 소리가 들렸습니다.',art:'달빛이 비치는 방, 열린 공책 옆에 엎드려 잠든 아이'},
 {title:'공책 속 친구들이 깨어납니다',line:'낙서들이 움직이기 시작했습니다. 아이는 아직 이 비밀을 모릅니다.',whisper:'“우리를 그려준 아이의 꿈을, 함께 지키자.”',art:'별빛이 솟는 공책 위에서 일어나 움직이는 네 명의 낙서 용사'}
];
export function mountPrologue(root,ids,onComplete){
 let page=0,elapsed=0,last=performance.now(),frame=0,closed=false;
 let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=8500;
 root.innerHTML=`<section class="prologue" aria-label="이야기의 시작"><div class="prologue-top"><span>PROLOGUE / 어느 아이의 공책</span><button class="plain" id="intro-skip">건너뛰기 →</button></div><div class="intro-stage"><div class="intro-picture" role="img"></div><div class="intro-night" aria-hidden="true"></div><div class="intro-motes" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--x:${12+i*5.8}%;--delay:${i*-.57}s;--drift:${(i%3-1)*35}px"></i>`).join('')}</div><div class="intro-friends" aria-hidden="true">${ids.map((id,i)=>`<canvas class="hero-portrait intro-friend" data-hero="${id}" style="--order:${i}"></canvas>`).join('')}</div><span class="intro-scene-note" aria-hidden="true"></span></div><div class="intro-caption" aria-live="polite" aria-atomic="true"><span class="intro-page-number"></span><h1 tabindex="-1"></h1><p class="intro-line"></p><p class="intro-whisper"></p></div><div class="intro-progress" aria-hidden="true">${prologuePages.map(()=>'<span><i></i></span>').join('')}</div><div class="intro-controls"><button class="plain" id="intro-prev">← 이전 장면</button><button class="plain" id="intro-pause" aria-pressed="${paused}"></button><button class="primary" id="intro-next">다음 장면 →</button></div></section>`;
 const shell=root.querySelector('.prologue');
 const pauseButton=root.querySelector('#intro-pause');
 function syncPause(){shell.classList.toggle('intro-paused',paused);pauseButton.textContent=paused?'▶ 재생':'Ⅱ 일시정지';pauseButton.setAttribute('aria-pressed',String(paused));}
 function show(){
  const p=prologuePages[page];elapsed=0;last=performance.now();
  shell.dataset.page=page;
  const picture=shell.querySelector('.intro-picture');
  picture.style.backgroundPosition=`${page%2*100}% ${Math.floor(page/2)*100}%`;
  picture.setAttribute('aria-label',p.art);
  // Restart the camera movement for each shot, including manual back navigation.
  picture.style.animation='none';void picture.offsetWidth;picture.style.animation='';
  shell.querySelector('.intro-page-number').textContent=`0${page+1} / 04`;
  shell.querySelector('h1').textContent=p.title;
  shell.querySelector('.intro-line').textContent=p.line;
  shell.querySelector('.intro-whisper').textContent=p.whisper;
  shell.querySelector('.intro-scene-note').textContent=['방과 후','오늘도, 나만의 친구들을','고요한 밤','첫 번째 모험'][page];
  shell.querySelector('#intro-prev').disabled=page===0;
  shell.querySelector('#intro-next').textContent=page===3?'용사단 만나러 가기 →':'다음 장면 →';
  progress();
 }
 function progress(){shell.querySelectorAll('.intro-progress i').forEach((bar,i)=>bar.style.width=(i<page?100:i===page?elapsed/duration*100:0)+'%');}
 function cleanup(){closed=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);}
 function finish(){if(closed)return;cleanup();onComplete();}
 function next(){if(page===3){finish();return;}page++;show();}
 function tick(now){if(closed)return;const delta=now-last;last=now;if(!paused&&!document.hidden){elapsed+=Math.min(delta,100);progress();if(elapsed>=duration)next();}if(!closed)frame=requestAnimationFrame(tick);}
 function visibility(){last=performance.now();}
 document.addEventListener('visibilitychange',visibility);
 shell.querySelector('#intro-skip').onclick=finish;
 shell.querySelector('#intro-next').onclick=next;
 shell.querySelector('#intro-prev').onclick=()=>{if(page>0){page--;show();}};
 pauseButton.onclick=()=>{paused=!paused;syncPause();};
 show();syncPause();paintPortraits();shell.querySelector('h1').focus({preventScroll:true});frame=requestAnimationFrame(tick);
 return cleanup;
}
