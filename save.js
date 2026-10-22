import {createBattle,validParty} from './battle.js';
export const SAVE_KEY='notebook-heroes-save-v1';
export const PARTY_KEY='notebook-heroes-party-v1';
export function serializeSave(state){return JSON.stringify({version:1,savedAt:Date.now(),battle:state});}
export function restoreSave(raw){
 try{
  const data=JSON.parse(raw),b=data?.battle;if(data?.version!==1||!b||!validParty(b.party?.map(p=>p.id)))return null;
  if(!Number.isFinite(data.savedAt)||data.savedAt<=0)return null;
  const s=createBattle(b.party.map(p=>p.id));
  for(let i=0;i<4;i++){const src=b.party[i],p=s.party[i];if(!Number.isInteger(src.hp)||src.hp<0||src.hp>p.maxHp||!Number.isInteger(src.mp)||src.mp<0||src.mp>p.maxMp||typeof src.guard!=='boolean')return null;p.hp=src.hp;p.mp=src.mp;p.guard=src.guard;}
  if(!Number.isInteger(b.enemy?.hp)||b.enemy.hp<0||b.enemy.hp>420||!Number.isInteger(b.round)||b.round<1||b.round>100000)return null;
  if(!['playing','victory','defeat'].includes(b.status))return null;
  if(b.status==='playing'&&(b.enemy.hp===0||!Number.isInteger(b.turn)||!s.party[b.turn]||s.party[b.turn].hp===0))return null;
  if(b.status==='victory'&&(b.enemy.hp!==0||!s.party.some(p=>p.hp>0)))return null;
  if(b.status==='defeat'&&(s.party.some(p=>p.hp>0)||b.enemy.hp===0))return null;
  s.enemy.hp=b.enemy.hp;s.round=b.round;s.status=b.status;s.turn=b.status==='playing'?b.turn:Math.max(0,s.party.findIndex(p=>p.hp>0));
  s.log=Array.isArray(b.log)?b.log.filter(x=>typeof x==='string'&&x.length<=200).slice(-40):[];
  return {savedAt:data.savedAt,battle:s};
 }catch{return null;}
}
