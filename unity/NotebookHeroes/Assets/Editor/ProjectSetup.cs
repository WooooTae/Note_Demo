using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Build.Reporting;
using UnityEngine;
using UnityEngine.SceneManagement;
namespace NotebookHeroes.Editor
{
 [InitializeOnLoad] public static class ProjectSetup
 {
  const string ScenePath="Assets/Scenes/Notebook.unity";
  static ProjectSetup(){EditorApplication.delayCall+=EnsureScene;}
  [MenuItem("Notebook Heroes/1. Create or open game scene")]
  public static void Open(){EnsureScene();if(EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())EditorSceneManager.OpenScene(ScenePath);}
  static void EnsureScene(){if(EditorApplication.isPlayingOrWillChangePlaymode||EditorApplication.isCompiling)return;if(!File.Exists(ScenePath)){Directory.CreateDirectory("Assets/Scenes");var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Additive);var go=new GameObject("Notebook Heroes");SceneManager.MoveGameObjectToScene(go,scene);go.AddComponent<NotebookGame>();EditorSceneManager.SaveScene(scene,ScenePath);EditorSceneManager.CloseScene(scene,true);AssetDatabase.Refresh();}EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene(ScenePath,true)};PlayerSettings.companyName="NotebookStudio";PlayerSettings.productName="Notebook Heroes";PlayerSettings.defaultScreenWidth=1600;PlayerSettings.defaultScreenHeight=1000;PlayerSettings.runInBackground=true;}
  [MenuItem("Notebook Heroes/3. Reimport original-size artwork")]
  public static void ReimportArt(){foreach(string guid in AssetDatabase.FindAssets("t:Texture2D",new[]{"Assets/Resources/Art"}))AssetDatabase.ImportAsset(AssetDatabase.GUIDToAssetPath(guid),ImportAssetOptions.ForceUpdate);Debug.Log("Artwork reimported without power-of-two resizing.");}
  [MenuItem("Notebook Heroes/2. Build Windows demo")]
  public static void BuildWindows(){EnsureScene();Directory.CreateDirectory("Builds/Windows");var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{ScenePath},locationPathName="Builds/Windows/NotebookHeroes.exe",target=BuildTarget.StandaloneWindows64,options=BuildOptions.None});if(report.summary.result!=BuildResult.Succeeded)throw new System.Exception("Windows build failed: "+report.summary.result);Debug.Log("Windows build: Builds/Windows/NotebookHeroes.exe");}
 }
 public class ArtImport : AssetPostprocessor
 {
  public override uint GetVersion(){return 2;}
  void OnPreprocessTexture(){if(!assetPath.Contains("Resources/Art/"))return;var t=(TextureImporter)assetImporter;t.textureType=TextureImporterType.Default;t.alphaIsTransparency=true;t.mipmapEnabled=false;t.maxTextureSize=4096;t.npotScale=TextureImporterNPOTScale.None;t.textureCompression=TextureImporterCompression.Uncompressed;}
 }
}
