import {mountPrologue} from './prologue.js';
import {roles,createBattle,act,validParty,selectTarget,skillsFor,encounters,advanceEncounter,enemyIntent} from './battle.js';
import {mountScene,stopScene,sound,paintPortraits} from './scene.js';
import {SAVE_KEY,PARTY_KEY,serializeSave,restoreSave} from './save.js';
import {animationDuration,removalTimes,ENTRANCE_SECONDS} from './animation.js';
const app=document.querySelector('#app');
let state=null,busy=false,timer,event=null,soundEnabled=false,storageFailed=false,memorySave=null;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readStorage(key){try{return localStorage.getItem(key);}catch{storageFailed=true;return null;}}
function writeStorage(key,value){try{localStorage.setItem(key,value);return true;}catch{storageFailed=true;return false;}}
function getSave(){return restoreSave(memorySave||readStorage(SAVE_KEY));}
function saveProgress(){memorySave=serializeSave(state);writeStorage(SAVE_KEY,memorySave);}
function initialParty(){try{const ids=JSON.parse(readStorage(PARTY_KEY));return validParty(ids)?ids:[0,1,2,3];}catch{return [0,1,2,3];}}
let selected=initialParty();
let closePrologue=null;
function doodle(i){return `<canvas class="doodle hero-portrait" data-hero="${i}" role="img" aria-label="${roles[i].name}"></canvas>`;}
function cancelScene(){if(closePrologue){closePrologue();closePrologue=null;}stopScene();clearTimeout(timer);event=null;busy=false;}
function home(){
 cancelScene();state=null;document.body.classList.add('title-view');
 const saved=getSave();
 const saveText=saved?`${saved.battle.encounter>=0?(saved.battle.encounter+1)+'/3 · ':''}${saved.battle.status==='playing'?'TURN '+String(saved.battle.round).padStart(2,'0'):saved.battle.status==='victory'?'스테이지 완료':saved.battle.status==='cleared'?'다음 전투 대기':'다시 도전'} · ${new Date(saved.savedAt).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}`:'아직 기록된 모험이 없어요';
 app.innerHTML=`<section class="title-page"><div class="paper-rings" aria-hidden="true">${'<i></i>'.repeat(7)}</div><span class="corner-note">아이가 잠든 밤,<br>공책을 펼쳐보세요.</span><span class="moon-doodle" aria-hidden="true">☾<i>✧</i></span><div class="title-stamp">A LITTLE ADVENTURE IN YOUR NOTEBOOK</div><h1 class="game-title">낙서 <em>용사단</em><span>NOTEBOOK HEROES</span></h1><p class="title-story">지우개가 닿기 전에, 이 세계를 구해줘!</p><div class="title-content"><nav class="game-menu" aria-label="게임 메뉴"><button id="new-game" class="menu-button main-menu"><span>✦</span> 게임 시작 <b>→</b></button><button id="continue" class="menu-button" ${saved?'':'disabled'}><span>↪</span><div>이어하기<small>${saveText}</small></div><b>→</b></button><button id="party-menu" class="menu-button"><span>♧</span> 용사단 편성 <b>${roles.length}명의 친구들</b></button><button class="change-party" id="replay-intro">☾ 이야기 다시 보기</button><p class="menu-help">${storageFailed?'저장 공간을 사용할 수 없어 창을 닫으면 기록이 사라질 수 있어요.':'같은 브라우저와 파일에서 모험을 이어갈 수 있어요.'}</p></nav><aside class="party-polaroid"><span class="tape"></span><div class="polaroid-heading"><span>오늘 밤의 용사단</span><small>04 FRIENDS</small></div><div class="title-party">${selected.map(i=>`<div>${doodle(i)}<small style="color:${roles[i].color}">${roles[i].name}</small></div>`).join('')}</div><p>“한 페이지씩, 함께 지켜 나가자.”</p><button class="change-party" id="change-party">친구 바꾸기 ↗</button></aside></div><div class="page-bottom"><span>CHAPTER 01 <b>낙서의 숲</b></span><span>✧ 4인 파티 · 턴제 모험</span><span>PAGE — 01</span></div></section>`;
 document.querySelector('#new-game').onclick=()=>showIntro(()=>showParty('start'));
 document.querySelector('#replay-intro').onclick=()=>showIntro(home);
 document.querySelector('#party-menu').onclick=()=>showParty('edit');
 document.querySelector('#change-party').onclick=()=>showParty('edit');
 document.querySelector('#continue').onclick=()=>{const record=getSave();if(record){cancelScene();state=record.battle;render();}else home();};
 paintPortraits();
}
function showIntro(after){
 cancelScene();document.body.classList.remove('title-view');
 closePrologue=mountPrologue(app,selected,()=>{closePrologue=null;after();});
}
function showParty(mode='start',notice=''){
 cancelScene();document.body.classList.remove('title-view');
 app.innerHTML=`<section class="roster-page"><div class="roster-heading"><div><span class="eyebrow">OUR LITTLE HEROES / ${roles.length}</span><h1>오늘 밤, 누구와 떠날까요?</h1><p>용사 4명을 골라주세요. 선택한 순서대로 행동합니다.</p></div><button class="plain" id="roster-back">← 메인으로</button></div><div class="party-slots">${[0,1,2,3].map((_,slot)=>{const id=selected[slot];return `<div class="party-slot ${id===undefined?'empty':''}"><b>0${slot+1}</b>${id===undefined?'<span>친구를 선택하세요</span>':`<span style="color:${roles[id].color}">${roles[id].icon} ${roles[id].name}</span>`}</div>`;}).join('')}</div><div class="roster-grid">${roles.map((h,i)=>{const order=selected.indexOf(i);return `<button class="roster-card ${order>=0?'chosen':''}" data-select="${i}" aria-pressed="${order>=0}" style="--hero:${h.color}"><span class="card-number">${order>=0?'✓ '+(order+1)+'번째 동료':'선택하기'}</span>${i>=8?'<span class="new-badge">NEW</span>':''}<div class="portrait-wash">${doodle(i)}</div><small class="role-tag">${h.tag}</small><h2>${h.name}</h2><p>${h.desc}</p><div class="card-stats"><span>HP <b>${h.hp}</b></span><span>MP <b>${h.mp}</b></span></div><div class="skill-note">${skillsFor(h).map(sk=>`<strong>${sk.name} · MP ${sk.cost}</strong><small>${skillSummary(sk)}</small>`).join('')}</div></button>`;}).join('')}</div><div class="roster-confirm"><div><strong>선택한 친구 <span>${selected.length} / 4</span></strong><p role="status" aria-live="polite">${notice||'선택한 카드를 다시 누르면 편성에서 빠집니다.'}</p></div><button class="primary" id="confirm-party" ${selected.length===4?'':'disabled'}>${mode==='start'?'이 용사단으로 모험 시작':'편성 저장'} →</button></div></section>`;
 document.querySelector('#roster-back').onclick=()=>{selected=initialParty();home();};
 document.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.select);if(selected.includes(id))selected=selected.filter(x=>x!==id);else if(selected.length<4)selected.push(id);else{showParty(mode,'이미 4명입니다. 바꿀 친구를 먼저 선택 해제해주세요.');document.querySelector(`[data-select="${id}"]`).focus({preventScroll:true});return;}showParty(mode);document.querySelector(`[data-select="${id}"]`).focus({preventScroll:true});});
 document.querySelector('#confirm-party').onclick=()=>{
  if(!validParty(selected))return;
  if(mode==='edit'){writeStorage(PARTY_KEY,JSON.stringify(selected));home();return;}
  if(getSave())confirmNewGame();else start(selected);
 };
 paintPortraits();
}
function confirmNewGame(){
 const dialog=document.createElement('dialog');dialog.className='paper-dialog';dialog.innerHTML='<form method="dialog"><span>새로운 페이지</span><h2>새 모험을 시작할까요?</h2><p>현재 저장된 전투 기록이 새 모험으로 바뀝니다.</p><div><button value="cancel" class="plain">돌아가기</button><button value="start" class="primary">새 모험 시작</button></div></form>';document.body.append(dialog);dialog.addEventListener('close',()=>{const value=dialog.returnValue;dialog.remove();if(value==='start')start(selected);},{once:true});dialog.showModal();
}
function start(ids=selected){cancelScene();selected=[...ids];writeStorage(PARTY_KEY,JSON.stringify(selected));state=createBattle(selected);saveProgress();render(true);}
function skillSummary(h){
 const parts=[];
 if(h.power)parts.push((h.area?'적 전체 ':'선택한 적 ')+h.power+' 피해');
 if(h.heal)parts.push('아군 전체 HP '+h.heal+' 회복');
 if(h.guard)parts.push(h.guard==='party'?'아군 전체 보호':'자신 보호');
 if(h.summon)parts.push('정령 3회 지원');
 if(h.drain)parts.push('총 피해의 50% 흡수');
 return parts.join(' · ');
}
function skillButtons(h){return skillsFor(h).map((sk,i)=>`<button data-action="skill" data-skill="${i}" ${busy||h.mp<sk.cost?'disabled':''} aria-label="${sk.name}, MP ${sk.cost}, ${skillSummary(sk)}${h.mp<sk.cost?', MP 부족':''}">${actionIcon(sk.effect)}<span>${sk.name}</span><small>MP ${sk.cost}${h.mp<sk.cost?' · MP 부족':''}</small><small>${skillSummary(sk)}</small></button>`).join('');}
function targetControls(){return `<section class="target-panel" aria-label="공격 대상 선택"><div><strong>공격 대상</strong><small>적 또는 카드를 눌러 선택 · 모두 처치하면 구간 돌파</small></div><div class="target-buttons">${state.enemies.map((e,i)=>`<button data-target="${i}" class="target-button ${state.target===i?'target-selected':''} ${e.hp===0?'defeated':''}" aria-pressed="${state.target===i}" ${e.hp===0||state.status!=='playing'?'disabled':''}><span>${e.kind==='boss'?'♛':e.kind==='slime'?'●':e.kind==='epic'?'✦':'☠'} ${e.name}</span><small>${e.hp===0?'처치':e.hp+' / '+e.maxHp}</small><i style="--hp:${e.hp/e.maxHp*100}%"></i></button>`).join('')}</div></section>`;}
function chooseTarget(id){if(busy||!state||!selectTarget(state,id))return;saveProgress();render();}
function updateEnemyDisplay(hps){
 document.querySelector('.counter-hint').textContent='다음 반격 · '+enemyIntent({...state,enemies:state.enemies.map((e,i)=>({...e,hp:hps[i]}))});
 document.querySelector('.enemy-info small').textContent=hps[0]+' / '+state.enemy.maxHp;
 document.querySelector('.enemy-bar i').style.width=hps[0]/state.enemy.maxHp*100+'%';
 document.querySelectorAll('[data-target]').forEach(b=>{const id=Number(b.dataset.target);b.querySelector('small').textContent=hps[id]===0?'처치':hps[id]+' / '+state.enemies[id].maxHp;b.querySelector('i').style.setProperty('--hp',hps[id]/state.enemies[id].maxHp*100+'%');b.classList.toggle('defeated',hps[id]===0);});
}
function actionIcon(kind){
 const colors={attack:'#8f4240',fire:'#ce4c22',magic:'#2b88b5',arrow:'#5a8339',protect:'#bc912e',heal:'#b66c94',rogue:'#745091',guard:'#5e6771',summon:'#318e8f',drain:'#7d3da0',runeblade:'#5956ab',gun:'#b87932'};
 const paths={runeblade:'M15 67 L54 18 L67 10 L62 28 L23 73 M17 45 L40 63 M13 16 L20 26 L31 29 L20 33 L14 44 L10 32 L4 27 L11 24',gun:'M13 26 L65 26 L65 40 L40 40 L33 65 L19 65 L25 40 L13 40 Z M43 27 L43 39 M62 17 L70 12 M65 47 L74 51',attack:'M14 61 Q32 21 67 13 Q39 42 14 61 M23 66 L66 25',fire:'M14 65 Q8 43 43 14 Q30 39 48 32 L68 10 Q64 61 14 65 M22 60 Q45 47 54 31',magic:'M40 8 L46 30 L70 40 L46 46 L40 72 L33 48 L10 40 L33 31 Z M13 13 L20 20 M64 64 L70 70',arrow:'M9 62 L65 17 M47 18 L68 13 L64 35 M18 71 L73 28 M12 43 L52 10',protect:'M8 65 L62 13 M48 15 L70 7 L62 31 M28 37 L43 51 M14 49 L30 65',heal:'M40 17 C12 -1 8 36 40 60 C72 36 68 -1 40 17 Z M40 25 L40 46 M30 35 L50 35',rogue:'M12 65 Q13 31 62 12 L44 42 Z M67 65 Q66 31 17 12 L35 42 Z',summon:'M15 23 L35 28 L40 34 L45 28 L65 23 L65 61 L45 66 L40 61 L35 66 L15 61 Z M40 34 L40 61 M29 11 L32 18 M51 11 L48 18',drain:'M55 12 Q15 13 15 40 Q15 65 55 68 Q37 54 37 40 Q37 26 55 12 Z M60 28 L65 38 L60 48 L55 38 Z',guard:'M40 9 L66 19 L61 49 L40 70 L19 49 L14 19 Z M40 18 L40 57 M24 30 L56 30'};
 return `<svg class="action-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="3" y="3" width="74" height="74" rx="3" fill="${colors[kind]}" stroke="#302c31" stroke-width="3"/><path d="${paths[kind]}" fill="none" stroke="#ffcc6e" stroke-width="9" opacity=".45" stroke-linecap="round" stroke-linejoin="round"/><path d="${paths[kind]}" fill="none" stroke="#fff9d9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function encounterProgress(){
 if(state.encounter<0)return '<p class="legacy-note">이전 버전 전투를 이어가는 중 · 새로운 3연전은 게임 시작에서 진행하세요.</p>';
 return `<nav class="encounter-path" aria-label="1스테이지 진행 상황">${encounters.map((e,i)=>`<div class="encounter-step ${i===state.encounter?'current':''} ${i<state.encounter||i===state.encounter&&['cleared','victory'].includes(state.status)?'complete':''}" ${i===state.encounter?'aria-current="step"':''}><b>${i<state.encounter?'✓':'0'+(i+1)}</b><span>${e.name}<small>${e.subtitle}</small></span></div>`).join('')}</nav><p class="stage-rule">전투 사이 HP 35% · MP 14 회복 / 전멸하면 1스테이지 처음부터${state.encounter===2?' / 보스 HP 50% 이하: 광폭, 공격 +4':''}</p>`;
}
function battleResult(){
 if(state.status==='cleared')return `<div class="result stage-clear"><span class="eyebrow">${state.encounter+1} / 3 COMPLETE</span><h2>✧ ${encounters[state.encounter].name} 돌파!</h2><p>잠깐 쉬고 <strong>${encounters[state.encounter+1].name}</strong>에게 도전하세요.</p><p>생존 동료: 최대 HP의 35% 회복 · 쓰러진 동료: HP 25%로 복귀<br>모두 MP +14 · 보호와 소환은 다음 전투에서 초기화</p><button class="primary" id="next-encounter">휴식 후 ${encounters[state.encounter+1].name} 도전 →</button></div>`;
 return `<div class="result"><h2>${state.status==='victory'?'✧ 1스테이지를 지켰어요!':'☾ 용사단이 모두 쓰러졌어요.'}</h2><p>${state.status==='victory'?'획득 보상: 별 조각 30개 · 데모 스테이지 완료':'강공 예고에 맞춰 보호·방어를 사용하고, 일반 몬스터부터 줄여보세요.'}</p><button class="primary" id="retry">1스테이지 처음부터 ↗</button></div>`;
}
function nextEncounter(){if(busy||!advanceEncounter(state))return;cancelScene();saveProgress();render(true);document.querySelector('.battle-top').scrollIntoView({block:'start'});}
function render(entrance=false){entrance=entrance&&!matchMedia('(prefers-reduced-motion: reduce)').matches;if(entrance)busy=true;const done=state.status!=='playing';const h=state.party[state.turn];document.body.classList.remove('title-view');app.innerHTML=`<section class="battle-top"><div><span class="eyebrow">CHAPTER 01 / 낙서의 숲</span><h1>${state.encounter>=0?'1-'+(state.encounter+1)+' · '+encounters[state.encounter].name:'이전 모험 이어가기'}</h1><small class="save-status">${storageFailed?'자동 저장을 사용할 수 없습니다':'✎ 행동이 끝날 때마다 자동 저장됩니다'}</small></div><div class="battle-nav"><button class="plain" id="sound" aria-pressed="${soundEnabled}">효과음 ${soundEnabled?'ON':'OFF'}</button><button class="plain" id="back">← 공책으로</button></div></section>${encounterProgress()}<p class="counter-hint" aria-live="polite">다음 반격 · ${enemyIntent(state)}</p><section class="arena"><div class="enemy-info"><span>${state.enemy.kind==='boss'?'♛':state.enemy.kind==='epic'?'✦':'●'} ${state.enemy.name} <small>${state.enemy.hp} / ${state.enemy.maxHp}</small></span><div class="bar enemy-bar"><i style="width:${state.enemy.hp/state.enemy.maxHp*100}%"></i></div><p>${state.encounter===0?'일반 몬스터 · 각자 1명 공격':state.encounter===1?'에픽 · 매 3턴 전체 강공':state.encounter===2?'보스 · 매 3턴 강공 / HP 50%↓ 광폭':'이전 모험의 보스전'}</p></div><span class="round">TURN<br><b>${String(state.round).padStart(2,'0')}</b></span><canvas id="battle-scene" role="img" aria-label="용사 네 명과 ${state.enemy.name} 무리의 애니메이션 전장"></canvas>${entrance?'<button id="skip-sketch" class="plain sketch-skip">등장 연출 건너뛰기 →</button>':''}<div class="scene-label"><span>✎ NOTEBOOK HEROES</span><span id="action-caption">${done?'오늘 밤의 이야기를 기록했어요.':h.name+' · 행동을 선택하세요'}</span></div></section>${targetControls()}<div class="battle-bottom"><section class="battle-control"><div class="party-stats">${state.party.map((p,i)=>`<div class="stat ${!done&&state.turn===i?'selected':''} ${p.hp===0?'fallen':''}" style="--hero:${p.color}"><canvas class="hero-portrait stat-portrait" data-hero="${p.id}" aria-hidden="true"></canvas><strong>${p.name}</strong><span>HP ${p.hp} / ${p.maxHp}</span><div class="bar"><i style="width:${p.hp/p.maxHp*100}%"></i></div><small>MP ${p.mp} / ${p.maxMp} ${p.guard?'· 방어 중':''}${state.summon?.owner===p.id?' · 정령 '+state.summon.rounds+'회':''}</small></div>`).join('')}</div>${done?battleResult():`<div class="actions"><div><small>${busy?'행동을 기록하는 중…':'당신의 선택을 기다리고 있어요'}</small><h2>${h.name}의 차례</h2></div><div class="action-buttons"><button data-action="attack" ${busy?'disabled':''}>${actionIcon('attack')}<span>공격</span><small>기본 피해 ${h.atk}</small></button>${skillButtons(h)}<button data-action="guard" ${busy?'disabled':''}>${actionIcon('guard')}<span>방어</span><small>피해 65% 감소 · MP +5</small></button></div></div>`}</section><aside class="journal"><h3>✎ 모험의 기록</h3><div role="log" aria-live="polite">${state.log.slice(-5).map(l=>`<p>${escapeHTML(l)}</p>`).join('')}</div></aside></div>`;document.querySelector('#back').onclick=home;if(state.status==='cleared')document.querySelector('#next-encounter').onclick=nextEncounter;else if(done)document.querySelector('#retry').onclick=()=>start(state.party.map(p=>p.id));document.querySelector('#sound').onclick=()=>{soundEnabled=!soundEnabled;const b=document.querySelector('#sound');b.textContent='효과음 '+(soundEnabled?'ON':'OFF');b.setAttribute('aria-pressed',soundEnabled);sound('magic',soundEnabled);};mountScene(document.querySelector('#battle-scene'),state,()=>event,chooseTarget,entrance);paintPortraits();document.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>chooseTarget(Number(b.dataset.target)));document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>playAction(b.dataset.action,Number(b.dataset.skill||0)));
 if(entrance){
  document.querySelectorAll('[data-action],[data-target]').forEach(b=>b.disabled=true);
  document.querySelector('#action-caption').textContent='연필로 오늘 밤의 친구들을 그리는 중…';
  const finish=()=>{clearTimeout(timer);busy=false;render();};
  document.querySelector('#skip-sketch').onclick=finish;timer=setTimeout(finish,ENTRANCE_SECONDS*1000);
 }
}
function playAction(action,skillIndex=0){
 if(busy||state.status!=='playing')return;
 const next=structuredClone(state),actor=state.turn;
 if(!act(next,action,skillIndex))return;
 busy=true;
 event={removals:removalTimes(state,next),sound:soundEnabled,actor,kind:next.last.kind,skillName:next.last.skillName,area:next.last.area,guard:next.last.guard,drain:next.last.drain,damageByTarget:next.last.damageByTarget,action,start:performance.now(),damage:next.last.damage,healing:next.last.healing,target:next.last.target,afterAction:next.last.enemyHP,afterSupport:next.enemies.map(e=>e.hp),summonAttack:next.last.summonAttack,enemyStrikes:next.last.enemyStrikes,counter:next.last.counter,heavy:state.round%3===0,damageTaken:state.party.map((p,i)=>p.hp+next.last.healing[i]-next.party[i].hp)};
 event.onImpact=()=>{
  updateEnemyDisplay(next.last.enemyHP);
  document.querySelectorAll('.stat').forEach((el,i)=>{
   const shownHP=state.party[i].hp+next.last.healing[i];
   el.querySelector('span').textContent='HP '+shownHP+' / '+state.party[i].maxHp;
   el.querySelector('.bar i').style.width=shownHP/state.party[i].maxHp*100+'%';
   el.querySelector('small').textContent='MP '+next.party[i].mp+' / '+next.party[i].maxMp;
  });
 };
 event.onSummon=()=>updateEnemyDisplay(next.enemies.map(e=>e.hp));
 event.onCounter=()=>document.querySelectorAll('.stat').forEach((el,i)=>{el.querySelector('span').textContent='HP '+next.party[i].hp+' / '+next.party[i].maxHp;el.querySelector('.bar i').style.width=next.party[i].hp/next.party[i].maxHp*100+'%';});
 document.querySelectorAll('[data-action],[data-target]').forEach(b=>b.disabled=true);
 document.querySelector('#action-caption').textContent=state.party[actor].name+' · '+(action==='skill'?next.last.skillName:action==='guard'?'수호 태세':'기본 공격');
 sound(['magic','heal','summon','drain'].includes(event.kind)?'magic':'hit',soundEnabled);
 timer=setTimeout(()=>{state=next;event=null;busy=false;saveProgress();render();},animationDuration(event.counter,event.removals));
}
document.querySelector('#home-link').onclick=e=>{e.preventDefault();selected=initialParty();home();};home();
