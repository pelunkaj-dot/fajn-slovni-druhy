// Co říkají Matýsek a Terezka. Návrh textů – kontroluje Jan.
//
// Matýsek: chytrý, vtipný, dominantní, důrazný. Terezka: chytrá a milá.
// Postavičky dítěti tykají. O sobě mluví ve svém rodě (Matýsek „nestihl“,
// Terezka „pyšná“). Tvary podle toho, jestli hraje kluk, nebo holka, se píšou
// do složených závorek: {kluk|holka}, např. „{Zvládl|Zvládla} jsi to!“.
//
// Texty se neopakují: z každé skupiny se berou postupně v náhodném pořadí
// a znovu se začne až po vyčerpání všech.

export const HLASKY = {
  'Matýsek': {
    pozdravPrvni: ['Ahoj! Já jsem Matýsek. Budeme spolu lovit slova. Ty je budeš chytat, já budu velet!'],
    pozdravZnovu: ['Zase tady? Výborně, jdeme na to!', 'Čau! Mám plán: dneska budeme nejlepší.', 'Ahoj! Slova už na nás čekají.', 'No konečně! Už jsem se nudil.', 'Čau! Dneska žádné flákání, jo?'],
    otazkaHrac: ['Čau! Než vyrazíme, musím vědět: jsi holka, nebo kluk?'],
    pozdravPoDlouhe: ['Kde ses tak dlouho {toulal|toulala}?', 'Konečně zpátky! Myslel jsem, že na mě zapomeneš.', 'Dlouho jsme se neviděli! Slova se nám mezitím rozutekla.'],
    predstaveni: ['Jdeš se mnou? Správná volba!', 'Se mnou to bude jízda!', 'Dobrá volba! Se mnou se nenudíš.', 'Jdeš se mnou? Jsi {chytrý kluk|chytrá holka}!'],
    uvodLov: ['Jdeme lovit! Já velím, ty chytáš.', 'Slova se schovávají. Ale před námi se neschovají!', 'Pozor, začínáme. Soustřeď se!', 'Lov začíná. Ukaž, co v tobě je!', 'Tak jo, jdeme na to. Rychle a přesně!', 'Dneska ulovíme všechno, co se hýbe. Teda všechna slova.'],
    uvodMost: ['Stavíme most! Já nosím prkna, ty určuješ slova.', 'Bez mostu přes řeku nepřejdeme. A já plavat nechci!', 'Každé správné slovo je jedno prkno. Tak ať to drží!', 'Most postavíme raz dva. Jdeme!'],
    boss: ['Tohle je velký most! Soustřeď se, teď to platí!', 'Nejdelší věta. Ale na nás je krátká!', 'Finále! Klid, pozornost a jedeme.'],
    zasah: ['Trefa!', 'Bum, a máme ho!', 'Přesně tak!', 'Jo!', 'Pecka!', 'Chyceno!'],
    dilek: ['Drží!', 'Prkno sedí!', 'Tak jo!', 'Další!', 'Pevné jak skála!', 'Správně, jedeme dál!'],
    vetaCista: ['Pecka!', 'Bomba! Ani jedna chyba!', 'Tak tohle byla přesná trefa!', 'Jsem na tebe hrdý!', 'Výborně, takhle se to dělá!', 'Čistá práce!', 'To bylo parádní!', '{Frajer|Frajerka}!', 'Ty jsi {šikula|šikulka}! Skoro jako já.'],
    rychle: ['Rychlost blesku!', 'Ty jsi {rychlý|rychlá} jak blesk!', 'Jsi rychlejší než já! Skoro.', 'Fíha, ani jsem nestihl mrknout!', 'Tak rychle jsem to ještě neviděl!'],
    vetaSChybou: ['Hotovo! Příště bez chyby, jo?', 'Jednu chybu jsi {udělal|udělala}. Příště ani jednu, jasné?', 'Dobrý, ale zvládneš to i líp.', 'Máme to. Chybička se vloudí, ale hlídej si ji!'],
    chyba1: ['Kdepak, zkus to znovu!', 'Vedle! Ještě jednou.', 'Tohle ne. Soustřeď se!', 'Hele, podívej se pořádně.', 'Ne, ne. Zkus to jinak!'],
    chyba2: ['Zase vedle. Chceš radu? Klikni na Nápovědu!', 'Hmm, tohle nejde. Vezmi si nápovědu, to není ostuda.', 'Ještě jednou – nebo ti poradím. Nápověda je dole.'],
    napoveda: ['Dobře, poradím ti:', 'Tak poslouchej:', 'Tady je fígl:'],
    odhaleniLov: ['Příště je najdeš ty, ne já!', 'Podívej se na ně pořádně a zapamatuj si je!'],
    odhaleniMost: ['Zapamatuj si to! Jedeme dál.', 'Tohle si pamatuj. Pokračujeme!'],
    serieUspech: ['Hurá! Další kus území je náš!', '{Zvládl|Zvládla} jsi to jako profík!', 'Vítězství! Mapa se zase zvětšila.', 'Tak to bylo mistrovské!'],
    serieNeuspech: ['Tentokrát nic. Ale příště to vyhrajeme!', 'To nevadí. I mistři někdy prohrají. Jdeme znovu!', 'Příště to dáme, slibuju!'],
    oslavaSveta: ['Svět je náš! Jsi hvězda!', 'Celý svět! Tohle se jen tak někomu nepovede. Teda kromě mě.', 'Dokázali jsme to! Celý svět je dobytý!', 'Mistrovský kousek! A objevily se skryté oblasti. Jdeme je prozkoumat?'],
  },
  'Terezka': {
    pozdravPrvni: ['Ahoj! Já jsem Terezka. Budeme spolu hledat slova. Moc se těším!'],
    pozdravZnovu: ['Ahoj! Ráda tě zase vidím.', 'Jé, ahoj! Půjdeme si zase hrát se slovy?', 'Ahoj! Dneska to bude hezký den.', 'Vítej zpátky! Slova už čekají.', 'Ahoj! Jsem ráda, že jsi tady.'],
    otazkaHrac: ['Ahoj! Než vyrazíme, prozraď mi: jsi holka, nebo kluk?'],
    pozdravPoDlouhe: ['Jé, to je dobře, že jsi zpátky! {Chyběl|Chyběla} jsi mi.', 'Ahoj! Dlouho jsme se neviděli, stýskalo se mi.', 'To je dobře, že tě zase vidím! Už jsem se bála, že nepřijdeš.'],
    predstaveni: ['Jé, půjdeme spolu? To mám radost!', 'Budu ti dělat společnost. Těším se!', 'Tak spolu? Výborně!', 'S tebou půjdu moc ráda!'],
    uvodLov: ['Jdeme na lov! Dívej se pozorně, slova se ráda schovávají.', 'Pojď, najdeme slova spolu.', 'Připrav se, začínáme. Budu ti držet palce.', 'Tak co, půjdeme na to? Určitě to zvládneš.', 'Slova se schovala. Najdeme je?'],
    uvodMost: ['Postavíme spolu most? Každé slovo je jeden dílek.', 'Na druhém břehu na nás něco čeká. Pojďme stavět!', 'Dílek po dílku a most bude hotový.', 'Budu ti podávat dílky, ty je poskládáš.'],
    boss: ['Tohle je velký most. Nespěchej, máme čas.', 'Poslední a nejdelší věta. Věřím ti!', 'Velký most! Hezky slovo po slově.'],
    zasah: ['Ano!', 'Výborně!', 'Přesně tak!', 'Hezky!', 'To je ono!', 'Krása!'],
    dilek: ['Sedí!', 'Správně!', 'Pěkně!', 'Most roste!', 'Další dílek!', 'Jde ti to!'],
    vetaCista: ['To je krása!', 'Moc hezky!', 'Bez jediné chyby, to je paráda!', 'Jsem na tebe pyšná!', 'Úžasné!', 'Tak tohle se ti moc povedlo!', 'Ty jsi ale {šikula|šikulka}!', 'Jsi moc {chytrý|chytrá}!'],
    rychle: ['Jé, to bylo rychlé!', 'Rychle a bez chyby, to je nádhera!', 'Páni, to ti to šlo rychle!', 'Ty jsi ale {rychlý|rychlá}!'],
    vetaSChybou: ['Hotovo! Chybička se vloudí, to nevadí.', 'Nakonec to vyšlo, to je hlavní.', 'Máme to! A příště třeba bez chybičky.'],
    chyba1: ['To nevadí, zkus to znovu.', 'Tohle ne, ale nic se neděje.', 'Zkus to ještě jednou, to zvládneš.', 'Hmm, zkusíme to jinak?'],
    chyba2: ['Nevadí. Jestli chceš, poradím ti – klikni na Nápovědu.', 'To se stává. Chceš malou nápovědu?', 'Zkus to znovu, nebo ti ráda poradím.'],
    napoveda: ['Poradím ti:', 'Tady je malá nápověda:', 'Zkus tohle:'],
    odhaleniLov: ['Příště je najdeš i bez mé pomoci.', 'Příště je určitě najdeš {sám|sama}.', 'Dobře si je prohlédni. Příště už je najdeš.'],
    odhaleniMost: ['Zapamatujeme si to a jdeme dál.', 'Nevadí, teď už to víš. Pokračujeme.'],
    serieUspech: ['Hurá, nová oblast je naše!', '{Zvládl|Zvládla} jsi to krásně!', 'To se nám povedlo! Mapa zase vyrostla.', 'Jsem moc ráda, další kus území je náš!'],
    serieNeuspech: ['Tentokrát to nevyšlo, ale nic se neděje. Zkusíme to znovu?', 'Každá série tě něco naučí. Příště to bude lepší.', 'Nevadí. Já jsem taky ze začátku chybovala.'],
    oslavaSveta: ['Hurá! Celý svět je náš! Jsem na tebe moc pyšná.', '{Zvládl|Zvládla} jsi celý svět! To je nádhera.', 'Dokázali jsme to! A podívej, objevily se skryté oblasti!', 'To je úžasné! Tenhle svět jsme spolu zvládli.'],
  },
};

