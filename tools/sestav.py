"""Sestaví data pro hru: korpus/svetN.txt → data/svetN.json (+ data/ukazka.json).

Novým větám nejdřív dopíše do zdroje stálé číslo. Při chybě formátu nic nezapíše.

Použití:
    python tools/sestav.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from korpus import KORPUS, KOREN, cislo_sveta, dopln_cisla, id_vety, nacti  # noqa: E402

DATA = KOREN / 'data'
LEMMATA = KORPUS / 'lemmata.tsv'
AKTIVNI = {1: [1, 2, 5], 2: list(range(1, 11)), 3: list(range(1, 11)),
           4: list(range(1, 11)), 5: list(range(1, 11))}
UKAZKA = (1, 20)  # svět a počet vět pro verzi bez ?mode=full


def nacti_lemmata():
    lemmata = {}
    if LEMMATA.exists():
        for r in LEMMATA.read_text(encoding='utf-8').splitlines()[1:]:
            ident, pozice, slovo, lemma = r.split('\t')
            lemmata[(ident, int(pozice))] = (slovo, lemma)
    return lemmata


def over(svet, vety):
    """Obsahové kontroly nad rámec formátu. Vrátí seznam chyb."""
    chyby, texty = [], {}
    for v in vety:
        kde = f'svet{svet}.txt ř. {v.radek}'
        if v.text() in texty:
            chyby.append(f'{kde}: stejná věta jako na ř. {texty[v.text()]}')
        texty[v.text()] = v.radek
        for s in v.slova:
            if svet <= 2 and (s.v or s.g):
                chyby.append(f'{kde}: „{s.t}“ – ve světě {svet} jen jednoznačná slova bez složených tvarů')
            if svet < 5 and s.p:
                chyby.append(f'{kde}: „{s.t}“ – poddruh jen ve světě 5')
        if svet == 1 and not any(s.d in AKTIVNI[1] for s in v.slova):
            chyby.append(f'{kde}: věta nemá žádné slovo k určení')
    return chyby


def slovo_json(s, lemma):
    o = {'t': s.t, 'd': s.d}
    if lemma:
        o['l'] = lemma
    for klic in ('p', 'v', 'g', 'n', 'i'):
        if getattr(s, klic):
            o[klic] = getattr(s, klic)
    return o


def veta_json(svet, v, lemmata):
    ident = id_vety(svet, v)
    slova = []
    for pozice, s in enumerate(v.slova):
        ulozene = lemmata.get((ident, pozice))
        slova.append(slovo_json(s, ulozene[1] if ulozene and ulozene[0] == s.t else ''))
    return {'id': ident, 'jevy': v.jevy, 'slova': slova}


def zapis(cesta, svet, vety):
    """Jedna věta na řádek – čitelné rozdíly v gitu."""
    radky = [json.dumps(v, ensure_ascii=False, separators=(',', ':')) for v in vety]
    hlava = json.dumps({'svet': svet, 'aktivni': AKTIVNI[svet]}, ensure_ascii=False)[:-1]
    cesta.write_text(hlava + ',"vety":[\n' + ',\n'.join(radky) + '\n]}\n', encoding='utf-8')


def main():
    DATA.mkdir(exist_ok=True)
    lemmata = nacti_lemmata()
    vystupy, chyby = {}, []
    for soubor in sorted(KORPUS.glob('svet[1-5].txt')):
        svet = cislo_sveta(soubor)
        _, chyby_formatu = nacti(soubor)
        if chyby_formatu:
            chyby += [f'{soubor.name} {c}' for c in chyby_formatu]
            continue
        doplneno = dopln_cisla(soubor)
        vety, _ = nacti(soubor)
        chyby += over(svet, vety)
        vystupy[svet] = [veta_json(svet, v, lemmata) for v in vety]
        print(f'svět {svet}: {len(vety)} vět' + (f', doplněno {doplneno} čísel' if doplneno else ''))
    if chyby:
        print('\n'.join(chyby))
        raise SystemExit(f'{len(chyby)} chyb, data nezapsána')
    for svet, vety in vystupy.items():
        zapis(DATA / f'svet{svet}.json', svet, vety)
    svet, pocet = UKAZKA
    if svet in vystupy:
        zapis(DATA / 'ukazka.json', svet, vystupy[svet][:pocet])


if __name__ == '__main__':
    main()
