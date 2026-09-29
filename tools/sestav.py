"""Sestaví data pro hru: korpus/svetN.txt → data/svetN.json (+ data/ukazkaN.json, data/svety.json).

Do hry jdou jen věty uvedené v korpus/schvalene.txt (zkontrolované Janem).
Novým větám nejdřív dopíše do zdroje stálé číslo. Při chybě formátu nic nezapíše.

Použití:
    python tools/sestav.py                     # schválené věty → data/
    python tools/sestav.py --vse --cil DIR     # všechny věty (náhled ke zkoušení) → DIR
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from korpus import KORPUS, KOREN, cislo_sveta, dopln_cisla, id_vety, nacti  # noqa: E402
from predlozky import posud as posud_predlozku  # noqa: E402
from slova import nacti_slova  # noqa: E402

DATA = KOREN / 'data'
LEMMATA = KORPUS / 'lemmata.tsv'
SCHVALENE = KORPUS / 'schvalene.txt'
MIN_VET = 8  # svět je hratelný, jen když má aspoň jednu sérii vět
AKTIVNI = {1: [1, 2, 5], 2: list(range(1, 11)), 3: list(range(1, 11)),
           4: list(range(1, 11)), 5: list(range(1, 11))}
UKAZKA = 20  # vět z každého světa pro verzi bez ?mode=full
SVETY_SLOV = (1, 2)  # Padající slova: jen světy s jednoznačnými slovy
UKAZKA_SLOV = 40
PODDRUHY = {  # svět 5 (docs/sporna-pojeti.md, bod 49)
    2: ['tvrde', 'mekke', 'privlastnovaci'],
    3: ['osobni', 'zvratne', 'privlastnovaci', 'ukazovaci', 'tazaci', 'vztazne', 'neurcite', 'zaporne'],
    4: ['zakladni', 'radova', 'druhova', 'nasobna'],
}


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
            if svet == 5 and s.d in PODDRUHY and s.p not in PODDRUHY[s.d]:
                chyby.append(f'{kde}: „{s.t}“ – chybí nebo neplatný poddruh ({s.p or "žádný"}), povolené: {", ".join(PODDRUHY[s.d])}')
            if svet == 5 and s.d not in PODDRUHY and s.p:
                chyby.append(f'{kde}: „{s.t}“ – poddruh jen u přídavných jmen, zájmen a číslovek')
        skupiny = {}
        for s in v.slova:
            if s.g:
                skupiny.setdefault(s.g, set()).add(s.d)
        for g, druhy in skupiny.items():
            if len(druhy) > 1:
                chyby.append(f'{kde}: skupina +{g} má slova různých druhů {sorted(druhy)}')
        for a, b in zip(v.slova, v.slova[1:]):
            r = posud_predlozku(a.t, b.t) if a.d == 7 and not a.i else None
            if r and r[0] == 'CHYBA':
                chyby.append(f'{kde}: {r[1]}')
            elif r:
                print(f'  pozor – {kde}: {r[1]}')
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


def nacti_schvalene():
    if not SCHVALENE.exists():
        return set()
    return {r.strip() for r in SCHVALENE.read_text(encoding='utf-8').splitlines() if r.strip() and not r.startswith('#')}


def zapis_slova(cil, vse, schvalene):
    """data/slova.json: {"1": [[tvar, druh], …], "2": …} – slova pro Padající slova."""
    slova = [(t, d) for c, t, d in nacti_slova() if vse or f'w-{c}' in schvalene]
    vystup, ukazka = {}, {}
    for svet in SVETY_SLOV:
        seznam = [[t, d] for t, d in slova if d in AKTIVNI[svet]]
        if len(seznam) >= MIN_VET:
            vystup[svet] = seznam
            krok = max(1, len(seznam) // UKAZKA_SLOV)
            ukazka[svet] = seznam[::krok][:UKAZKA_SLOV]
    for nazev, obsah in (('slova', vystup), ('slova-ukazka', ukazka)):
        (cil / f'{nazev}.json').write_text(json.dumps(obsah, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print('  → slova do hry: ' + ', '.join(f'svět {s}: {len(v)}' for s, v in vystup.items()) if vystup else '  → slova do hry: žádná')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--vse', action='store_true', help='i neschválené věty (jen pro náhled)')
    ap.add_argument('--cil', default=str(DATA), help='kam zapsat JSON')
    a = ap.parse_args()
    cil = Path(a.cil)
    cil.mkdir(parents=True, exist_ok=True)
    schvalene = nacti_schvalene()
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
    svety = {}
    for svet, vety in vystupy.items():
        if not a.vse:
            vety = [v for v in vety if v['id'] in schvalene]
        soubor = cil / f'svet{svet}.json'
        if len(vety) >= MIN_VET:
            zapis(soubor, svet, vety)
            svety[svet] = len(vety)
        elif soubor.exists():
            soubor.unlink()
        print(f'  → do hry: svět {svet}: {len(vety)} vět' + ('' if len(vety) >= MIN_VET else ' (málo, svět se nezobrazí)'))
    (cil / 'svety.json').write_text(json.dumps(svety) + '\n', encoding='utf-8')
    zapis_slova(cil, a.vse, schvalene)
    for svet in svety:
        vety = json.loads((cil / f'svet{svet}.json').read_text(encoding='utf-8'))['vety']
        zapis(cil / f'ukazka{svet}.json', svet, vety[:UKAZKA])
    if (cil / 'ukazka.json').exists():
        (cil / 'ukazka.json').unlink()  # dřívější ukázka jen ze světa 1


if __name__ == '__main__':
    main()
