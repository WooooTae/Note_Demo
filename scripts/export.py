"""Build the offline HTML and Windows-friendly ZIP using only Python's standard library."""
from pathlib import Path
import base64,re,zipfile
p=Path(__file__).resolve().parents[1]
html=(p/'index.html').read_text()
css=re.sub(r"@import url\([^;]+;\s*",'',(p/'style.css').read_text())
js='\n'.join(re.sub(r'^import .*?;\s*','',(p/name).read_text(),flags=re.M).replace('export const ','const ').replace('export function ','function ') for name in ['battle.js','save.js','scene.js','app.js'])
for asset in (p/'assets').iterdir():
 ref='assets/'+asset.name
 if ref not in css and ref not in js and ref not in html:continue
 mime='image/webp' if asset.suffix=='.webp' else 'image/png'
 data=f'data:{mime};base64,'+base64.b64encode(asset.read_bytes()).decode()
 css=css.replace(ref,data);js=js.replace(ref,data);html=html.replace(ref,data)
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>').replace('<script type="module" src="app.js"></script>','<script>'+js+'</script>')
out=p/'release';out.mkdir(exist_ok=True)
(out/'Game.html').write_text(html)
with zipfile.ZipFile(out/'Notebook-Heroes.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('Notebook-Heroes/Game.html',html)
 z.writestr('Notebook-Heroes/Play.cmd','@echo off\r\nstart "" "%~dp0Game.html"\r\n')
 z.writestr('Notebook-Heroes/README.txt','낙서 용사단 데모\r\n\r\n압축을 풀고 Game.html을 Edge 또는 Chrome으로 여세요.\r\n게임 시작 → 용사 4명 선택 → 모험 시작\r\n전투는 매 행동 완료 후 자동 저장됩니다.\r\n이어하기는 같은 브라우저와 같은 파일 위치에서 사용하세요.\r\n브라우저 데이터 삭제, 시크릿 모드, 파일 이동 시 저장 기록을 읽지 못할 수 있습니다.\r\n저장이 차단되면 화면에 안내가 표시됩니다.\r\n')
print(f'Built {out / "Game.html"} ({len(html.encode()):,} bytes) and ZIP')
