"""Sestaví jednosouborový náhled hry (pro claude.ai Artifact): CSS a JS vložené do stránky.

Data zůstávají v data/*.json a publikují se vedle stránky.
Použití: python tools/nahled.py cil.html [--vse]
  --vse  plná verze (jen pro Janovo zkoušení)
"""
import posixpath
import re
import sys
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
PORADI = ['druhy', 'postavy', 'hlasky', 'krajiny', 'data', 'srs', 'engine', 'stavby', 'statistika', 'vsuvky', 'zvuky', 'efekty', 'rezimy/spolecne', 'otaznik', 'rezimy/lov', 'rezimy/most', 'rezimy/padani', 'rezimy/obrana', 'prehled', 'app']


def modul(nazev):
    kod = (KOREN / 'js' / f'{nazev}.js').read_text(encoding='utf-8')
    exporty = re.findall(r'^export (?:async function|function|const) (\w+)', kod, re.M)
    kod = re.sub(r'^export ', '', kod, flags=re.M)

    def importuj(m):
        cesta = posixpath.normpath(posixpath.join(posixpath.dirname(nazev), m[2]))
        cil = 'M_' + cesta.removesuffix('.js').replace('/', '_')
        # „* as x“ → „x“, „{ a as b }“ → destrukturace „{ a: b }“
        jmena = re.sub(r'(\w+) as (\w+)', r'\1: \2', m[1].replace('* as ', ''))
        return f'const {jmena} = {cil};'
    kod = re.sub(r"^import (.+?) from '(.+?)';", importuj, kod, flags=re.M)
    jmeno = 'M_' + nazev.replace('/', '_')
    return f'const {jmeno} = (() => {{\n{kod}\nreturn {{ {", ".join(exporty)} }};\n}})();'


def main(cil, vse=False):
    html = (KOREN / 'index.html').read_text(encoding='utf-8')
    telo = html.split('<body>', 1)[1].split('</body>', 1)[0]
    telo = re.sub(r'<script type="module".*?</script>', '', telo, flags=re.S)
    css = (KOREN / 'css' / 'style.css').read_text(encoding='utf-8')
    # Web má písma u sebe (fonts/). Náhled na claude.ai je jeden soubor: písma bere z Google Fonts
    # (jediný povolený zdroj písem v Artifactu), místní @font-face se vynechají.
    css = re.sub(r"@font-face \{[^}]*\}[^\n]*\n", '', css)
    fonty = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Baloo+2:wght@600;800&display=swap">'
    js = '\n'.join(modul(m) for m in PORADI)
    if vse:
        for a, b in [("parametry.get('mode') === 'full'", 'true')]:
            assert a in js, a
            js = js.replace(a, b)
    stranka = (f'<title>FajnSlovní druhy</title>\n{fonty}\n<style>\n{css}\n</style>\n{telo}\n'
               f'<script>\ndocument.documentElement.dataset.theme="light";\n{js}\n</script>\n')
    Path(cil).write_text(stranka, encoding='utf-8')


if __name__ == '__main__':
    main(sys.argv[1], '--vse' in sys.argv)
