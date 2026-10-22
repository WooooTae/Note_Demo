export const roles=[
 {id:0,name:'불꽃 기사',tag:'화염 · 근접',desc:'불꽃을 두른 검으로 앞장서는 용사.',color:'#c05c3c',icon:'⚔',skill:'화염 참격',hp:120,mp:24,atk:18,cost:8,power:42,effect:'fire'},
 {id:1,name:'푸른 마법사',tag:'별빛 · 마법',desc:'작은 지팡이에 밤하늘의 힘을 담아요.',color:'#527caa',icon:'✦',skill:'별빛 마법',hp:80,mp:36,atk:12,cost:9,power:48,effect:'magic'},
 {id:2,name:'숲의 궁수',tag:'바람 · 연속',desc:'숲의 바람처럼 빠르고 정확한 화살.',color:'#66805a',icon:'➶',skill:'연속 사격',hp:90,mp:24,atk:20,cost:8,power:40,effect:'arrow'},
 {id:3,name:'빛의 창술사',tag:'빛 · 보호',desc:'황금빛 창으로 동료를 지켜요.',color:'#b09248',icon:'✧',skill:'수호의 창',hp:110,mp:24,atk:16,cost:8,power:32,effect:'protect'},
 {id:4,name:'장미 성직자',tag:'장미 · 회복',desc:'지워진 용기를 다시 피어나게 해요.',color:'#b56c88',icon:'❀',skill:'장미의 축복',hp:90,mp:40,atk:13,cost:10,power:0,heal:30,effect:'heal'},
 {id:5,name:'그림자 도적',tag:'그림자 · 쌍검',desc:'잉크보다 빠르게 스치는 두 개의 칼날.',color:'#806498',icon:'☽',skill:'그림자 쌍검',hp:85,mp:30,atk:22,cost:10,power:52,effect:'rogue'},
 {id:6,name:'정령 소환술사',tag:'정령 · 소환',desc:'공책의 작은 여우를 동료로 불러요.',color:'#348f91',icon:'✺',skill:'별여우 소환',hp:90,mp:36,atk:13,cost:12,power:24,effect:'summon'},
 {id:7,name:'흑마법사',tag:'어둠 · 흡수',desc:'적의 잉크에서 생명력을 되찾아요.',color:'#8950a0',icon:'☾',skill:'영혼 흡수',hp:85,mp:36,atk:16,cost:10,power:44,effect:'drain'}
];
export function validParty(ids){return Array.isArray(ids)&&ids.length===4&&new Set(ids).size===4&&ids.every(id=>Number.isInteger(id)&&roles[id]);}
export const enemyDefinitions=[
 {id:0,name:'잉크의 왕',kind:'boss',hp:420,maxHp:420},
 {id:1,name:'잉크 슬라임',kind:'slime',hp:70,maxHp:70},
 {id:2,name:'낙서 해골',kind:'skeleton',hp:80,maxHp:80}
];
export function createBattle(ids=[0,1,2,3]){
 if(!validParty(ids))throw new Error('서로 다른 용사 4명을 선택하세요.');
 const enemies=enemyDefinitions.map(e=>({...e}));
 return {party:ids.map(id=>({...roles[id],maxHp:roles[id].hp,maxMp:roles[id].mp,guard:false})),enemies,enemy:enemies[0],target:0,summon:null,turn:0,round:1,status:'playing',log:['잉크의 왕과 부하들이 길을 막았다. 공격할 적을 골라보자.'],last:null};
}
function finishVictory(state){if(state.enemies.some(e=>e.hp>0))return false;state.status='victory';state.log.push('모든 적을 물리쳤다! 보상: 별 조각 30개');return true;}
export function selectTarget(state,target){if(state.status!=='playing'||!Number.isInteger(target)||!state.enemies[target]||state.enemies[target].hp<=0)return false;state.target=target;return true;}
export function act(state,action){
 if(state.status!=='playing'||!['attack','skill','guard'].includes(action))return false;
 const hero=state.party[state.turn];if(!hero||hero.hp<=0||(action==='skill'&&hero.mp<hero.cost))return false;
 if(!state.enemies[state.target]||state.enemies[state.target].hp<=0)state.target=state.enemies.findIndex(e=>e.hp>0);
 if(state.target<0)return false;
 const target=state.target,enemy=state.enemies[target];
 let damage=0,healing=state.party.map(()=>0);hero.guard=false;
 if(action==='guard'){hero.guard=true;hero.mp=Math.min(hero.maxMp,hero.mp+5);state.log.push(`${hero.name}: 방어! 다음 반격 피해 감소 · MP +5`);}
 else if(action==='skill'&&hero.effect==='heal'){
  hero.mp-=hero.cost;state.party.forEach((p,i)=>{if(p.hp>0){healing[i]=Math.min(hero.heal,p.maxHp-p.hp);p.hp+=healing[i];}});
  state.log.push(`${hero.name}의 장미의 축복! 생존 아군 전체 HP 최대 ${hero.heal} 회복`);
 }else {
  damage=Math.min(enemy.hp,action==='skill'?hero.power:hero.atk);
  if(action==='skill'){
   hero.mp-=hero.cost;
   if(hero.effect==='protect')state.party.filter(h=>h.hp>0).forEach(h=>h.guard=true);
   if(hero.effect==='summon'){state.summon={owner:hero.id,rounds:3};state.log.push('별여우가 나타났다! 이번 라운드부터 3회 지원 공격.');}
   if(hero.effect==='drain'){healing[state.turn]=Math.min(Math.floor(damage/2),hero.maxHp-hero.hp);hero.hp+=healing[state.turn];}
  }
  enemy.hp-=damage;state.log.push(`${hero.name}의 ${action==='skill'?hero.skill:'기본 공격'} → ${enemy.name}: ${damage} 피해${hero.effect==='drain'&&action==='skill'?`, HP ${healing[state.turn]} 흡수`:''}`);
  if(enemy.hp===0)state.log.push(`${enemy.name} 처치!`);
 }
 state.last={actor:state.turn,action,target,damage,healing,enemyHP:state.enemies.map(e=>e.hp),summonAttack:null,enemyStrikes:[],counter:false};
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
  const heavy=state.round%3===0;state.last.counter=true;
  if(state.enemy.hp>0){
   state.log.push(heavy?'잉크 폭발! 모든 아군에게 강력한 반격.':'잉크 파동! 모든 아군에게 반격.');
   state.party.forEach((h,i)=>{if(h.hp>0){const hit=Math.min(h.hp,Math.ceil((heavy?30:18)*(h.guard?0.35:1)));h.hp-=hit;state.last.enemyStrikes.push({enemy:0,target:i,damage:hit});}});
  }
  for(let n=1;n<state.enemies.length;n++){
   if(state.enemies[n].hp===0)continue;
   const living=state.party.map((p,i)=>({p,i})).filter(({p})=>p.hp>0);if(!living.length)break;
   const victim=living[(state.round-1+n-1)%living.length],hit=Math.min(victim.p.hp,Math.ceil((n===1?5:7)*(victim.p.guard?0.35:1)));
   victim.p.hp-=hit;state.last.enemyStrikes.push({enemy:n,target:victim.i,damage:hit});state.log.push(`${state.enemies[n].name}의 공격! ${victim.p.name}에게 ${hit} 피해`);
  }
  state.party.forEach(h=>h.guard=false);state.round++;next=state.party.findIndex(h=>h.hp>0);
  if(state.summon&&!state.party.some(p=>p.id===state.summon.owner&&p.hp>0))state.summon=null;
  if(next===-1){state.status='defeat';state.log.push('낙서들이 잠들었다. 다시 페이지를 펼쳐보자.');}
 }
 if(state.enemies[state.target].hp===0)state.target=state.enemies.findIndex(e=>e.hp>0);
 state.turn=next;state.log=state.log.slice(-40);return true;
}
