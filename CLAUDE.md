# FajnSlovní druhy – zadání projektu

Komunikuj se mnou česky. Šetři tokeny: neopakuj celé soubory, měň jen to, co je potřeba, a nevysvětluj samozřejmosti. Před velkými rozhodnutími (architektura, herní mechanika, sporná jazyková pojetí) se zeptej, nehádej.

## O mně a platformě
Jan, učitel a doučovatel (12+ let praxe), vývojář platformy fajndoucko.cz (sekce FajnCvičebna).
- Moduly jsou samostatné HTML stránky na GitHub Pages (`pelunkaj-dot.github.io/fdc-plugin/`), backend je Vercel proxy (`fajndoucko.vercel.app`, repo `fdc-gateway`). API klíče nikdy nesmí být viditelné v klientovi a nesmí existovat žádný panel pro zadávání klíčů.
- Přístup řídí WordPress/FAPI přes URL parametr `?mode=full`. Bez něj běží omezená ukázková verze.
- Tři motivy vždy: světlý (výchozí, nikdy ne tmavý jako výchozí), tmavý a „dívčí“ (pastelově růžový).
- Pedagogický postup při chybě: 1. chyba → „Zkus to znovu“ (bez nápovědy); 2. chyba → nabídne se tlačítko Nápověda; 3. chyba → ukáže se správná odpověď.
- Skládání větších souborů z částí dělej Pythonem, nikdy ne `sed`.
- Postavičky platformy: Matýsek a Terezka (lze využít jako hrdiny hry).
- Veškerý český jazykový obsah kontroluju sám. Na správnost značení od LLM se nespoléhej.

## Cíl
Hra na procvičování určování slovních druhů. Určování slovních druhů je základ, bez kterého dítě nenajde přísudek, podmět ani nezvládne shodu. Hra musí být o mnoho zábavnější než školní aplikace a musí nabídnout obrovské množství příkladů: některé děti potřebují stovky až tisíce opakování.

## Školní konvence
Slovní druhy se označují čísly 1–10 (jako nad slovy v sešitě), v UI číslo + barva:
1 podstatná jména, 2 přídavná jména, 3 zájmena, 4 číslovky, 5 slovesa, 6 příslovce, 7 předložky, 8 spojky, 9 částice, 10 citoslovce.
Nápovědy formou pomocných otázek („Zeptej se: kdo, co?“, „Co dělá?“, „Jaký?“), aby dítě učilo postup, ne tipování.

## Struktura: 5 světů podle obtížnosti (ne podle ročníků)
Hráč si svět vybírá. Každý svět má vlastní prostředí.
1. Jen podstatná jména, přídavná jména a slovesa; ostatní slova ve větě jsou zašedlá. Jednoduché věty, jen jednoznačná slova.
2. Všech 10 druhů. Jednoduché věty, jednoznačná slova.
3. Záludnosti v jednoduché větě: druh určený kontextem (ráno, dobře, tři – číslovka × sloveso třít, po, ten), složené slovesné tvary (psal jsem, budu psát), zvratné se, infinitiv.
4. Souvětí: spojky × příslovce × vztažná a tázací zájmena (co, kdy, kde, jak), částice.
5. Mistrovský svět: druh + poddruh (přídavné jméno tvrdé/měkké/přivlastňovací; zájmeno osobní/zvratné/přivlastňovací/ukazovací/tázací/vztažné/neurčité/záporné; číslovka základní/řadová/druhová/násobná). Rozsah potvrzen: poddruhy jen u přídavných jmen, zájmen a číslovek; ostatní mluvnické kategorie (rod, vzor, pád…) patří do jiného modulu.

Pohyb mezi světy: všechny světy jsou otevřené od začátku, žádné odemykání (starší žák nesmí být nucen procházet lehčí světy). Dokončení světa je jen odměna (oslava, skryté oblasti).
Dokončení světa: cca 60–70 % území, počítané z úspěšnosti v sériích, ne z počtu pokusů (nesmí jít proklikat).
Bonusy pro jedničkáře: zbytek do 100 % jako skryté oblasti, zlatá varianta světa, časovka.

## Herní režimy
Rychlá herní smyčka vhodná pro dril. Režimy se mají střídat, aby to neomrzelo. Kandidáti:
- tower defense – slova přicházejí jako nepřátelé, každý druh chce správnou „zbraň“,
- stavba mostu – správně určené slovo = dílek mostu, boss = dlouhé souvětí,
- lov – najdi ve větě všechna slova daného druhu na čas.
Začni jedním režimem; který, s tebou vyberu.

