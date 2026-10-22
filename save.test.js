import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBattle as createAnyBattle,act} from './battle.js';
import {serializeSave,restoreSave} from './save.js';
const createBattle=(ids)=>createAnyBattle(ids,-1);
test('save restores selected party and progress with authoritative definitions',()=>{const s=createBattle([5,4,3,0]);act(s,'skill');const saved=restoreSave(serializeSave(s));assert.equal(saved.battle.turn,1);assert.equal(saved.battle.enemy.hp,368);assert.equal(saved.battle.party[0].mp,20);assert.deepEqual(saved.battle.party.map(p=>p.id),[5,4,3,0]);});
test('corrupt and incompatible saves are rejected',()=>{assert.equal(restoreSave('bad'),null);for(const mutate of [b=>b.party[0].hp=-1,b=>b.turn=8,b=>b.enemy.hp=999,b=>b.party[0].id=20,b=>b.status='unknown']){const s=createBattle();mutate(s);assert.equal(restoreSave(serializeSave(s)),null);}});
test('victory and defeat save files restore results',()=>{for(const status of ['victory','defeat']){const s=createBattle();s.status=status;if(status==='victory')s.enemies.forEach(e=>e.hp=0);else{s.party.forEach(p=>p.hp=0);s.turn=-1;}assert.equal(restoreSave(serializeSave(s)).battle.status,status);}});

test('version 2 preserves all enemy HP, target and summon duration',()=>{const s=createBattle([6,7,0,3]);s.target=2;s.summon={owner:6,rounds:2};s.enemies[1].hp=0;s.enemies[2].hp=31;const r=restoreSave(serializeSave(s));assert.deepEqual(r.battle.enemies.map(e=>e.hp),[420,0,31]);assert.equal(r.battle.target,2);assert.deepEqual(r.battle.summon,{owner:6,rounds:2});assert.equal(r.battle.enemy,r.battle.enemies[0]);});
test('old saves migrate without adding new enemies mid-battle',()=>{const s=createBattle();delete s.enemies;delete s.target;delete s.summon;const r=restoreSave(JSON.stringify({version:1,savedAt:Date.now(),battle:s}));assert.ok(r);assert.deepEqual(r.battle.enemies.map(e=>e.hp),[420,0,0]);});
test('bad targets and invalid summons are rejected',()=>{for(const mutate of [s=>s.target=8,s=>s.enemies[0].hp=0,s=>s.summon={owner:6,rounds:0},s=>s.summon={owner:7,rounds:2}]){const s=createBattle([6,7,0,3]);mutate(s);assert.equal(restoreSave(serializeSave(s)),null);}});
