export const roles=[
 {id:0,name:'불꽃 기사',tag:'화염 · 근접',desc:'불꽃을 두른 검으로 앞장서는 용사.',color:'#c05c3c',icon:'⚔',skill:'화염 참격',hp:120,mp:24,atk:18,cost:8,power:42,effect:'fire'},
 {id:1,name:'푸른 마법사',tag:'별빛 · 마법',desc:'작은 지팡이에 밤하늘의 힘을 담아요.',color:'#527caa',icon:'✦',skill:'별빛 마법',hp:80,mp:36,atk:12,cost:9,power:48,effect:'magic'},
 {id:2,name:'숲의 궁수',tag:'바람 · 연속',desc:'숲의 바람처럼 빠르고 정확한 화살.',color:'#66805a',icon:'➶',skill:'연속 사격',hp:90,mp:24,atk:20,cost:8,power:40,effect:'arrow'},
 {id:3,name:'빛의 창술사',tag:'빛 · 보호',desc:'황금빛 창으로 동료를 지켜요.',color:'#b09248',icon:'✧',skill:'수호의 창',hp:110,mp:24,atk:16,cost:8,power:32,effect:'protect'},
 {id:4,name:'장미 성직자',tag:'장미 · 회복',desc:'지워진 용기를 다시 피어나게 해요.',color:'#b56c88',icon:'❀',skill:'장미의 축복',hp:90,mp:40,atk:13,cost:10,power:0,heal:30,effect:'heal'},
 {id:5,name:'그림자 도적',tag:'그림자 · 쌍검',desc:'잉크보다 빠르게 스치는 두 개의 칼날.',color:'#806498',icon:'☽',skill:'그림자 쌍검',hp:85,mp:30,atk:22,cost:10,power:52,effect:'rogue'}
];
export function validParty(ids){return Array.isArray(ids)&&ids.length===4&&new Set(ids).size===4&&ids.every(id=>Number.isInteger(id)&&roles[id]);}
export function createBattle(ids=[0,1,2,3]){
 if(!validParty(ids))throw new Error('서로 다른 용사 4명을 선택하세요.');
 return {party:ids.map(id=>({...roles[id],maxHp:roles[id].hp,maxMp:roles[id].mp,guard:false})),enemy:{hp:420,maxHp:420},turn:0,round:1,status:'playing',log:['잉크의 왕이 길을 막았다. 용사단의 첫 번째 밤이 시작된다.'],last:null};
}
export function act(state,action){
 if(state.status!=='playing'||!['attack','skill','guard'].includes(action))return false;
 const hero=state.party[state.turn];if(!hero||hero.hp<=0||(action==='skill'&&hero.mp<hero.cost))return false;
 let damage=0,healing=state.party.map(()=>0);hero.guard=false;
 if(action==='guard'){hero.guard=true;hero.mp=Math.min(hero.maxMp,hero.mp+5);state.log.push(`${hero.name}: 방어! 다음 반격 피해 감소 · MP +5`);}
 else if(action==='skill'&&hero.effect==='heal'){
  hero.mp-=hero.cost;state.party.forEach((p,i)=>{if(p.hp>0){healing[i]=Math.min(hero.heal,p.maxHp-p.hp);p.hp+=healing[i];}});
  state.log.push(`${hero.name}의 장미의 축복! 생존 아군 전체 HP 최대 ${hero.heal} 회복`);
 }else {
  damage=action==='skill'?hero.power:hero.atk;
  if(action==='skill'){hero.mp-=hero.cost;if(hero.effect==='protect')state.party.filter(h=>h.hp>0).forEach(h=>h.guard=true);}
  state.enemy.hp=Math.max(0,state.enemy.hp-damage);state.log.push(`${hero.name}의 ${action==='skill'?hero.skill:'기본 공격'}! ${damage} 피해`);
 }
 state.last={actor:state.turn,action,damage,healing};
 if(state.enemy.hp===0){state.status='victory';state.log.push('페이지를 지켰다! 보상: 별 조각 30개');return true;}
 let next=state.party.findIndex((h,i)=>i>state.turn&&h.hp>0);
 if(next===-1){const heavy=state.round%3===0;state.log.push(heavy?'잉크 폭발! 모든 아군에게 강력한 반격.':'잉크 파동! 모든 아군에게 반격.');state.party.forEach(h=>{if(h.hp>0){const hit=Math.ceil((heavy?30:18)*(h.guard?0.35:1));h.hp=Math.max(0,h.hp-hit);h.guard=false;}});state.round++;next=state.party.findIndex(h=>h.hp>0);if(next===-1){state.status='defeat';state.log.push('낙서들이 잠들었다. 다시 페이지를 펼쳐보자.');}}
 state.turn=next;state.log=state.log.slice(-40);return true;
}
