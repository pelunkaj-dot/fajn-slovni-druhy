"""Kontrola korpusu morfologickým analyzátorem MorphoDiTa.

Porovná slovní druhy v korpus/svetN.txt s tím, co určí MorphoDiTa, a neshody
vypíše do tools/vystup/neshody_svetN.csv (středník, UTF-8, otevře se v Excelu).
Zároveň uloží lemmata do korpus/lemmata.tsv (používá je sestav.py).

Použití:
    python tools/kontrola.py                  # všechny světy, REST API LINDAT
    python tools/kontrola.py --svet 1
    python tools/kontrola.py --model czech-morfflex2.0-pdtc1.0-220710.tagger
"""
import argparse
import csv
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from korpus import KORPUS, KOREN, NAZVY, cislo_sveta, id_vety, nacti  # noqa: E402
from mapovani import ZAKAZANA, ciste_lemma, skolni_druh  # noqa: E402

LINDAT_URL = 'https://lindat.mff.cuni.cz/services/morphodita/api/tag'
VYSTUP = KOREN / 'tools' / 'vystup'
LEMMATA = KORPUS / 'lemmata.tsv'
DAVKA = 200  # vět na jeden dotaz na API


def tokeny(veta):
    """Tokeny věty pro analyzátor: slova i interpunkce (kvůli kontextu)."""
    out = []
    for s in veta.slova:
        out.append(s.t)
        out.extend(s.i)
    return out


class LindatAnalyzator:
    def __init__(self, url=LINDAT_URL):
        self.url = url

    def analyzuj(self, vety_tokenu):
        """Seznam vět (seznamů tokenů) → seznam vět [(lemma, značka), ...]."""
        vysledek = []
        for i in range(0, len(vety_tokenu), DAVKA):
            davka = vety_tokenu[i:i + DAVKA]
            data = urllib.parse.urlencode({
                'data': '\n\n'.join('\n'.join(v) for v in davka) + '\n',
                'input': 'vertical', 'output': 'json', 'guesser': 'yes',
            }).encode()
            try:
                with urllib.request.urlopen(self.url, data, timeout=60) as r:
                    odpoved = json.load(r)
            except OSError as e:
                raise SystemExit(f'LINDAT nedostupný ({e}). Zkus to později, nebo použij --model.')
            vysledek += [[(t['lemma'], t['tag']) for t in v] for v in odpoved['result']]
        return vysledek


class LokalniAnalyzator:
    def __init__(self, cesta_modelu):
        from ufal.morphodita import Forms, TaggedLemmas, Tagger
        self.tagger = Tagger.load(str(cesta_modelu))
        if not self.tagger:
            raise SystemExit(f'Model se nepodařilo načíst: {cesta_modelu}')
        self._Forms, self._TaggedLemmas = Forms, TaggedLemmas

    def analyzuj(self, vety_tokenu):
        vysledek = []
        for v in vety_tokenu:
            forms, lemmas = self._Forms(), self._TaggedLemmas()
            for t in v:
                forms.push_back(t)
            self.tagger.tag(forms, lemmas)
            vysledek.append([(lemmas[i].lemma, lemmas[i].tag) for i in range(len(lemmas))])
        return vysledek


def zkontroluj(svet, vety, analyzator):
    """Vrátí (řádky neshod pro CSV, řádky lemmat)."""
    analyzy = analyzator.analyzuj([tokeny(v) for v in vety])
    neshody, lemmata = [], []
    for veta, analyza in zip(vety, analyzy):
        ident = id_vety(svet, veta)
        if len(analyza) != len(tokeny(veta)):
            raise SystemExit(f'{ident}: analyzátor vrátil jiný počet tokenů')
        # přeskakujeme analýzy interpunkce, aby indexy odpovídaly slovům
        k = 0
        for pozice, s in enumerate(veta.slova):
            lemma, znacka = analyza[k]
            k += 1 + len(s.i)
            druh, poznamka = skolni_druh(znacka, lemma)
            lemma = ciste_lemma(lemma)
            lemmata.append((ident, pozice, s.t, lemma))
            if lemma.lower() in ZAKAZANA:
                poznamka = ZAKAZANA[lemma.lower()]
            elif druh == s.d and not poznamka:
                continue
            if s.v and druh != s.d:
                poznamka = (poznamka + '; ' if poznamka else '') + 'označeno jako víceznačné – ověř kontext'
            neshody.append({
                'id': ident, 'veta': veta.text(), 'pozice': pozice + 1, 'slovo': s.t,
                'korpus': f'{s.d} {NAZVY[s.d]}',
                'analyzator': f'{druh} {NAZVY[druh]}' if druh else '?',
                'znacka': znacka, 'lemma': lemma, 'poznamka': poznamka,
            })
    return neshody, lemmata


def zapis_csv(cesta, radky):
    cesta.parent.mkdir(parents=True, exist_ok=True)
    pole = ['id', 'veta', 'pozice', 'slovo', 'korpus', 'analyzator', 'znacka', 'lemma', 'poznamka']
    with open(cesta, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, pole, delimiter=';')
        w.writeheader()
        w.writerows(radky)


def zapis_lemmata(nova):
    """Sloučí nová lemmata do korpus/lemmata.tsv (přepíše věty, které se kontrolovaly)."""
    stara = {}
    if LEMMATA.exists():
        for r in LEMMATA.read_text(encoding='utf-8').splitlines()[1:]:
            ident, pozice, slovo, lemma = r.split('\t')
            stara[(ident, int(pozice))] = (slovo, lemma)
    zkontrolovane = {ident for ident, *_ in nova}
    stara = {k: v for k, v in stara.items() if k[0] not in zkontrolovane}
    for ident, pozice, slovo, lemma in nova:
        stara[(ident, pozice)] = (slovo, lemma)
    radky = ['id\tpozice\tslovo\tlemma'] + [
        f'{i}\t{p}\t{s}\t{l}' for (i, p), (s, l) in sorted(stara.items())]
    LEMMATA.write_text('\n'.join(radky) + '\n', encoding='utf-8')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--svet', type=int, help='jen tento svět (1–5)')
    ap.add_argument('--model', help='cesta k lokálnímu modelu .tagger (jinak REST API LINDAT)')
    a = ap.parse_args()

    analyzator = LokalniAnalyzator(a.model) if a.model else LindatAnalyzator()
    soubory = sorted(KORPUS.glob('svet[1-5].txt'))
    if a.svet:
        soubory = [s for s in soubory if cislo_sveta(s) == a.svet]
    vsechna_lemmata = []
    for soubor in soubory:
        svet = cislo_sveta(soubor)
        vety, chyby = nacti(soubor)
        if chyby:
            print('\n'.join(chyby))
            raise SystemExit(f'{soubor.name}: nejdřív oprav chyby formátu')
        bez_cisla = [v.radek for v in vety if not v.cislo]
        if bez_cisla:
            raise SystemExit(f'{soubor.name}: věty bez čísla (ř. {bez_cisla[:5]}), spusť nejdřív sestav.py')
        neshody, lemmata = zkontroluj(svet, vety, analyzator)
        vsechna_lemmata += lemmata
        cil = VYSTUP / f'neshody_svet{svet}.csv'
        zapis_csv(cil, neshody)
        print(f'svět {svet}: {len(vety)} vět, {len(neshody)} neshod → {cil.relative_to(KOREN)}')
    zapis_lemmata(vsechna_lemmata)


if __name__ == '__main__':
    main()
