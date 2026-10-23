using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using NotebookHeroes;
class Check {
 static JsonSerializerOptions opt=new JsonSerializerOptions{IncludeFields=true};
 static void Main(string[] args){var c=JsonSerializer.Deserialize<Catalog>(File.ReadAllText(args[0]),opt);using var doc=JsonDocument.Parse(File.ReadAllText(args[1]));int count=0;foreach(var scenario in doc.RootElement.EnumerateArray()){var ids=scenario.GetProperty("ids").EnumerateArray().Select(x=>x.GetInt32()).ToArray();var b=Combat.Create(c,ids,scenario.GetProperty("companion").GetInt32(),scenario.GetProperty("stage").GetInt32());foreach(var step in scenario.GetProperty("steps").EnumerateArray()){var action=step.GetProperty("action").GetString();if(action=="advance"){if(!Combat.Advance(c,b))throw new Exception("advance rejected");}else if(Combat.Act(c,b,action,step.GetProperty("skill").GetInt32())==null)throw new Exception("action rejected");var snapshot=new{b.encounter,b.round,b.turn,b.target,b.status,b.companion,b.companionUsed,b.summonRounds,party=b.party.Select(h=>new{h.id,h.hp,h.mp,h.guard,h.taped}).ToArray(),enemies=b.enemies.Select(e=>e.hp).ToArray()};var actual=JsonSerializer.Serialize(snapshot,opt);var expected=step.GetProperty("expected").GetRawText();if(actual!=expected)throw new Exception("Mismatch at "+count+" "+action+"\n"+actual+"\n"+expected);if(!Combat.Validate(c,b))throw new Exception("Generated state fails validation at "+count);count++;}}Console.WriteLine("PASS: "+count+" C# combat states exactly match the JavaScript game; all validate.");}
}
