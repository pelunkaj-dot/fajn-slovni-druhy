"""Samostatná slova pro hru Padající slova (korpus/slova.txt).

Slovo bez věty nemá kontext, proto se berou jen slova ze schválených vět světů 1–2
(tam jsou jen jednoznačná slova) a vynechají se tvary, které mají v korpusu víc druhů
nebo jsou víceznačné samy o sobě (např. „je“, „má“, „jí“). Každé slovo kontroluje Jan.

Formát korpus/slova.txt: `0001| pes/1`. Schválená slova jsou v korpus/schvalene.txt jako `w-0001`.

Použití: python tools/slova.py     # doplní do korpus/slova.txt nové kandidáty
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from korpus import KORPUS, id_vety, nacti  # noqa: E402

SLOVA = KORPUS / 'slova.txt'
RE_RADEK = re.compile(r'^(\d{4})\|\s*(\S+)/(10|[1-9])\s*(?:#.*)?$')
# tvary víceznačné bez věty (sloveso × zájmeno, podstatné jméno × sloveso …)
VICEZNACNE = {'je', 'má', 'mé', 'jí', 'ji', 'tři', 'ženu', 'stát', 'moc', 'ráno', 'večer', 'pozor', 'kolem',
              'se', 'si', 'i', 'ať', 'už', 'tu', 'jak', 'tak', 'jen', 'asi', 'snad', 'vedle', 'blízko',
              'okolo', 'díky', 'kvůli', 'hodně', 'málo', 'pár', 'jednou', 'mi', 'tě', 'ti', 'mu', 'svou', 'domácí'}


def nacti_slova():
    """Vrátí [(cislo, tvar, druh)]."""
    if not SLOVA.exists():
        return []
    vysledek = []
    for r in SLOVA.read_text(encoding='utf-8').splitlines():
        if not r.strip() or r.startswith('#'):
            continue
        m = RE_RADEK.match(r)
        if not m:
            raise SystemExit(f'slova.txt: špatný řádek „{r}“')
        vysledek.append((m[1], m[2], int(m[3])))
    return vysledek


def kandidati(schvalene):
    druhy_tvaru, uprostred, vyskyt = {}, set(), {}
    for soubor in sorted(KORPUS.glob('svet[1-5].txt')):
        svet = int(soubor.stem[-1])
        vety, _ = nacti(soubor)
        for v in vety:
            for k, s in enumerate(v.slova):
                druhy_tvaru.setdefault(s.t.lower(), set()).add(s.d)
                if k and s.t[0].isupper():
                    uprostred.add(s.t)
                if svet <= 2 and id_vety(svet, v) in schvalene and not (s.v or s.g or s.p):
                    vyskyt.setdefault((s.t, s.d), k)
    vystup = {}
    for (t, d), k in vyskyt.items():
        # velké písmeno jen u vlastních jmen (velké i uprostřed věty)
        tvar = t if t in uprostred else t.lower()
        if tvar.lower() in VICEZNACNE or len(druhy_tvaru[t.lower()]) > 1:
            continue
        vystup[(tvar, d)] = True
    return sorted(vystup, key=lambda x: (x[1], x[0].lower()))


def main():
    schvalene = set((KORPUS / 'schvalene.txt').read_text(encoding='utf-8').split())
    stara = nacti_slova()
    znama = {(t, d) for _, t, d in stara}
    cislo = max((int(c) for c, _, _ in stara), default=0)
    nove = [k for k in kandidati(schvalene) if k not in znama]
    radky = []
    for t, d in nove:
        cislo += 1
        radky.append(f'{cislo:04d}| {t}/{d}')
    if not SLOVA.exists():
        radky.insert(0, '# Slova pro Padající slova. Formát a pravidla: tools/slova.py')
    with SLOVA.open('a', encoding='utf-8') as f:
        f.write('\n'.join(radky) + ('\n' if radky else ''))
    print(f'nových slov: {len(nove)}, celkem {len(stara) + len(nove)}')


if __name__ == '__main__':
    main()
