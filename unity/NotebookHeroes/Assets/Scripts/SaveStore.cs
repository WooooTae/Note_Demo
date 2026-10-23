using System;
using System.IO;
using UnityEngine;
namespace NotebookHeroes
{
 [Serializable] public class SaveEnvelope { public int version=1; public Battle battle; }
 public static class SaveStore
 {
  public static string PathName { get {return Path.Combine(Application.persistentDataPath,"notebook-save.json");} }
  public static string Message="";
  public static bool Write(Battle battle)
  {
   try {Directory.CreateDirectory(Application.persistentDataPath);string temp=PathName+".tmp";File.WriteAllText(temp,JsonUtility.ToJson(new SaveEnvelope{battle=battle},true));if(File.Exists(PathName))File.Replace(temp,PathName,PathName+".bak");else File.Move(temp,PathName);Message="자동 저장 완료";return true;}
   catch(Exception e){Message="저장 실패: "+e.Message;Debug.LogWarning(Message);return false;}
  }
  public static Battle Read(Catalog catalog)
  {
   foreach(string path in new[]{PathName,PathName+".bak"}){if(!File.Exists(path))continue;try{var data=JsonUtility.FromJson<SaveEnvelope>(File.ReadAllText(path));if(data==null||data.version!=1||!Combat.Validate(catalog,data.battle))continue;Combat.RestoreDefinitions(catalog,data.battle);Message=path.EndsWith(".bak")?"백업 저장에서 복원했습니다":"저장 기록을 불러왔습니다";return data.battle;}catch(Exception e){Debug.LogWarning("저장 읽기 실패: "+e.Message);}}
   Message=File.Exists(PathName)?"저장 기록을 읽지 못했습니다. 새 모험을 시작할 수 있습니다.":"아직 기록된 모험이 없어요";return null;
  }
 }
}