// ---------- výběr bez opakování ----------
const KLIC = 'fajn-slovni-druhy:hlasky';
let zasobnik = {};
try { zasobnik = JSON.parse(localStorage.getItem(KLIC)) || {}; } catch { /* bez úložiště */ }

function zamichej(n, posledni) {
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  if (n > 1 && p[p.length - 1] === posledni) [p[0], p[p.length - 1]] = [p[p.length - 1], p[0]];
  return p;
}

let hrac = 'kluk';
export function nastavHrace(h) { if (h === 'kluk' || h === 'holka') hrac = h; }

// „{Zvládl|Zvládla} jsi to“ → podle toho, kdo hraje
export function tvar(text, kdo = hrac) {
  return text.replace(/\{([^|}]*)\|([^}]*)\}/g, (_, kluk, holka) => (kdo === 'holka' ? holka : kluk));
}

export function hlaska(hrdina, skupina) {
  const seznam = (HLASKY[hrdina] || HLASKY['Terezka'])[skupina];
  if (!seznam) return '';
  const k = `${hrdina}:${skupina}`;
  let z = zasobnik[k];
  if (!z || !z.fronta.length || z.fronta.some(i => i >= seznam.length)) {
    z = { fronta: zamichej(seznam.length, z && z.posledni), posledni: z && z.posledni };
  }
  const i = z.fronta.pop();
  zasobnik[k] = { fronta: z.fronta, posledni: i };
  try { localStorage.setItem(KLIC, JSON.stringify(zasobnik)); } catch { /* bez úložiště */ }
  return tvar(seznam[i]);
}
