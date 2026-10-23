"""Package only the authored Unity project; never include editor caches or local saves."""
from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
project=root/'unity/NotebookHeroes'
ignored={'Library','Temp','Obj','Logs','UserSettings','Builds','.vs','.git'}
output=root/'release/Notebook-Heroes-Unity.zip'
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(project.rglob('*')):
  rel=p.relative_to(project)
  if not p.is_file() or any(part in ignored for part in rel.parts):continue
  z.write(p,'NotebookHeroes/'+rel.as_posix())
with zipfile.ZipFile(output) as z:
 assert z.testzip() is None
 for name in ['Assets/Scenes/Notebook.unity','Assets/Scripts/NotebookGame.cs','Assets/Resources/GameData.json','Packages/manifest.json','ProjectSettings/ProjectVersion.txt','README.md']:
  assert 'NotebookHeroes/'+name in z.namelist(),name
print(f'Built {output} ({output.stat().st_size:,} bytes)')
