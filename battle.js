export const roles=[
 {name:'불꽃 기사',color:'#c05c3c',icon:'⚔',skill:'화염 참격',hp:120,mp:24,atk:18,cost:8,power:42},
 {name:'푸른 마법사',color:'#527caa',icon:'✦',skill:'별빛 마법',hp:80,mp:36,atk:12,cost:9,power:48},
 {name:'숲의 궁수',color:'#66805a',icon:'➶',skill:'연속 사격',hp:90,mp:24,atk:20,cost:8,power:40},
 {name:'빛의 창술사',color:'#b09248',icon:'✧',skill:'수호의 창',hp:110,mp:24,atk:16,cost:8,power:32}
];
export function createBattle(){return {party:roles.map(x=>({...x,maxHp:x.hp,maxMp:x.mp,guard:false})),enemy:{hp:420,maxHp:420},turn:0,round:1,status:'playing',log:['잉크의 왕이 길을 막았다. 용사단의 첫 번째 밤이 시작된다.'],last:null};}
export function act(state,action){
 if(state.status!=='playing'||!['attack','skill','guard'].includes(action))return false;
 const hero=state.party[state.turn];if(action==='skill'&&hero.mp<hero.cost)return false;
 let damage=0;hero.guard=false;
 if(action==='guard'){hero.guard=true;hero.mp=Math.min(hero.maxMp,hero.mp+5);state.log.push(`${hero.name}: 방어! 다음 반격 피해 감소 · MP +5`);}
 else {damage=action==='skill'?hero.power:hero.atk;if(action==='skill'){hero.mp-=hero.cost;if(state.turn===3)state.party.filter(h=>h.hp>0).forEach(h=>h.guard=true);}state.enemy.hp=Math.max(0,state.enemy.hp-damage);state.log.push(`${hero.name}의 ${action==='skill'?hero.skill:'기본 공격'}! ${damage} 피해`);}
 state.last={actor:state.turn,action,damage};
 if(state.enemy.hp===0){state.status='victory';state.log.push('페이지를 지켰다! 보상: 별 조각 30개');return true;}
 let next=state.party.findIndex((h,i)=>i>state.turn&&h.hp>0);
 if(next===-1){const heavy=state.round%3===0;state.log.push(heavy?'잉크 폭발! 모든 아군에게 강력한 반격.':'잉크 파동! 모든 아군에게 반격.');state.party.forEach(h=>{if(h.hp>0){const hit=Math.ceil((heavy?30:18)*(h.guard?0.35:1));h.hp=Math.max(0,h.hp-hit);h.guard=false;}});state.round++;next=state.party.findIndex(h=>h.hp>0);if(next===-1){state.status='defeat';state.log.push('낙서들이 잠들었다. 다시 페이지를 펼쳐보자.');}}
 state.turn=next;return true;
}
