# Sporná pojetí k rozhodnutí

U každého bodu je můj **návrh** a poznámka, kde se může lišit analyzátor
(MorphoDiTa, značky PDT). Jak se MorphoDiTa skutečně chová, ověří kontrolní
skript. Tady jde o to, co bude ve hře považováno za správně.

**Stav: rozhodnuto (27. 9. 2026).** Body bez výhrady platí podle návrhu.
Sloupec **Svět** říká, odkud se jev smí objevit; do té doby se takové věty nepoužijí.

## A. Slovesa a jejich části

| # | Jev | Příklad | Návrh | Svět | Poznámka k analyzátoru |
|---|-----|---------|-------|------|------------------------|
| 1 | Složený minulý čas | *psal jsem* | obě slova 5, ve hře jedna skupina (stačí určit jednou?) | 3 | značí zvlášť, obě jako sloveso |
| 2 | Budoucí čas | *budu psát* | obě 5, skupina | 3 | shodně |
| 3 | Podmiňovací způsob | *psal bych*, *by* | *by/bych* = 5 (součást slovesa), skupina | 3 | *by* značí jako sloveso (Vc) |
| 4 | *aby, kdyby* | *Přišel, aby pomohl.* | 8 spojka | 4 | spojka (J,) |
| 5 | Zvratné *se/si* u sloves | *smát se, myje si ruce* | **3** zvratné zájmeno | 3 | značí jako zájmeno (P7) |
| 6 | *se* v trpném rodě | *Staví se dům.* | **3** | 3 | zájmeno |
| 7 | *se/ke/ve* jako předložka | *se sestrou* | 7 | 3 | předložka (RV) — kolize s bodem 5 je dobrá záludnost |
| 8 | Trpný rod | *byl postaven* | obě 5, skupina | 3 | *postaven* jako sloveso (Vs) |
| 9 | Infinitiv po modálním slovesu | *musím jít* | obě 5, dvě samostatná slovesa (ne skupina) | 3 | shodně |
| 10 | *být* se jménem | *Je veselý.* | *je* = 5 | 1 | shodně |
| 11 | *prosím, děkuji* jako zdvořilost | *Podej mi to, prosím.* | 5 | 2 | sloveso; někdy částice |

## B. Číslovky

| # | Jev | Příklad | Návrh | Svět | Poznámka |
|---|-----|---------|-------|------|----------|
| 12 | *sto, tisíc* | *tisíc lidí* | 4 | 2 | *sto* jako číslovka; *tisíc* možná jako podstatné jméno |
| 13 | *milion, miliarda* | | **4** (vyjadřuje množství) | 3 | pravděpodobně podstatné jméno |
| 14 | Neurčité číslovky | *mnoho, málo, několik, pár* | 4 | 2 | *pár* může být podstatné jméno (*pár bot*) |
| 15 | *hodně, moc* | *hodně lidí* × *hodně běhá* | 4 × 6 podle kontextu | 3 | často vždy příslovce |
| 16 | *moc* jako podstatné jméno | *moc krále* | 1 | 3 | |
| 17 | *tři* × *třít* | *Tři to hadrem!* | sloveso *třít* **nepoužívat** (v češtině nepřirozené); *tři* jen jako číslovka | 3 | |
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
| 26 | *jiný* | *jiný kluk* | záleží na kontextu → věty s *jiný* do korpusu nedávat | 3 | přídavné jméno |
| 27 | *každý, všechen, sám, žádný* | | 3 | 2 | *každý* někdy jako přídavné jméno |

## D. Zájmena, příslovce, spojky, částice

| # | Jev | Příklad | Návrh | Svět | Poznámka |
|---|-----|---------|-------|------|----------|
| 28 | *co* v souvětí | *Vím, co chceš.* | 3 (vztažné/tázací zájmeno), ne spojka | 4 | zájmeno |
| 29 | *kde, kdy, jak, proč* v souvětí | *Nevím, kde bydlí.* | **6** (tázací/vztažné příslovce). *jak* jen ve významu způsobu nebo míry (*Nevím, jak to udělal.*); pro časové „jakmile“ vždy psát ***jakmile*** (8); dvojici *jak – tak* nepoužívat | 4 | příslovce |
| 30 | *když, že, protože* | | 8 | 4 | shodně |
| 31 | přirovnání | *bílý jako sníh*, *větší než já* | ***jako*** a ***než*** = **8**; *jak* při přirovnání nepoužívat | 4 | |
| 32 | *ať* | *Ať přijde.* × *Ať žije!* | **8** v souvětí za čárkou (*Řekni mu, ať přijde.*) × **9** (*Tak ať.*, *Ať žije!*) | 4 | |
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
| 42 | *Pozor!, Hele!* | | *Pozor!* **10** × *Dávala pozor.* **1**; *hele* 10 | 3 | *hele* možná jako sloveso |
| 43 | Zvuky zvířat | *haf, mňau, kykyryký* | 10 | 1 (zašedlé) / 2 | shodně |

## F. Obecná pravidla korpusu

| # | Otázka | Návrh |
|---|--------|-------|
| 44 | Světy 1–2 | jen slova, kde se škola a analyzátor shodují a nerozhoduje kontext |
| 45 | Víceslovné tvary ve hře | skupina se vyznačí společně a určuje se jednou (body 1–3, 8) |
| 46 | Délka vět ve světě 1 | 3–7 slov |
| 47 | Slovní zásoba | běžná pro 3.–5. třídu, bez archaismů a slangu |
| 48 | Nejistý kontext | když druh slova nejde spolehlivě určit z kontextu věty, věta do korpusu nepatří |

## G. Poddruhy (svět 5)

| # | Otázka | Rozhodnutí / návrh |
|---|--------|-------|
| 49 | Rozsah | jen přídavná jména (tvrdé, měkké, přivlastňovací), zájmena (osobní, zvratné, přivlastňovací, ukazovací, tázací, vztažné, neurčité, záporné) a číslovky (základní, řadové, druhové, násobné) – **rozhodnuto** |
| 50 | Zvratné *se, si, sebe* | zájmeno **zvratné** – **rozhodnuto** (tak se učí na ZŠ; „osobní zvratné“ až na vyšším stupni) |
| 51 | *svůj* | zájmeno **přivlastňovací** – **rozhodnuto** |
| 52 | Tvrdé × měkké přídavné jméno | podle vzoru (mladý × jarní); stupňované tvary (*lepší, nejlepší*) a *poslední* nepoužívat |
| 53 | *co, kdo* v nepřímé otázce (*Vím, co chceš.*) | tázací × vztažné je sporné → ve světě 5 nepoužívat; vztažná zájmena jen s řídícím slovem (*kluk, který…*) |
| 54 | Neurčité číslovky (*mnoho, několik*), *každý, všechen, sám, jiný*, *rád* | ve světě 5 nepoužívat (poddruh sporný) |
