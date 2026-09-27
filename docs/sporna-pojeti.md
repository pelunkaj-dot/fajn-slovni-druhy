# Sporná pojetí k rozhodnutí

U každého bodu je můj **návrh** a poznámka, kde se může lišit analyzátor
(MorphoDiTa, značky PDT). Jak se MorphoDiTa skutečně chová, ověří kontrolní
skript. Tady jde o to, co bude ve hře považováno za správně.

Stačí odpovědět číslem bodu a „OK“, nebo napsat jiné rozhodnutí.
Sloupec **Svět** říká, odkud se jev smí objevit; do té doby se takové věty nepoužijí.

## A. Slovesa a jejich části

| # | Jev | Příklad | Návrh | Svět | Poznámka k analyzátoru |
|---|-----|---------|-------|------|------------------------|
| 1 | Složený minulý čas | *psal jsem* | obě slova 5, ve hře jedna skupina (stačí určit jednou?) | 3 | značí zvlášť, obě jako sloveso |
| 2 | Budoucí čas | *budu psát* | obě 5, skupina | 3 | shodně |
| 3 | Podmiňovací způsob | *psal bych*, *by* | *by/bych* = 5 (součást slovesa), skupina | 3 | *by* značí jako sloveso (Vc) |
| 4 | *aby, kdyby* | *Přišel, aby pomohl.* | 8 spojka | 4 | spojka (J,) |
| 5 | Zvratné *se/si* u sloves | *smát se, myje si ruce* | ? — varianty: (a) 5 jako součást slovesa, (b) 3 zvratné zájmeno | 3 | značí jako zájmeno (P7) |
| 6 | *se* v trpném rodě | *Staví se dům.* | stejně jako bod 5 | 3 | zájmeno |
| 7 | *se/ke/ve* jako předložka | *se sestrou* | 7 | 3 | předložka (RV) — kolize s bodem 5 je dobrá záludnost |
| 8 | Trpný rod | *byl postaven* | obě 5, skupina | 3 | *postaven* jako sloveso (Vs) |
| 9 | Infinitiv po modálním slovesu | *musím jít* | obě 5, dvě samostatná slovesa (ne skupina) | 3 | shodně |
| 10 | *být* se jménem | *Je veselý.* | *je* = 5 | 1 | shodně |
| 11 | *prosím, děkuji* jako zdvořilost | *Podej mi to, prosím.* | 5 | 2 | sloveso; někdy částice |

## B. Číslovky

| # | Jev | Příklad | Návrh | Svět | Poznámka |
|---|-----|---------|-------|------|----------|
| 12 | *sto, tisíc* | *tisíc lidí* | 4 | 2 | *sto* jako číslovka; *tisíc* možná jako podstatné jméno |
| 13 | *milion, miliarda* | | 4 (nebo 1?) | 3 | pravděpodobně podstatné jméno |
| 14 | Neurčité číslovky | *mnoho, málo, několik, pár* | 4 | 2 | *pár* může být podstatné jméno (*pár bot*) |
| 15 | *hodně, moc* | *hodně lidí* × *hodně běhá* | 4 × 6 podle kontextu | 3 | často vždy příslovce |
| 16 | *moc* jako podstatné jméno | *moc krále* | 1 | 3 | |
| 17 | *tři* × *třít* | *Tři to hadrem!* | 5 v rozkazu | 3 | kontext |
| 18 | Číslovky napsané číslicí | *3 jablka* | nepoužívat, vždy slovy | – | |
| 19 | *dvakrát, poprvé, dvojí* | | 4 (násobná, řadová, druhová) | 2 | *poprvé* může být příslovce |
| 20 | *oba* | *oba kluci* | 4 | 3 | značí jako číslovku |

## C. Jména

| # | Jev | Příklad | Návrh | Svět | Poznámka |
|---|-----|---------|-------|------|----------|
| 21 | *rád* | *Rád čtu.* | 2 (jmenný tvar přídavného jména) | 3 | krátké přídavné jméno (AC) |
| 22 | Jmenné tvary přídavných jmen | *zdráv, spokojen* | 2 | 3 | *spokojen* možná jako sloveso |
| 23 | Zpodstatnělá přídavná jména | *vrátný, hajný, pokojská* | 1 | 3 | značí jako přídavné jméno |
| 24 | Víceslovná vlastní jména | *Nový Jičín, Česká republika* | každé slovo zvlášť (2 + 1) | 2 | |
| 25 | *ráno, večer* | *Ráno vstávám.* × *krásné ráno* | 6 × 1 | 3 | kontext |
| 26 | *jiný* | *jiný kluk* | 2 nebo 3? (učebnice se liší) | 3 | přídavné jméno |
| 27 | *každý, všechen, sám, žádný* | | 3 | 2 | *každý* někdy jako přídavné jméno |

## D. Zájmena, příslovce, spojky, částice

| # | Jev | Příklad | Návrh | Svět | Poznámka |
|---|-----|---------|-------|------|----------|
| 28 | *co* v souvětí | *Vím, co chceš.* | 3 (vztažné/tázací zájmeno), ne spojka | 4 | zájmeno |
| 29 | *kde, kdy, jak, proč* v souvětí | *Nevím, kde bydlí.* | 6 (vztažné příslovce), ne spojka | 4 | příslovce |
| 30 | *když, že, protože* | | 8 | 4 | shodně |
| 31 | *jak* při porovnání | *větší jak já* | 8 (nebo takové věty vynechat, spisovně *než*) | 4 | |
| 32 | *ať* | *Ať přijde.* × *Ať žije!* | 8 × 9? (nebo vždy 9) | 4 | |
| 33 | *ano, ne* jako odpověď | *Ano, půjdu.* | 9 | 2 | *ano* možná jako citoslovce |
| 34 | *i* | *pes i kočka* × *i ty?* | 8 × 9 | 4 | |
| 35 | Částice | *prý, asi, jen, kéž, copak, snad* | 9 | 2 (jen jednoznačné: *prý, kéž*) | *asi, jen* často jako příslovce |
| 36 | *kolem, okolo, vedle* | *kolem domu* × *šel kolem* | 7 × 6 | 3 | kontext |
| 37 | *díky, kvůli, během* | *díky tobě* | 7 | 3 | *díky* může být podstatné jméno |
| 38 | *nikdy, nikde* × *nikdo, nic* | | 6 × 3 | 2 | shodně |
| 39 | *to* ve větě *To je pravda.* | | 3 | 2 | shodně |
| 40 | *jeho, její, jejich* | *jeho pes* × *vidím jeho* | vždy 3; poddruh přivlastňovací × osobní (svět 5) | 5 | |

## E. Citoslovce

| # | Jev | Příklad | Návrh | Svět | Poznámka |
|---|-----|---------|-------|------|----------|
| 41 | Citoslovce jako přísudek | *A on bác do vody.* | 10 | 3 | |
| 42 | *Pozor!, Hele!* | | *pozor* 1 nebo 10? *hele* 10 | 3 | *hele* možná jako sloveso |
| 43 | Zvuky zvířat | *haf, mňau, kykyryký* | 10 | 1 (zašedlé) / 2 | shodně |

## F. Obecná pravidla korpusu

| # | Otázka | Návrh |
|---|--------|-------|
| 44 | Světy 1–2 | jen slova, kde se škola a analyzátor shodují a nerozhoduje kontext |
| 45 | Víceslovné tvary ve hře | skupina se vyznačí společně a určuje se jednou (body 1–3, 8) |
| 46 | Délka vět ve světě 1 | 3–7 slov |
| 47 | Slovní zásoba | běžná pro 3.–5. třídu, bez archaismů a slangu |
