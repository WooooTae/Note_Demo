"""Bundle the demo into one offline HTML; no third-party tooling required."""
from pathlib import Path
import base64,re
p=Path(__file__).resolve().parents[1]
html=(p/'index.html').read_text()
css=re.sub(r"@import url\([^;]+;\s*",'',(p/'style.css').read_text())
js='\n'.join(re.sub(r'^import .*?;\s*','', (p/name).read_text(),flags=re.M).replace('export const ','const ').replace('export function ','function ') for name in ['battle.js','scene.js','app.js'])
for name,mime in [('cover.webp','image/webp'),('heroes-original.png','image/png'),('boss-original.png','image/png'),('characters-painted.png','image/png')]:
 data=f'data:{mime};base64,'+base64.b64encode((p/'assets'/name).read_bytes()).decode()
 css=css.replace('assets/'+name,data);js=js.replace('assets/'+name,data)
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>').replace('<script type="module" src="app.js"></script>','<script>'+js+'</script>')
out=Path('/workspace/exports/Notebook-Heroes-Painted.html');out.parent.mkdir(parents=True,exist_ok=True);out.write_text(html)
print(out)
