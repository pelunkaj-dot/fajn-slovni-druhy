"""Kontrola slabičných a neslabičných předložek (v/ve, k/ke, s/se, z/ze …) v korpusu.

Pravidla jsou orientační: tvrdá chyba se hlásí jako CHYBA (např. „v vodě“, „k kamarádovi“,
„s sestrou“), sporný případ jako ZVAŽ („v sboru“ → „ve sboru“). Každý nález posoudí člověk.

Použití: python tools/predlozky.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from korpus import KORPUS, nacti  # noqa: E402

SAMOHLASKY = set('aáeéěiíoóuúůyý')
# předložka → (souhlásky, před kterými je slabičná podoba povinná)
POVINNE = {
    'v': set('vf'),
    'k': set('kg'),
    's': set('szšž'),
    'z': set('szšž'),
}
SLABICNE = {'ve': 'v', 'ke': 'k', 'se': 's', 'ze': 'z', 'ode': 'od', 'nade': 'nad', 'pode': 'pod',
            'přede': 'před', 'beze': 'bez', 'skrze': 'skrz'}
# ustálená spojení, kde je slabičná podoba správně i před jednoduchou souhláskou
VYJIMKY_SLABICNE = {('ke', 'mně'), ('ve', 'dne'), ('se', 'mnou'), ('ode', 'mne'), ('beze', 'mne'),
                    ('ze', 'mne'), ('přede', 'mnou'), ('nade', 'mnou'), ('pode', 'mnou'), ('ke', 'mne'),
                    ('ve', 'mně'), ('ve', 'městě'), ('ve', 'městech'), ('ve', 'jménu')}


def zacatek(slovo):
    s = slovo.lower()
    if s.startswith('ch'):
        return 'ch', s[2:3]
    return s[:1], s[1:2]


def posud(predlozka, slovo):
    """Vrátí (úroveň, zpráva) nebo None."""
    p = predlozka.lower()
    prvni, druha = zacatek(slovo)
    # skupina souhlásek; před „tr, pr, kl…“ (druhá souhláska r, l) se předložka nemění: v trávě, v Praze
    shluk = prvni not in SAMOHLASKY and druha and druha not in SAMOHLASKY and druha not in 'rl'
    if p in POVINNE:
        if prvni in POVINNE[p]:
            return 'CHYBA', f'„{predlozka} {slovo}“ → „{predlozka}e {slovo}“'
        if shluk:
            return 'ZVAŽ', f'„{predlozka} {slovo}“: skupina souhlásek na začátku, nemá být „{predlozka}e“?'
    if p in SLABICNE and (p, slovo.lower()) not in VYJIMKY_SLABICNE:
        zaklad = SLABICNE[p]
        povinne = POVINNE.get(zaklad, set())
        if prvni in SAMOHLASKY or (not shluk and prvni not in povinne):
            return 'ZVAŽ', f'„{predlozka} {slovo}“: nemá být „{zaklad} {slovo}“?'
    return None


def main():
    nalezy = 0
    for soubor in sorted(KORPUS.glob('svet[1-5].txt')):
        vety, _ = nacti(soubor)
        for v in vety:
            for a, b in zip(v.slova, v.slova[1:]):
                if a.d != 7 or a.i:
                    continue
                r = posud(a.t, b.t)
                if r:
                    nalezy += 1
                    print(f'{soubor.name} {v.cislo}  {r[0]:5}  {r[1]}   ({v.text()})')
    print(f'{nalezy} nálezů')


if __name__ == '__main__':
    main()
