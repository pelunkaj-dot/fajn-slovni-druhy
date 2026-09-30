"""Doplní do css/style.css záložní deklarace pro starší prohlížeče bez color-mix()
(iOS Safari < 16.2, Chrome < 111 – starší školní tablety).

Před každou deklaraci s color-mix() vloží stejnou vlastnost, kde je každé
color-mix(in srgb, A p%, B) nahrazené převažující barvou (A při p ≥ 50 %, jinak B).
Nový prohlížeč použije pozdější deklaraci s color-mix, starý ji zahodí a zůstane mu záloha.
Skript je idempotentní: dřívější zálohy (označené /*záloha*/ před středníkem) nejdřív odstraní.

Použití: python tools/zalozni_barvy.py [--kontrola]
  --kontrola  jen ověří, že zálohy jsou aktuální (pro testy); nic nezapíše
"""
import re
import sys
from pathlib import Path

CSS = Path(__file__).resolve().parent.parent / 'css' / 'style.css'
ZNACKA = '/*záloha*/'
# ručně zvolené zálohy tam, kde by převažující barva vypadala špatně
RUCNE = {
    ('background', 'color-mix(in srgb, var(--ink) 45%, transparent)'): 'rgba(0, 0, 0, .5)',
}


def argumenty(text, zacatek):
    """Vrátí (obsah závorky, index za ní) pro závorku otevřenou na text[zacatek]."""
    hloubka = 0
    for i in range(zacatek, len(text)):
        if text[i] == '(':
            hloubka += 1
        elif text[i] == ')':
            hloubka -= 1
            if hloubka == 0:
                return text[zacatek + 1:i], i + 1
    raise ValueError('neuzavřená závorka')


def rozdel(obsah):
    """Rozdělí argumenty podle čárek na nejvyšší úrovni."""
    casti, hloubka, akt = [], 0, ''
    for z in obsah:
        if z == '(':
            hloubka += 1
        elif z == ')':
            hloubka -= 1
        if z == ',' and hloubka == 0:
            casti.append(akt.strip())
            akt = ''
        else:
            akt += z
    casti.append(akt.strip())
    return casti


def barva(cast):
    """„var(--c) 45%“ → („var(--c)“, 45 nebo None)."""
    m = re.match(r'^(.*?)\s+(\d+(?:\.\d+)?)%$', cast, re.S)
    return (m[1].strip(), float(m[2])) if m else (cast.strip(), None)


def nahrad(hodnota):
    out, i = '', 0
    while True:
        j = hodnota.find('color-mix(', i)
        if j < 0:
            return out + hodnota[i:]
        obsah, konec = argumenty(hodnota, j + len('color-mix'))
        _, a, b = rozdel(obsah)
        (ba, pa), (bb, pb) = barva(a), barva(b)
        if pa is None:
            pa = 100 - pb if pb is not None else 50
        out += hodnota[i:j] + nahrad(ba if pa >= 50 else bb)
        i = konec


DEKLARACE = re.compile(r'(?<=[{;\s])([a-z-]+)(\s*:\s*)([^;{}]*?color-mix[^;{}]*)(;|(?=\s*}))', re.S)


def zpracuj(css):
    css = re.sub(r'[a-z-]+\s*:[^;{}]*' + re.escape(ZNACKA) + r';\s*', '', css)

    def rep(m):
        vlastnost, dvojtecka, hodnota, stred = m.groups()
        zaloha = RUCNE.get((vlastnost, hodnota.strip())) or nahrad(hodnota)
        return f'{vlastnost}{dvojtecka}{zaloha.strip()} {ZNACKA}; {vlastnost}{dvojtecka}{hodnota}{stred}'
    return DEKLARACE.sub(rep, css)


def main():
    puvodni = CSS.read_text(encoding='utf-8')
    nove = zpracuj(puvodni)
    if '--kontrola' in sys.argv:
        if nove != puvodni:
            raise SystemExit('css/style.css: zálohy pro color-mix nejsou aktuální, spusť python tools/zalozni_barvy.py')
        return
    CSS.write_text(nove, encoding='utf-8')
    print(f'záloh: {nove.count(ZNACKA)}')


if __name__ == '__main__':
    main()