## Opakování
Opakování s rozestupy: slova a jevy, ve kterých dítě chybuje, se vrací častěji, zvládnuté řidčeji. Postup ukládej do localStorage.

## Data
Věty nejsou procedurálně generované, jde o korpus. Cíl: spíš tisíce než stovky vět na svět.
- Ukládej je do JSON souborů po světech, oddělených od kódu hry.
- Každé slovo: text, slovní druh (1–10), poddruh (svět 5), příznak víceznačnosti, volitelně vlastní nápověda.
- Kontrolní skript v Pythonu: nechá věty označkovat morfologickým analyzátorem MorphoDiTa (ÚFAL MFF UK, knihovna `ufal.morphodita` nebo REST API LINDAT), převede značky na školní slovní druhy a vypíše neshody do CSV, které projdu ručně.
- Než začneš značit, dohodneme se na sporných školních pojetích (sto/tisíc, rád, jsem ve složeném tvaru, se u zvratných sloves, by v podmiňovacím způsobu apod.). Tam se analyzátor a škola mohou rozcházet.

## Postup práce
1. Navrhni strukturu repozitáře a datový formát a počkej na schválení.
2. Seznam sporných pojetí k rozhodnutí.
3. Kontrolní skript a první vzorek dat pro svět 1.
4. Jádro hry se světem 1 a jedním herním režimem.
5. Další světy, režimy, bonusy.

## Schválená rozhodnutí
- Samostatný repozitář `fajn-slovni-druhy`, vanilla JS bez build kroku, struktura a datový formát viz `docs/format-dat.md`.
- Věty se píšou v textovém zdroji `korpus/svetN.txt`, JSON pro hru generuje `tools/sestav.py`.
- Plná data leží veřejně na GitHub Pages; bez `?mode=full` hra načte jen `data/ukazka.json`. Schování dat za Vercel proxy se řeší později.
- Sporná jazyková pojetí: rozhodnuta v `docs/sporna-pojeti.md`. Zásada: když druh slova nejde spolehlivě určit z kontextu, věta do korpusu nepatří.
- První herní režim: lov (`js/rezimy/lov.js`). Série = 8 vět, území se získá při úspěšnosti ≥ 80 % (čistá věta 1, s chybou 0,5, s ukázanou odpovědí 0). Svět má 20 oblastí, dokončen při 13 (65 %), zbylých 7 jsou skryté oblasti.
- Testy: `node --test tests/*.mjs` (logika hry), `python -m unittest discover tests` (nástroje). Náhled pro claude.ai: `python tools/nahled.py cil.html`.
- Postavičky: Matýsek (kluk; chytrý, vtipný, dominantní, důrazný, smí popichovat) a Terezka (chytrá, milá). Každý má vlastní hlášky v `js/hlasky.js`, texty se neopakují. Dítěti tykají. Hra se na začátku zeptá, jestli hraje holka, nebo kluk; tvary se píšou `{kluk|holka}`.
- Web: GitHub Pages z větve `main` tohoto repozitáře (`pelunkaj-dot.github.io/fajn-slovni-druhy/`). Do hry na webu jdou jen věty v `korpus/schvalene.txt` (Janem zkontrolované na kontrolní stránce); svět se zobrazí, až má aspoň 8 schválených vět. Náhled na claude.ai se staví z `python tools/sestav.py --vse --cil …` a `python tools/nahled.py … --vse`.
- Pro starší žáky (schváleno 28. 9.): ukázka bez `?mode=full` obsahuje 20 vět z každého hotového světa (`data/ukazkaN.json`); na mapě je u světa obtížnost ★–★★★★★ a věta „pro koho“; režimy se střídají, ale na kartě světa jde zvolit jen jeden; přepínač „Hrát bez postaviček“ nechá jen věcnou zpětnou vazbu (`HLASKY['Nikdo']`).
- Předložky v/ve, k/ke, s/se, z/ze…: `tools/predlozky.py` (volá ho i `sestav.py`). Tvrdá chyba („v vodě“, „s sestrou“) zastaví sestavení, sporné případy („v sboru“) se vypíšou k posouzení.
- Padající slova (schváleno 29. 9.): slovo padá, hráč ho chytí do koše správného druhu; série 16 slov, postup při chybě jako jinde, dopad = ukázaná odpověď. Jen světy 1–2. Samostatná slova jsou v `korpus/slova.txt` (kandidáty doplňuje `tools/slova.py` ze schválených vět světů 1–2), do hry jdou jen schválená (`w-NNNN` v `korpus/schvalene.txt`). Další plánovaná varianta: obrana hradu (tower defense) na stejném základu.
