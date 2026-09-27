# Struktura repozitáře a datový formát

## Složky

```
index.html              vstup; čte ?mode=full a ?theme=
css/style.css           motivy light (výchozí) / dark / girl přes CSS proměnné
js/
  druhy.js              číselník 1–10: názvy, barvy, pomocné otázky
  data.js               načtení a validace světa
  srs.js                opakování s rozestupy (localStorage)
  engine.js             kolo hry, postup při chybě (pokus → nápověda → řešení)
  mapa.js               výběr světa, odemykání, % území
  rezimy/<rezim>.js     jeden soubor na herní režim
  app.js                propojení, motivy
data/                   GENEROVANÉ JSON soubory pro hru (neupravovat ručně)
  svet1.json … svet5.json
  ukazka.json           vzorek pro verzi bez ?mode=full
korpus/                 ZDROJ vět – tady se píše a opravuje
  svet1.txt … svet5.txt
tools/
  sestav.py             korpus/*.txt → data/*.json + kontrola formátu
  kontrola.py           MorphoDiTa → školní druhy → neshody.csv
  mapovani.py           převod značek MorphoDiTy na 1–10 + dohodnuté výjimky
tests/
```

## Zdrojový formát (`korpus/svetN.txt`)

Jedna věta na řádek. Každé slovo má za lomítkem číslo slovního druhu.
Interpunkce je samostatně, bez čísla.

```
Malý/2 pes/1 štěká/5 .
Ráno/6* jsme/5+ šli/5+ ven/6 .
Tři/4 kluci/1 hrají/5 fotbal/1 .      # za mřížkou komentář
```

Značky za číslem:

| zápis        | význam                                                     |
|--------------|------------------------------------------------------------|
| `/5`         | slovní druh 1–10                                           |
| `*`          | víceznačné slovo (druh určuje kontext)                     |
| `+`          | část složeného tvaru (skupina 1); `+2` = druhá skupina ve větě, slova nemusí stát vedle sebe |
| `:osobni`    | poddruh (jen svět 5), např. `jeho/3:privlastnovaci`        |
| `{text}`     | vlastní nápověda, např. `ráno/6*{Kdy? – ráno.}`            |

Řádek začínající `@jevy:` přidá štítky jevů k následující větě
(např. `@jevy: kontext, slozeny-tvar`).

## Výstup pro hru (`data/svetN.json`)

```json
{
  "svet": 1,
  "aktivni": [1, 2, 5],
  "vety": [
    { "id": "s1-0001", "jevy": [],
      "slova": [
        {"t": "Malý",  "d": 2, "l": "malý"},
        {"t": "pes",   "d": 1, "l": "pes"},
        {"t": "štěká", "d": 5, "l": "štěkat", "i": "."}
      ] }
  ]
}
```

| pole | význam                                              |
|------|-----------------------------------------------------|
| `t`  | text slova                                          |
| `d`  | slovní druh 1–10                                    |
| `l`  | lemma (doplní skript; klíč pro opakování)           |
| `p`  | poddruh (svět 5)                                    |
| `v`  | `true` = víceznačné                                 |
| `g`  | číslo skupiny složeného tvaru v rámci věty          |
| `n`  | vlastní nápověda                                    |
| `i`  | interpunkce za slovem                               |

`aktivni` říká, které druhy se ve světě určují; ostatní slova jsou zašedlá.
Opakování s rozestupy sleduje dvojice *lemma + druh* a štítky `jevy`.
ID vět jsou stálá, aby se po úpravě korpusu neztratil postup hráčů:
`sestav.py` nové větě dopíše ID na začátek řádku (`0001| Malý/2 pes/1 …`)
a to se už nemění.

## Nástroje

```
python tools/sestav.py                 # zdroj → data/*.json, doplní čísla vět
python tools/kontrola.py --svet 1      # neshody s MorphoDiTou → tools/vystup/neshody_svet1.csv
python -m unittest discover tests      # testy nástrojů
```

`kontrola.py` bez parametru `--model` volá REST API LINDAT (potřebuje internet).
Po kontrole spusť znovu `sestav.py`, aby se do dat dostala lemmata.
