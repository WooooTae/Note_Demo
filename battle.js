export const roles=[
 {id:0,name:'불꽃 기사',tag:'화염 · 근접',desc:'불꽃을 두른 검으로 앞장서는 용사.',color:'#c05c3c',icon:'⚔',skill:'화염 참격',hp:120,mp:24,atk:18,cost:8,power:42,effect:'fire'},
 {id:1,name:'푸른 마법사',tag:'별빛 · 마법',desc:'작은 지팡이에 밤하늘의 힘을 담아요.',color:'#527caa',icon:'✦',skill:'별빛 마법',hp:80,mp:36,atk:12,cost:9,power:48,effect:'magic'},
 {id:2,name:'숲의 궁수',tag:'바람 · 연속',desc:'숲의 바람처럼 빠르고 정확한 화살.',color:'#66805a',icon:'➶',skill:'연속 사격',hp:90,mp:24,atk:20,cost:8,power:40,effect:'arrow'},
 {id:3,name:'빛의 창술사',tag:'빛 · 보호',desc:'황금빛 창으로 동료를 지켜요.',color:'#b09248',icon:'✧',skill:'수호의 창',hp:110,mp:24,atk:16,cost:8,power:32,effect:'protect'},
 {id:4,name:'장미 성직자',tag:'장미 · 회복',desc:'지워진 용기를 다시 피어나게 해요.',color:'#b56c88',icon:'❀',skill:'장미의 축복',hp:90,mp:40,atk:13,cost:10,power:0,heal:30,effect:'heal'},
 {id:5,name:'그림자 도적',tag:'그림자 · 쌍검',desc:'잉크보다 빠르게 스치는 두 개의 칼날.',color:'#806498',icon:'☽',skill:'그림자 쌍검',hp:85,mp:30,atk:22,cost:10,power:52,effect:'rogue'},
 {id:6,name:'정령 소환술사',tag:'정령 · 소환',desc:'공책의 작은 여우를 동료로 불러요.',color:'#348f91',icon:'✺',skill:'별여우 소환',hp:90,mp:36,atk:13,cost:12,power:24,effect:'summon'},
 {id:7,name:'흑마법사',tag:'어둠 · 흡수',desc:'적의 잉크에서 생명력을 되찾아요.',color:'#8950a0',icon:'☾',skill:'영혼 흡수',hp:85,mp:36,atk:16,cost:10,power:44,effect:'drain'},
 {id:8,name:'마검사',tag:'마력 · 검술',desc:'푸른 마력을 검에 담아 전장을 가르는 용사.',color:'#5267bd',icon:'✧',skill:'룬 블레이드',hp:105,mp:30,atk:19,cost:9,power:46,effect:'runeblade'},
 {id:9,name:'거너',tag:'탄환 · 원거리',desc:'두 자루 잉크총으로 경쾌하게 탄막을 펼쳐요.',color:'#ba7834',icon:'✹',skill:'더블 트리거',hp:85,mp:30,atk:21,cost:9,power:46,effect:'gun'}
];
// Skill definitions are authoritative; saves continue to store only combat progress.
export const skillSets=roles.map(h=>[{name:h.skill,cost:h.cost,power:h.power,effect:h.effect,...(h.heal?{heal:h.heal}:{}),...(h.effect==='protect'?{guard:'party'}:{}),...(h.effect==='summon'?{summon:true}:{}),...(h.effect==='drain'?{drain:true}:{})}]);
const extraSkills=[
 [{name:'불꽃 회오리',cost:12,power:26,effect:'fire',area:true},{name:'불굴의 검',cost:6,power:24,effect:'fire',guard:'self'}],
 [{name:'유성우',cost:15,power:30,effect:'magic',area:true},{name:'별빛 집중포',cost:18,power:70,effect:'magic'}],
 [{name:'화살비',cost:12,power:24,effect:'arrow',area:true},{name:'바람 저격',cost:14,power:62,effect:'arrow'}],
 [{name:'여명의 결계',cost:12,power:0,heal:12,effect:'heal',guard:'party'},{name:'태양 관통',cost:14,power:55,effect:'protect'}],
 [{name:'만개하는 기적',cost:18,power:0,heal:45,effect:'heal'},{name:'장미 가시',cost:8,power:38,effect:'magic'}],
 [{name:'그림자 난무',cost:14,power:28,effect:'rogue',area:true},{name:'생명 훔치기',cost:8,power:36,effect:'drain',drain:true}],
 [{name:'정령 쇄도',cost:16,power:40,effect:'summon',summon:true},{name:'정령 결계',cost:12,power:0,heal:18,effect:'heal',guard:'party'}],
 [{name:'영혼 소용돌이',cost:16,power:26,effect:'drain',area:true,drain:true},{name:'심연의 창',cost:20,power:72,effect:'drain'}],
 [{name:'차원 검기',cost:14,power:29,effect:'runeblade',area:true},{name:'룬의 수호',cost:7,power:27,effect:'runeblade',guard:'self'}],
 [{name:'탄막 폭풍',cost:14,power:28,effect:'gun',area:true},{name:'마탄 저격',cost:17,power:68,effect:'gun'}]
];
skillSets.forEach((list,id)=>list.push(...extraSkills[id]));
export function skillsFor(hero){return skillSets[hero.id];}
export function validParty(ids){return Array.isArray(ids)&&ids.length===4&&new Set(ids).size===4&&ids.every(id=>Number.isInteger(id)&&roles[id]);}
export const enemyDefinitions=[
 {id:0,name:'잉크의 왕',kind:'boss',hp:420,maxHp:420},
 {id:1,name:'잉크 슬라임',kind:'slime',hp:70,maxHp:70},
 {id:2,name:'낙서 해골',kind:'skeleton',hp:80,maxHp:80}
];
const makeEnemy=(id,name,kind,hp,attack,style='single',heavy=attack)=>({id,name,kind,hp,maxHp:hp,attack,style,heavy});
export const encounters=[
 {name:'일반 몬스터',subtitle:'숲 입구의 낙서들',enemies:[makeEnemy(0,'먹물 슬라임','slime',80,8),makeEnemy(1,'잉크 슬라임','slime',70,7),makeEnemy(2,'낙서 해골','skeleton',90,9)]},
 {name:'에픽 몬스터',subtitle:'보랏빛 해골 대장',enemies:[makeEnemy(0,'공허의 해골 대장','epic',260,14,'all',24),makeEnemy(1,'짙은 잉크 슬라임','slime',80,8),makeEnemy(2,'해골 호위병','skeleton',90,10)]},
 {name:'보스 몬스터',subtitle:'잉크의 왕',enemies:[makeEnemy(0,'잉크의 왕','boss',500,20,'all',34),makeEnemy(1,'왕의 잉크 슬라임','slime',90,9),makeEnemy(2,'왕의 해골 근위병','skeleton',100,11)]}
];
export function createBattle(ids=[0,1,2,3],encounter=0){
 if(!validParty(ids))throw new Error('서로 다른 용사 4명을 선택하세요.');
 if(!Number.isInteger(encounter)||encounter< -1||encounter>2)throw new Error('잘못된 전투 구간입니다.');
 const enemies=(encounter===-1?enemyDefinitions:encounters[encounter].enemies).map(e=>({...e}));
 return {party:ids.map(id=>({...roles[id],maxHp:roles[id].hp,maxMp:roles[id].mp,guard:false,taped:false})),encounter,enemies,enemy:enemies[0],target:0,summon:null,turn:0,round:1,status:'playing',log:[encounter===-1?'이전 모험을 이어갑니다.':`1스테이지 ${encounter+1}/3 · ${encounters[encounter].name}! 모든 적을 물리치세요.`],last:null};
}
function finishVictory(state){
 if(state.enemies.some(e=>e.hp>0))return false;
 state.status=state.encounter>=0&&state.encounter<2?'cleared':'victory';
 state.log.push(state.status==='cleared'?'구간 돌파! 회복 후 다음 전투로 자동 이동합니다.':'1스테이지 클리어! 보상: 별 조각 30개');return true;
}
export function advanceEncounter(state){
 if(state.status!=='cleared'||state.encounter<0||state.encounter>=2||state.enemies.some(e=>e.hp>0))return false;
 const next=createBattle(state.party.map(p=>p.id),state.encounter+1);
 next.party.forEach((p,i)=>{const old=state.party[i];p.hp=old.hp>0?Math.min(p.maxHp,old.hp+Math.ceil(p.maxHp*.35)):Math.ceil(p.maxHp*.25);p.mp=Math.min(p.maxMp,old.mp+14);});
 next.log=[...state.log.slice(-30),'휴식: 생존자 HP 35% 회복 · 쓰러진 동료 HP 25%로 복귀 · MP +14 · 소환 종료',...next.log];
 Object.assign(state,next);return true;
}
export function enemyAttack(state,id){
 const e=state.enemies[id],heavy=state.round%3===0;
 const rage=state.encounter===2&&id===0&&e.hp>0&&e.hp<=e.maxHp/2;
 const damage=state.encounter===-1?(id===0?(heavy?30:18):id===1?5:7):(heavy?e.heavy:e.attack)+(rage?4:0);
 return {damage,all:state.encounter===-1?id===0:e.style==='all',heavy:heavy&&(state.encounter===-1?id===0:e.heavy>e.attack),rage};
}
export function tapeTarget(state){
 if(state.encounter!==2||state.enemy.hp<=0||state.round%3!==2)return -1;
 const first=(Math.floor(state.round/3)+1)%4;
 for(let k=0;k<4;k++){const i=(first+k)%4;if(state.party[i].hp>0)return i;}return -1;
}
export function enemyIntent(state){return state.enemies.filter(e=>e.hp>0).map(e=>{const tape=tapeTarget(state);if(e.id===0&&tape>=0)return `${e.name}: 테이프 봉인 → ${state.party[tape].name} (다음 행동 1회 불가 · 방어/보호로 막기)`;const p=enemyAttack(state,e.id);return `${e.name}: ${p.rage?'광폭 ':''}${p.heavy?'강공 ':''}${p.all?'전체':'1명'} ${p.damage}`;}).join(' / ')||'모든 적 처치';}
export function selectTarget(state,target){if(state.status!=='playing'||!Number.isInteger(target)||!state.enemies[target]||state.enemies[target].hp<=0)return false;state.target=target;return true;}
export function act(state,action,skillIndex=0){
 if(state.status!=='playing'||!['attack','skill','guard','skip'].includes(action))return false;
 const hero=state.party[state.turn];
 if(hero?.taped?action!=='skip':action==='skip')return false;
 const ability=action==='skill'&&Number.isInteger(skillIndex)?skillsFor(hero||{})?.[skillIndex]:null;
 if(!hero||hero.hp<=0||(action==='skill'&&(!ability||hero.mp<ability.cost)))return false;
 if(!state.enemies[state.target]||state.enemies[state.target].hp<=0)state.target=state.enemies.findIndex(e=>e.hp>0);
 if(state.target<0)return false;
 const target=state.target;
 const healing=state.party.map(()=>0),damageByTarget=state.enemies.map(()=>0);
 if(action==='skip'){hero.taped=false;state.log.push(`${hero.name}: 테이프 때문에 이번 행동을 쉬었다. 테이프가 떨어졌다!`);}
 else if(action==='guard'){hero.guard=true;hero.mp=Math.min(hero.maxMp,hero.mp+5);state.log.push(`${hero.name}: 방어! 다음 반격 피해 감소 · MP +5`);}
 else {
  if(ability)hero.mp-=ability.cost;
  const power=ability?ability.power:hero.atk;
  state.enemies.forEach((e,i)=>{if(e.hp>0&&(i===target||ability?.area)){damageByTarget[i]=Math.min(e.hp,power);e.hp-=damageByTarget[i];}});
  if(ability?.heal)state.party.forEach((p,i)=>{if(p.hp>0){healing[i]=Math.min(ability.heal,p.maxHp-p.hp);p.hp+=healing[i];}});
  if(ability?.guard==='party')state.party.filter(p=>p.hp>0).forEach(p=>p.guard=true);
  if(ability?.guard==='self')hero.guard=true;
  if(ability?.summon){state.summon={owner:hero.id,rounds:3};state.log.push('별여우가 나타났다! 이번 라운드부터 3회 지원 공격.');}
  if(ability?.drain){healing[state.turn]=Math.min(Math.floor(damageByTarget.reduce((a,b)=>a+b,0)/2),hero.maxHp-hero.hp);hero.hp+=healing[state.turn];}
  const result=damageByTarget.map((n,i)=>n?`${state.enemies[i].name} ${n} 피해`:null).filter(Boolean).join(' · ');
  state.log.push(`${hero.name}의 ${ability?.name||'기본 공격'}! ${result}${ability?.heal?`생존 아군 전체 HP 최대 ${ability.heal} 회복`:''}${ability?.drain?` · HP ${healing[state.turn]} 흡수`:''}${ability?.guard?` · ${ability.guard==='party'?'아군 전체':'자신'} 보호`:''}`);
  damageByTarget.forEach((n,i)=>{if(n>0&&state.enemies[i].hp===0)state.log.push(`${state.enemies[i].name} 처치!`);});
 }
 state.last={actor:state.turn,action,skillIndex:ability?skillIndex:null,skillName:ability?.name,kind:ability?.effect||hero.effect,area:!!ability?.area,guard:ability?.guard||null,drain:!!ability?.drain,target,damage:damageByTarget[target],damageByTarget,healing,enemyHP:state.enemies.map(e=>e.hp),summonAttack:null,enemyStrikes:[],tapeAttack:null,counter:false};
 if(finishVictory(state))return true;
 let next=state.party.findIndex((h,i)=>i>state.turn&&h.hp>0);
 if(next===-1){
  const owner=state.summon&&state.party.find(p=>p.id===state.summon.owner&&p.hp>0);
  if(owner){
   const victim=state.enemies[state.target].hp>0?state.target:state.enemies.findIndex(e=>e.hp>0),hit=Math.min(18,state.enemies[victim].hp);
   state.enemies[victim].hp-=hit;state.summon.rounds--;state.last.summonAttack={owner:owner.id,target:victim,damage:hit};
   state.log.push(`별여우의 지원 공격! ${state.enemies[victim].name}에게 ${hit} 피해`);
   if(state.summon.rounds===0){state.summon=null;state.log.push('별여우가 공책 속으로 돌아갔다.');}
   if(finishVictory(state))return true;
  }
  state.last.counter=true;
  for(let n=0;n<state.enemies.length;n++){
   if(state.enemies[n].hp===0)continue;
   const taped=tapeTarget(state);
   if(n===0&&taped>=0){const p=state.party[taped],blocked=p.guard;state.last.tapeAttack={target:taped,blocked};if(!blocked)p.taped=true;state.log.push(blocked?`${p.name}의 보호가 테이프를 막았다!`:`잉크의 왕의 테이프 봉인! ${p.name}의 다음 행동 1회 불가`);continue;}
   const plan=enemyAttack(state,n);
   const living=state.party.map((p,i)=>({p,i})).filter(({p})=>p.hp>0);if(!living.length)break;
   const victims=plan.all?living:[living[(state.round-1+Math.max(0,n-1))%living.length]];
   state.log.push(`${state.enemies[n].name}: ${plan.rage?'광폭! ':''}${plan.heavy?'강력한 ':''}${plan.all?'전체':'집중'} 공격 (${plan.damage})`);
   for(const {p,i} of victims){const hit=Math.min(p.hp,Math.ceil(plan.damage*(p.guard?0.35:1)));p.hp-=hit;state.last.enemyStrikes.push({enemy:n,target:i,damage:hit});}
  }
  state.party.forEach(h=>{h.guard=false;if(h.hp===0)h.taped=false;});state.round++;next=state.party.findIndex(h=>h.hp>0);
  if(state.summon&&!state.party.some(p=>p.id===state.summon.owner&&p.hp>0))state.summon=null;
  if(next===-1){state.status='defeat';state.log.push('낙서들이 잠들었다. 다시 페이지를 펼쳐보자.');}
 }
 if(state.enemies[state.target].hp===0)state.target=state.enemies.findIndex(e=>e.hp>0);
 state.turn=next;state.log=state.log.slice(-40);return true;
}
