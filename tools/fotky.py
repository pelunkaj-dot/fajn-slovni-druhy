"""Fotky krajin pro hru: fotky/svetN.jpg → obrazky/svetN-800.webp a obrazky/svetN-1600.webp,
fotky/mapa.jpg (panorama) → obrazky/mapa-800|1600.webp a rozmazané pozadí obrazky/mapa-pozadi.webp.

Ořízne fotku na poměr 2:1 podle výřezu níže (zlomky šířky a výšky), jemně sjednotí barvy
a uloží dvě velikosti WebP. Zdroje ve fotky/ jsou Janovy fotky zmenšené na 2400 px.

Použití:
    python tools/fotky.py                  # zpracuje všechny světy z VYREZY
    python tools/fotky.py --zdroj N CESTA  # uloží novou fotku světa N do fotky/svetN.jpg (zmenšenou)
"""
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

KOREN = Path(__file__).resolve().parent.parent
FOTKY, OBRAZKY = KOREN / 'fotky', KOREN / 'obrazky'
# svět: (x0, y0, x1) – výřez v poměru 2:1, výška se dopočítá; sytost, kontrast
VYREZY = {
    1: ((0.0, 0.0, 1.0), 1.10, 1.05),     # louka s vrbovkou (Nízké Tatry)
    2: ((0.0, 0.05, 1.0), 1.08, 1.06),    # vodopád v lese
    3: ((0.0, 0.05, 1.0), 1.04, 1.04),    # mlžná louka se smrky
    4: ((0.0, 0.42, 1.0), 1.06, 1.06),    # žulové štíty mezi zalesněnými svahy
    5: ((0.1, 0.0, 0.9), 1.06, 1.08),     # pevnost na kopci (bez domů pod ní)
}
SIRKY = (800, 1600)


def uloz_zdroj(n, cesta):
    im = ImageOps.exif_transpose(Image.open(cesta)).convert('RGB')
    im.thumbnail((2400, 2400), Image.LANCZOS)
    FOTKY.mkdir(exist_ok=True)
    im.save(FOTKY / f'svet{n}.jpg', quality=90)
    print(f'fotky/svet{n}.jpg {im.size}')


def zpracuj(n):
    (x0, y0, x1), sytost, kontrast = VYREZY[n]
    im = Image.open(FOTKY / f'svet{n}.jpg').convert('RGB')
    w, h = im.size
    sirka = (x1 - x0) * w
    box = (round(x0 * w), round(y0 * h), round(x1 * w), round(y0 * h + sirka / 2))
    assert box[3] <= h, f'svět {n}: výřez přesahuje fotku'
    im = im.crop(box)
    im = ImageEnhance.Color(im).enhance(sytost)
    im = ImageEnhance.Contrast(im).enhance(kontrast)
    OBRAZKY.mkdir(exist_ok=True)
    for s in SIRKY:
        vystup = OBRAZKY / f'svet{n}-{s}.webp'
        im.resize((s, s // 2), Image.LANCZOS).save(vystup, quality=78, method=6)
        print(f'{vystup.relative_to(KOREN)} {vystup.stat().st_size // 1024} kB')


def zpracuj_mapu():
    """Panorama nad mapou (ostré) a rozmazané pozadí za celou mapou (malé, prohlížeč ho roztáhne)."""
    im = Image.open(FOTKY / 'mapa.jpg').convert('RGB')
    im = ImageEnhance.Color(im).enhance(1.08)
    for s in SIRKY:
        vystup = OBRAZKY / f'mapa-{s}.webp'
        im.resize((s, round(im.height * s / im.width)), Image.LANCZOS).save(vystup, quality=80, method=6)
        print(f'{vystup.relative_to(KOREN)} {vystup.stat().st_size // 1024} kB')
    # pozadí: střední část panoramatu, na výšku, silně rozmazaná
    stred = im.crop((im.width * 0.3, 0, im.width * 0.7, im.height)).resize((160, 240), Image.LANCZOS)
    stred = stred.filter(ImageFilter.GaussianBlur(6))
    vystup = OBRAZKY / 'mapa-pozadi.webp'
    stred.save(vystup, quality=70)
    print(f'{vystup.relative_to(KOREN)} {vystup.stat().st_size // 1024} kB')


if __name__ == '__main__':
    if len(sys.argv) == 4 and sys.argv[1] == '--zdroj':
        uloz_zdroj(int(sys.argv[2]), sys.argv[3])
    else:
        for n in VYREZY:
            if (FOTKY / f'svet{n}.jpg').exists():
                zpracuj(n)
        if (FOTKY / 'mapa.jpg').exists():
            zpracuj_mapu()
