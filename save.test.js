import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBattle,act} from './battle.js';
import {serializeSave,restoreSave} from './save.js';
test('save restores selected party and progress with authoritative definitions',()=>{const s=createBattle([5,4,3,0]);act(s,'skill');const saved=restoreSave(serializeSave(s));assert.equal(saved.battle.turn,1);assert.equal(saved.battle.enemy.hp,368);assert.equal(saved.battle.party[0].mp,20);assert.deepEqual(saved.battle.party.map(p=>p.id),[5,4,3,0]);});
test('corrupt and incompatible saves are rejected',()=>{assert.equal(restoreSave('bad'),null);for(const mutate of [b=>b.party[0].hp=-1,b=>b.turn=8,b=>b.enemy.hp=999,b=>b.party[0].id=20,b=>b.status='unknown']){const s=createBattle();mutate(s);assert.equal(restoreSave(serializeSave(s)),null);}});
test('victory and defeat save files restore results',()=>{for(const status of ['victory','defeat']){const s=createBattle();s.status=status;if(status==='victory')s.enemy.hp=0;else{s.party.forEach(p=>p.hp=0);s.turn=-1;}assert.equal(restoreSave(serializeSave(s)).battle.status,status);}});
