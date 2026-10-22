import {createBattle,validParty} from './battle.js';
export const SAVE_KEY='notebook-heroes-save-v1';
export const PARTY_KEY='notebook-heroes-party-v1';
export function serializeSave(state){return JSON.stringify({version:3,savedAt:Date.now(),battle:state});}
export function restoreSave(raw){
 try{
  const data=JSON.parse(raw),b=data?.battle;if(![1,2,3].includes(data?.version)||!b||!validParty(b.party?.map(p=>p.id)))return null;
  if(!Number.isFinite(data.savedAt)||data.savedAt<=0)return null;
  const encounter=data.version<3?-1:b.encounter;
  if(!Number.isInteger(encounter)||encounter< -1||encounter>2)return null;
  const s=createBattle(b.party.map(p=>p.id),encounter);
  for(let i=0;i<4;i++){const src=b.party[i],p=s.party[i];if(!Number.isInteger(src.hp)||src.hp<0||src.hp>p.maxHp||!Number.isInteger(src.mp)||src.mp<0||src.mp>p.maxMp||typeof src.guard!=='boolean')return null;p.hp=src.hp;p.mp=src.mp;p.guard=src.guard;}
  if(!Number.isInteger(b.enemy?.hp)||b.enemy.hp<0||b.enemy.hp>s.enemy.maxHp||!Number.isInteger(b.round)||b.round<1||b.round>100000)return null;
  if(data.version===1){s.enemies[0].hp=b.enemy.hp;s.enemies[1].hp=0;s.enemies[2].hp=0;s.target=0;}
  else{
   if(!Array.isArray(b.enemies)||b.enemies.length!==3)return null;
   for(let i=0;i<3;i++){const src=b.enemies[i];if(src.id!==i||!Number.isInteger(src.hp)||src.hp<0||src.hp>s.enemies[i].maxHp)return null;s.enemies[i].hp=src.hp;}
   if(b.enemy.hp!==s.enemy.hp)return null;
   if(!Number.isInteger(b.target)||b.target<0||b.target>2)return null;s.target=b.target;
   if(b.summon!==null&&b.summon!==undefined){if(b.summon.owner!==6||!Number.isInteger(b.summon.rounds)||b.summon.rounds<1||b.summon.rounds>3||!s.party.some(p=>p.id===6&&p.hp>0))return null;s.summon={owner:6,rounds:b.summon.rounds};}
  }
  if(!['playing','cleared','victory','defeat'].includes(b.status))return null;
  const enemiesAlive=s.enemies.some(e=>e.hp>0),heroesAlive=s.party.some(p=>p.hp>0);
  if(b.status==='playing'&&(!enemiesAlive||!Number.isInteger(b.turn)||!s.party[b.turn]||s.party[b.turn].hp===0||s.enemies[s.target].hp===0))return null;
  if(b.status==='victory'&&(enemiesAlive||!heroesAlive||(encounter>=0&&encounter<2)))return null;
  if(b.status==='cleared'&&(enemiesAlive||!heroesAlive||encounter<0||encounter>=2))return null;
  if(b.status==='defeat'&&(heroesAlive||!enemiesAlive))return null;
  s.round=b.round;s.status=b.status;s.turn=b.status==='playing'?b.turn:Math.max(0,s.party.findIndex(p=>p.hp>0));
  s.log=Array.isArray(b.log)?b.log.filter(x=>typeof x==='string'&&x.length<=200).slice(-40):[];
  return {savedAt:data.savedAt,battle:s};
 }catch{return null;}
}
