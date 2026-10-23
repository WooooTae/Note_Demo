using NUnit.Framework;
using UnityEditor;
using UnityEngine;
namespace NotebookHeroes.Tests
{
 public class ArtImportTests
 {
  [Test] public void MageCropTracksResizedImports(){var r=AtlasGeometry.Crop("heroes-doodle",2048,1024,565,35,475,485);Assert.AreEqual(753.3333f,r.X,.01f);Assert.AreEqual(633.3333f,r.Width,.01f);Assert.AreEqual(504,r.Y,.01f);}
  [Test] public void ImportedTexturesKeepOriginalPixelDimensions(){foreach(string name in new[]{"heroes-doodle","summons-doodle","blade-gunner","boss-doodle","prologue","friend-0","friend-1","friend-2","friend-3","friend-4"}){var texture=Resources.Load<Texture2D>("Art/"+name);var size=AtlasGeometry.SourceSize(name);Assert.IsNotNull(texture,name);Assert.AreEqual((int)size.Width,texture.width,name);Assert.AreEqual((int)size.Height,texture.height,name);var importer=(TextureImporter)AssetImporter.GetAtPath(AssetDatabase.GetAssetPath(texture));Assert.AreEqual(TextureImporterNPOTScale.None,importer.npotScale,name);}}
  [Test] public void AllHeroCropsStayInsideAtlas(){for(int i=0;i<10;i++){var sprite=PaperArt.Hero(i);Assert.IsNotNull(sprite);Assert.GreaterOrEqual(sprite.rect.xMin,0);Assert.GreaterOrEqual(sprite.rect.yMin,0);Assert.LessOrEqual(sprite.rect.xMax,sprite.texture.width);Assert.LessOrEqual(sprite.rect.yMax,sprite.texture.height);}Assert.AreEqual(6,PaperArt.Hero(3).vertices.Length,"Spear portrait clips the neighboring drawing");}
 }
}
