import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBattle,act} from './battle.js';
import {removalTimes,animationDuration,ERASE_SECONDS,ENTRANCE_SECONDS,SKETCH_SECONDS,SKETCH_STAGGER,ACTION_SECONDS} from './animation.js';
test('appearance timeline allows the seventh character to finish drawing',()=>{assert.equal(ENTRANCE_SECONDS,6*SKETCH_STAGGER+SKETCH_SECONDS);});
test('direct kills and support kills have distinct erase start times',()=>{
 const before=createBattle([0,6,1,3]);before.enemies[0].hp=1;const after=structuredClone(before);act(after,'attack');let times=removalTimes(before,after);assert.deepEqual(times.enemies,[.70,null,null]);assert(animationDuration(false,times)>(.70+ERASE_SECONDS)*1000);
 const support=createBattle([6,0,1,3]);support.summon={owner:6,rounds:1};support.enemies[0].hp=18;support.turn=3;const next=structuredClone(support);act(next,'guard');times=removalTimes(support,next);assert.equal(times.enemies[0],1.20);assert(animationDuration(true,times)>=(1.20+ERASE_SECONDS)*1000);
});
test('counter deaths finish erasing before defeat or next action is committed',()=>{
 const before=createBattle(undefined,2);before.party.forEach(h=>h.hp=1);before.party[1].hp=0;before.turn=3;const next=structuredClone(before);act(next,'attack');const times=removalTimes(before,next);assert.equal(next.status,'defeat');assert.equal(times.party[1],null);assert.equal(times.party[0],ACTION_SECONDS+.46);assert(animationDuration(true,times)>(ACTION_SECONDS+.46+ERASE_SECONDS)*1000);
});
test('ordinary nonlethal turns keep existing animation lengths',()=>{const before=createBattle(),next=structuredClone(before);act(next,'attack');const times=removalTimes(before,next);assert.ok([...times.enemies,...times.party].every(x=>x===null));assert.equal(animationDuration(false,times),1600);assert.equal(animationDuration(true,times),2850);});
