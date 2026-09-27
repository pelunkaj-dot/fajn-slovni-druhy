"""Sestaví jednosouborový náhled hry (pro claude.ai Artifact): CSS a JS vložené do stránky.

Data zůstávají v data/*.json a publikují se vedle stránky.
Použití: python tools/nahled.py cil.html
"""
import posixpath
import re
import sys
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
PORADI = ['druhy', 'data', 'srs', 'engine', 'rezimy/spolecne', 'rezimy/lov', 'rezimy/most', 'app']


def modul(nazev):
    kod = (KOREN / 'js' / f'{nazev}.js').read_text(encoding='utf-8')
    exporty = re.findall(r'^export (?:async function|function|const) (\w+)', kod, re.M)
    kod = re.sub(r'^export ', '', kod, flags=re.M)

    def importuj(m):
        cesta = posixpath.normpath(posixpath.join(posixpath.dirname(nazev), m[2]))
        cil = 'M_' + cesta.removesuffix('.js').replace('/', '_')
        return f'const {m[1].replace("* as ", "")} = {cil};'
    kod = re.sub(r"^import (.+?) from '(.+?)';", importuj, kod, flags=re.M)
    jmeno = 'M_' + nazev.replace('/', '_')
    return f'const {jmeno} = (() => {{\n{kod}\nreturn {{ {", ".join(exporty)} }};\n}})();'


def main(cil):
    html = (KOREN / 'index.html').read_text(encoding='utf-8')
    telo = html.split('<body>', 1)[1].split('</body>', 1)[0]
    telo = re.sub(r'<script type="module".*?</script>', '', telo, flags=re.S)
    fonty = re.search(r'<link rel="stylesheet" href="https://fonts[^>]+>', html)[0]
    css = (KOREN / 'css' / 'style.css').read_text(encoding='utf-8')
    js = '\n'.join(modul(m) for m in PORADI)
    stranka = (f'<title>FajnSlovní druhy</title>\n{fonty}\n<style>\n{css}\n</style>\n{telo}\n'
               f'<script>\ndocument.documentElement.dataset.theme="light";\n{js}\n</script>\n')
    Path(cil).write_text(stranka, encoding='utf-8')


if __name__ == '__main__':
    main(sys.argv[1])
