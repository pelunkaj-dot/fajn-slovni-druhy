// Co říkají Matýsek a Terezka. Návrh textů – kontroluje Jan.
// Z každého seznamu se vybírá náhodně. Texty jsou psané tak, aby seděly
// na holku i kluka (žádné „udělal/udělala“, „sám/sama“).

export const HLASKY = {
  // začátek série
  uvodLov: [
    'Jdeme na lov! Dívej se pozorně.',
    'Slova se schovávají. Najdeme je?',
    'Připrav se, začínáme!',
  ],
  uvodMost: [
    'Postavíme most! Každé slovo je jeden dílek.',
    'Na druhý břeh se dostaneme jen po mostě. Jdeme stavět!',
  ],
  // poslední, nejdelší věta mostu
  boss: [
    'Tohle je velký most! Nespěchej.',
    'Poslední a nejdelší věta. Zvládneš ji!',
  ],
  // správně chycené slovo v lovu (říká se jen někdy)
  zasah: ['Trefa!', 'Přesně tak!', 'Ano!', 'Super!', 'Jde ti to!'],
  // správně určené slovo na mostě
  dilek: ['Dílek sedí!', 'Správně!', 'Pokračuj!', 'Pěkně!'],
  // věta bez chyby
  vetaCista: ['Výborně!', 'Bez jediné chyby!', 'Paráda!', 'Jsi šikula!'],
  // věta dokončená s chybou
  vetaSChybou: ['Hotovo! Nakonec to vyšlo.', 'Máme to! Chybička se vloudí.'],
  // za větou „„X“ není podstatné jméno.“ – první chyba (bez nápovědy)
  chyba1: ['Zkus to znovu.', 'Nevadí, zkus to ještě jednou.', 'To nic, podívej se znovu.'],
  // druhá chyba – nabídne se nápověda
  chyba2: ['Zkus to znovu. Jestli chceš, poradím ti.', 'Nevadí. Klikni na Nápovědu a poradím ti.'],
  // před textem nápovědy
  napoveda: ['Poradím ti:', 'Tady je nápověda:'],
  // třetí chyba – ukáže se správná odpověď
  odhaleniLov: ['Podívej, tady jsou. Příště je najdeš i bez mé pomoci.'],
  odhaleniMost: ['Jdeme dál.', 'Zapamatuj si to a jdeme dál.'],
  // konec série
  serieUspech: ['Hurá, nová oblast je naše!', 'Další kus území patří nám!'],
  serieNeuspech: ['Tentokrát to nevyšlo, ale příště to dáme!', 'Nevadí. Každá série tě něco naučí.'],
};

export const nahodna = seznam => seznam[Math.floor(Math.random() * seznam.length)];
