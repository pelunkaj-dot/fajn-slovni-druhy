"""Převod značek MorphoDiTy (poziční značky PDT) na školní slovní druhy 1–10.

Výjimky odpovídají rozhodnutím v docs/sporna-pojeti.md.
"""
import re

# 1. pozice značky = slovní druh
PODLE_ZNACKY = {'N': 1, 'A': 2, 'P': 3, 'C': 4, 'V': 5,
                'D': 6, 'R': 7, 'J': 8, 'T': 9, 'I': 10}

# lemma → školní druh bez ohledu na značku
PODLE_LEMMATU = {
    'sto': 4, 'tisíc': 4, 'milion': 4, 'milión': 4, 'miliarda': 4,  # body 12, 13
    'rád': 2,                                                          # bod 21
}

# lemmata, se kterými věta do korpusu nepatří
ZAKAZANA = {
    'jiný': 'bod 26: druh záleží na kontextu, větu nahraď jinou',
}


def ciste_lemma(lemma):
    """'štěkat_:T' → 'štěkat', 'na-1' → 'na', 'se_^(zvr._zájmeno)' → 'se'."""
    zaklad = re.split(r'[_`]', lemma or '', maxsplit=1)[0]
    return re.sub(r'-\d+$', '', zaklad)


def skolni_druh(znacka, lemma):
    """Vrátí (druh nebo None, poznámka)."""
    lemma = ciste_lemma(lemma).lower()
    if lemma in PODLE_LEMMATU:
        return PODLE_LEMMATU[lemma], ''
    if not znacka or znacka[0] == 'X':
        return None, 'analyzátor slovo nezná'
    if znacka[0] == 'Z':
        return None, 'analyzátor považuje slovo za interpunkci'
    if znacka[:2] == 'C=':
        return 4, 'číslice – zapiš slovy (bod 18)'
    druh = PODLE_ZNACKY.get(znacka[0])
    if druh is None:
        return None, f'neznámý druh ve značce {znacka}'
    return druh, ''
