import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBattle,act,advanceEncounter,enemyAttack,enemyIntent} from './battle.js';
import {serializeSave,restoreSave} from './save.js';
function clearWave(s){s.enemies.forEach(e=>e.hp=1);assert.equal(act(s,'skill',1),true);}
test('new adventures progress normal, epic, boss and only final battle awards victory',()=>{
 const s=createBattle();assert.equal(s.encounter,0);assert.equal(s.enemy.kind,'slime');assert.equal(advanceEncounter(s),false);
 clearWave(s);assert.equal(s.status,'cleared');assert.ok(!s.log.some(x=>x.includes('별 조각')));
 assert.equal(advanceEncounter(s),true);assert.equal(s.encounter,1);assert.equal(s.enemy.kind,'epic');assert.equal(advanceEncounter(s),false);
 clearWave(s);assert.equal(s.status,'cleared');advanceEncounter(s);assert.equal(s.encounter,2);assert.equal(s.enemy.kind,'boss');
 clearWave(s);assert.equal(s.status,'victory');assert.equal(advanceEncounter(s),false);assert.ok(s.log.some(x=>x.includes('별 조각 30')));
});
test('rest carries resources, caps recovery, revives once and resets round, guard and summon',()=>{
 const s=createBattle([0,6,1,3]);clearWave(s);s.party[0].hp=10;s.party[0].mp=0;s.party[1].hp=0;s.party[2].hp=79;s.party[2].mp=35;s.party[3].guard=true;s.summon={owner:6,rounds:2};s.round=8;
 advanceEncounter(s);assert.deepEqual(s.party.map(h=>h.hp),[52,23,80,110]);assert.equal(s.party[0].mp,14);assert.equal(s.party[2].mp,36);assert.equal(s.round,1);assert.equal(s.turn,0);assert.ok(s.party.every(h=>!h.guard));assert.equal(s.summon,null);
 const before=JSON.stringify(s);assert.equal(advanceEncounter(s),false);assert.equal(JSON.stringify(s),before);
});
test('normal enemies use single targets; epic uses scheduled area heavy attacks',()=>{
 const s=createBattle();s.turn=3;act(s,'guard');assert.equal(s.last.enemyStrikes.length,3);assert.deepEqual(s.last.enemyStrikes.map(h=>h.damage),[8,7,9]);
 const e=createBattle(undefined,1);e.enemies[1].hp=0;e.enemies[2].hp=0;e.round=3;e.turn=3;assert.match(enemyIntent(e),/강공 전체 24/);act(e,'guard');assert.deepEqual(e.last.enemyStrikes.map(h=>h.damage),[24,24,24,9]);
});
test('boss rage activates at half HP and stacks with heavy attacks, guard still applies',()=>{
 const s=createBattle(undefined,2);s.enemy.hp=251;assert.equal(enemyAttack(s,0).damage,20);s.enemy.hp=250;assert.equal(enemyAttack(s,0).damage,24);s.round=3;assert.equal(enemyAttack(s,0).damage,38);s.enemies[1].hp=0;s.enemies[2].hp=0;s.turn=3;act(s,'guard');assert.deepEqual(s.last.enemyStrikes.map(h=>h.damage),[38,38,38,14]);
});
test('party protection persists through later allies actions until the counter',()=>{
 const s=createBattle([3,0,1,2],1);s.enemies[1].hp=0;s.enemies[2].hp=0;act(s,'skill');for(let i=0;i<3;i++)act(s,'attack');assert.deepEqual(s.party.map(h=>h.hp),[105,115,75,85]);assert.ok(s.party.every(h=>!h.guard));
});
test('defeat cannot advance and retry creates a fresh first encounter',()=>{
 const s=createBattle(undefined,1);s.party.forEach(h=>h.hp=1);s.turn=3;act(s,'attack');assert.equal(s.status,'defeat');assert.equal(advanceEncounter(s),false);const retry=createBattle(s.party.map(h=>h.id));assert.equal(retry.encounter,0);assert.equal(retry.status,'playing');assert.ok(retry.party.every(h=>h.hp===h.maxHp&&h.mp===h.maxMp));
});
test('save restores every campaign encounter and cleared checkpoint without duplicate rest',()=>{
 for(let i=0;i<3;i++){const s=createBattle(undefined,i);s.party[0].hp=40;s.party[0].mp=15;act(s,'skill');let r=restoreSave(serializeSave(s));assert.ok(r);assert.equal(r.battle.encounter,i);assert.equal(r.battle.enemy.maxHp,s.enemy.maxHp);assert.equal(r.battle.party[0].mp,7);
 s.enemies.forEach(e=>e.hp=0);s.status=i<2?'cleared':'victory';r=restoreSave(serializeSave(s));assert.equal(r.battle.status,s.status);assert.equal(r.battle.party[0].hp,40);if(i<2){assert.equal(advanceEncounter(r.battle),true);const again=restoreSave(serializeSave(r.battle));assert.equal(again.battle.party[0].hp,82);assert.equal(advanceEncounter(again.battle),false);}}
});
test('save rejects invalid campaign index, premature victory, invalid clear and foreign enemy stats',()=>{
 for(const mutate of [s=>s.encounter=3,s=>s.encounter=1.5,s=>{s.enemies.forEach(e=>e.hp=0);s.status='victory';},s=>s.status='cleared',s=>s.enemies[0].hp=81]){const s=createBattle();mutate(s);assert.equal(restoreSave(serializeSave(s)),null);}
 const s=createBattle(undefined,2);s.enemies.forEach(e=>e.hp=0);s.status='cleared';assert.equal(restoreSave(serializeSave(s)),null);
 const canonical=createBattle(undefined,1);canonical.enemy.attack=999;const r=restoreSave(serializeSave(canonical));assert.equal(r.battle.enemy.attack,14);
});
test('version 2 saves remain legacy fights after migration and resaving',()=>{
 const s=createBattle(undefined,-1);act(s,'skill');const old=JSON.stringify({version:2,savedAt:Date.now(),battle:s});const r=restoreSave(old);assert.equal(r.battle.encounter,-1);assert.equal(r.battle.enemy.hp,378);assert.equal(restoreSave(serializeSave(r.battle)).battle.encounter,-1);
});
