using System;
using NotebookHeroes;
static class AtlasCheck {
 static void Near(float expected,float actual){if(Math.Abs(expected-actual)>.01f)throw new Exception(expected+" != "+actual);}
 public static void Run(){string[] names={"heroes-doodle","summons-doodle","blade-gunner","boss-doodle","friend-0","prologue"};int count=0;foreach(var name in names){var s=AtlasGeometry.SourceSize(name);foreach(var size in new[]{s,new AtlasSize(2048,1024),new AtlasSize(1024,1024)}){var rect=AtlasGeometry.Crop(name,(int)size.Width,(int)size.Height,s.Width*.2f,s.Height*.1f,s.Width*.4f,s.Height*.3f);Near(size.Width*.2f,rect.X);Near(size.Height*.6f,rect.Y);Near(size.Width*.4f,rect.Width);Near(size.Height*.3f,rect.Height);count++;}}var mage=AtlasGeometry.Crop("heroes-doodle",2048,1024,565,35,475,485);Near(753.3333f,mage.X);Near(633.3333f,mage.Width);Near(504,mage.Y);Console.WriteLine("PASS: "+count+" native/resized atlas crop mappings, plus the mage clipping regression.");}
}
