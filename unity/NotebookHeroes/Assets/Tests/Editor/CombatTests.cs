using System.Linq;
using NUnit.Framework;
using UnityEngine;
namespace NotebookHeroes.Tests
{
 public class CombatTests
 {
  Catalog c; [SetUp] public void Setup(){c=JsonUtility.FromJson<Catalog>(Resources.Load<TextAsset>("GameData").text);}
  [Test] public void CatalogHasAllHeroesSkillsAndFriends(){Assert.AreEqual(10,c.roles.Length);Assert.IsTrue(c.roles.All(h=>h.skills.Length==3));Assert.AreEqual(5,c.companions.Length);}
  [Test] public void TapeConsumesOneActionWithoutMP(){var b=Combat.Create(c,new[]{0,1,2,3},0,2);b.round=2;b.turn=3;b.enemies[1].hp=b.enemies[2].hp=0;Combat.Act(c,b,"attack");Assert.IsTrue(b.party[1].taped);Combat.Act(c,b,"attack");int mp=b.party[1].mp;Assert.IsNull(Combat.Act(c,b,"skill"));Combat.Act(c,b,"skip");Assert.IsFalse(b.party[1].taped);Assert.AreEqual(mp,b.party[1].mp);Assert.AreEqual(2,b.turn);}
  [Test] public void ShieldFriendBlocksTape(){var b=Combat.Create(c,new[]{0,1,2,3},4,2);b.round=2;b.turn=3;var o=Combat.Act(c,b,"companion");Assert.IsTrue(o.tapeBlocked);Assert.IsFalse(b.party[1].taped);}
  [Test] public void FriendsRefreshOnceOnTransition(){var b=Combat.Create(c,new[]{0,1,2,3},1);b.enemies.ToList().ForEach(e=>e.hp=1);Combat.Act(c,b,"companion");Assert.AreEqual("cleared",b.status);Assert.IsTrue(b.companionUsed);Assert.IsTrue(Combat.Advance(c,b));Assert.IsFalse(b.companionUsed);Assert.AreEqual(1,b.companion);Assert.IsFalse(Combat.Advance(c,b));}
  [Test] public void JsonRoundtripKeepsTapeAndFriend(){var b=Combat.Create(c,new[]{8,9,6,7},3,2);b.party[0].taped=true;b.companionUsed=true;var loaded=JsonUtility.FromJson<SaveEnvelope>(JsonUtility.ToJson(new SaveEnvelope{battle=b}));Assert.IsTrue(Combat.Validate(c,loaded.battle));Assert.IsTrue(loaded.battle.party[0].taped);Assert.AreEqual(3,loaded.battle.companion);Assert.IsTrue(loaded.battle.companionUsed);}
  [Test] public void BadSaveAndInvalidMovesAreRejected(){var b=Combat.Create(c,new[]{0,1,2,3});b.party[0].mp=0;Assert.IsNull(Combat.Act(c,b,"skill"));Assert.AreEqual(0,b.turn);b.companion=5;Assert.IsFalse(Combat.Validate(c,b));}
  [Test] public void RestRevivesAndCapsResources(){var b=Combat.Create(c,new[]{0,1,2,3});b.party[0].hp=0;b.party[1].hp=1;b.enemies.ToList().ForEach(e=>e.hp=0);b.status="cleared";Assert.IsTrue(Combat.Advance(c,b));Assert.AreEqual(30,b.party[0].hp);Assert.AreEqual(29,b.party[1].hp);Assert.AreEqual(1,b.round);Assert.IsTrue(Combat.Validate(c,b));}
  [Test] public void SavedEnemyDefinitionsAreNotTrusted(){var b=Combat.Create(c,new[]{0,1,2,3});b.enemies[0].attack=999;b.enemies[0].name="tampered";Combat.RestoreDefinitions(c,b);Assert.AreEqual(8,b.enemies[0].attack);Assert.AreEqual("먹물 슬라임",b.enemies[0].name);}
 }
}
