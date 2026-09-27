"""Čtení zdrojového formátu korpusu (korpus/svetN.txt).

Formát je popsaný v docs/format-dat.md.
"""
import re
from dataclasses import dataclass, field
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
KORPUS = KOREN / 'korpus'

NAZVY = {
    1: 'podstatné jméno', 2: 'přídavné jméno', 3: 'zájmeno', 4: 'číslovka',
    5: 'sloveso', 6: 'příslovce', 7: 'předložka', 8: 'spojka',
    9: 'částice', 10: 'citoslovce',
}

RE_ID = re.compile(r'^(\d{4,})\|\s*')
RE_TOKEN = re.compile(r'[^\s{]+\{[^}]*\}|\S+')
RE_SLOVO = re.compile(
    r'^(?P<t>[^/\s]+)/(?P<d>10|[1-9])'
    r'(?P<v>\*)?'
    r'(?:\+(?P<g>\d*))?'
    r'(?::(?P<p>[a-z_]+))?'
    r'(?:\{(?P<n>[^}]*)\})?$'
)
RE_INTERPUNKCE = re.compile(r'^[.,!?;:…–\-"„“()]+$')


@dataclass
class Slovo:
    t: str
    d: int
    v: bool = False
    g: int = 0
    p: str = ''
    n: str = ''
    i: str = ''


@dataclass
class Veta:
    cislo: str          # '0001', prázdné u nové věty
    radek: int          # číslo řádku ve zdroji (od 1)
    slova: list = field(default_factory=list)
    jevy: list = field(default_factory=list)

    def text(self):
        return ' '.join(s.t + s.i for s in self.slova)


class ChybaKorpusu(Exception):
    pass


def rozloz_radek(text, radek):
    """Rozloží text věty (bez ID) na slova. Vyhodí ChybaKorpusu."""
    slova = []
    for token in RE_TOKEN.findall(text):
        if RE_INTERPUNKCE.match(token):
            if not slova:
                raise ChybaKorpusu(f'ř. {radek}: interpunkce na začátku věty: {token}')
            slova[-1].i += token
            continue
        m = RE_SLOVO.match(token)
        if not m:
            raise ChybaKorpusu(f'ř. {radek}: nesrozumitelné slovo „{token}“ (chybí /číslo?)')
        g = m['g']
        slova.append(Slovo(
            t=m['t'], d=int(m['d']), v=bool(m['v']),
            g=0 if g is None else int(g or 1),
            p=m['p'] or '', n=(m['n'] or '').strip(),
        ))
    if not slova:
        raise ChybaKorpusu(f'ř. {radek}: prázdná věta')
    return slova


def nacti(cesta):
    """Vrátí (věty, chyby) ze zdrojového souboru."""
    vety, chyby, jevy = [], [], []
    for radek, puvodni in enumerate(Path(cesta).read_text(encoding='utf-8').splitlines(), 1):
        text = re.sub(r'(^|\s)#.*$', '', puvodni).strip()
        if not text:
            continue
        if text.startswith('@jevy:'):
            jevy = [j.strip() for j in text[6:].split(',') if j.strip()]
            continue
        m = RE_ID.match(text)
        cislo = m[1] if m else ''
        if m:
            text = text[m.end():]
        try:
            vety.append(Veta(cislo, radek, rozloz_radek(text, radek), jevy))
        except ChybaKorpusu as e:
            chyby.append(str(e))
        jevy = []
    return vety, chyby


def dopln_cisla(cesta):
    """Dopíše čísla novým větám přímo do zdrojového souboru. Vrátí počet doplněných."""
    cesta = Path(cesta)
    vety, _ = nacti(cesta)
    pouzita = [int(v.cislo) for v in vety if v.cislo]
    dalsi = max(pouzita, default=0) + 1
    radky = cesta.read_text(encoding='utf-8').splitlines()
    doplneno = 0
    for v in vety:
        if v.cislo:
            continue
        v.cislo = f'{dalsi:04d}'
        radky[v.radek - 1] = f'{v.cislo}| {radky[v.radek - 1].lstrip()}'
        dalsi += 1
        doplneno += 1
    if doplneno:
        cesta.write_text('\n'.join(radky) + '\n', encoding='utf-8')
    return doplneno


def cislo_sveta(cesta):
    return int(re.search(r'svet(\d)', Path(cesta).name)[1])


def id_vety(svet, veta):
    return f's{svet}-{veta.cislo}'
