"""Didaktické vsuvky: korpus/vsuvky.txt → data/vsuvky.json (volá sestav.py).

Formát zdroje je popsaný v hlavičce korpus/vsuvky.txt. Do hry jdou jen vsuvky,
jejichž id je v korpus/schvalene.txt (s --vse všechny).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from korpus import KORPUS  # noqa: E402

ZDROJ = KORPUS / 'vsuvky.txt'
ZVYRAZNENE = re.compile(r'^\[(.+)\]/(\d+)$')


def veta(text):
    """„Pes běží [rychle]/6 .“ → [{"t": "Pes"}, …, {"t": "rychle", "d": 6}, {"t": "."}]"""
    slova = []
    for tok in text.split():
        m = ZVYRAZNENE.match(tok)
        slova.append({'t': m[1], 'd': int(m[2])} if m else {'t': tok})
    return slova


def nacti(zdroj=ZDROJ):
    """Vrátí (vsuvky, chyby)."""
    vsuvky, chyby, v = [], [], None
    for c, radek in enumerate(zdroj.read_text(encoding='utf-8').splitlines(), 1):
        radek = radek.strip()
        if not radek or radek.startswith('#'):
            continue
        if radek.startswith('=='):
            m = re.match(r'^==\s*(v-[\d-]+)\s*\|\s*([\d ]+)$', radek)
            if not m:
                chyby.append(f'ř. {c}: špatná hlavička „{radek}“')
                v = None
                continue
            v = {'id': m[1], 'druhy': [int(x) for x in m[2].split()], 'priklady': [], 'radek': c}
            vsuvky.append(v)
            continue
        if v is None:
            chyby.append(f'ř. {c}: text mimo vsuvku')
            continue
        klic, _, hodnota = radek.partition(':')
        hodnota = hodnota.strip()
        if klic in ('nadpis', 'pravidlo'):
            v[klic] = hodnota
        elif klic in ('priklad', 'ukol'):
            text, _, vysvetleni = hodnota.partition('|')
            polozka = {'slova': veta(text), 'vysvetleni': vysvetleni.strip()}
            if klic == 'priklad':
                v['priklady'].append(polozka)
            else:
                v['ukol'] = polozka
        elif klic == 'moznosti':
            v['moznosti'] = [int(x) for x in hodnota.split()]
        else:
            chyby.append(f'ř. {c}: neznámá položka „{klic}“')
    for v in vsuvky:
        chyby += [f'{v["id"]}: {ch}' for ch in over(v)]
    ids = [v['id'] for v in vsuvky]
    chyby += [f'{i}: id je dvakrát' for i in sorted({i for i in ids if ids.count(i) > 1})]
    return vsuvky, chyby


def over(v):
    chyby = []
    druhy = v['druhy']
    if not 1 <= len(druhy) <= 2 or any(not 1 <= d <= 10 for d in druhy):
        chyby.append('druhy musí být jeden nebo dva z 1–10')
    if len(druhy) == 2 and druhy[0] >= druhy[1]:
        chyby.append('dvojice se píše vzestupně (např. 2 6)')
    ocekavane_id = 'v-' + '-'.join(str(d) for d in druhy)
    if v['id'] != ocekavane_id:
        chyby.append(f'id má být {ocekavane_id}')
    for k in ('nadpis', 'pravidlo', 'ukol'):
        if not v.get(k):
            chyby.append(f'chybí {k}')
    if len(v['priklady']) != 2:
        chyby.append('mají být přesně dva příklady')
    for p in v['priklady'] + ([v['ukol']] if v.get('ukol') else []):
        zv = [s for s in p['slova'] if 'd' in s]
        if len(zv) != 1:
            chyby.append(f'„{" ".join(s["t"] for s in p["slova"])}“: má být právě jedno zvýrazněné slovo')
        elif zv[0]['d'] not in druhy and p is not v.get('ukol'):
            chyby.append(f'„{zv[0]["t"]}“: druh {zv[0]["d"]} nepatří do vsuvky')
        if not p['vysvetleni']:
            chyby.append(f'„{" ".join(s["t"] for s in p["slova"])}“: chybí vysvětlení')
    if len(druhy) == 2:
        if 'moznosti' in v:
            chyby.append('u dvojice se možnosti nepíšou')
        v['moznosti'] = druhy
    elif len(v.get('moznosti', [])) != 2 or druhy[0] not in v.get('moznosti', []):
        chyby.append('u jednoho druhu musí být „moznosti:“ se dvěma druhy včetně toho vysvětlovaného')
    if v.get('ukol'):
        zv = [s for s in v['ukol']['slova'] if 'd' in s]
        if zv and zv[0]['d'] not in v.get('moznosti', []):
            chyby.append('správná odpověď úkolu není mezi možnostmi')
    return chyby


def zapis(cil, vse, schvalene):
    vsuvky, chyby = nacti()
    if chyby:
        print('\n'.join(f'vsuvky.txt {ch}' for ch in chyby))
        raise SystemExit(f'{len(chyby)} chyb ve vsuvkách, data nezapsána')
    vybrane = [{k: x for k, x in v.items() if k != 'radek'} for v in vsuvky if vse or v['id'] in schvalene]
    radky = [json.dumps(v, ensure_ascii=False, separators=(',', ':')) for v in vybrane]
    (cil / 'vsuvky.json').write_text('[\n' + ',\n'.join(radky) + '\n]\n', encoding='utf-8')
    print(f'  → vsuvky do hry: {len(vybrane)} z {len(vsuvky)}')
