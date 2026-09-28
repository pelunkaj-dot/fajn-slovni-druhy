// Školní číslování slovních druhů 1–10, barvy a pomocné otázky pro nápovědu.
// Texty nápověd kontroluje Jan. `vse` = shoda s množným číslem („všechna slovesa“, „všechny číslovky“).
export const DRUHY = {
  1: { nazev: 'podstatné jméno', mnozne: 'podstatná jména', vse: 'všechna', otazka: 'Zeptej se: kdo? co?', popis: 'Pojmenovává osobu, zvíře, věc nebo vlastnost.' },
  2: { nazev: 'přídavné jméno', mnozne: 'přídavná jména', vse: 'všechna', otazka: 'Zeptej se: jaký? jaká? jaké? čí?', popis: 'Říká, jaké něco je.' },
  3: { nazev: 'zájmeno', mnozne: 'zájmena', vse: 'všechna', otazka: 'Zastupuje jméno nebo na ně ukazuje.', popis: 'Například já, ty, on, můj, ten, se.' },
  4: { nazev: 'číslovka', mnozne: 'číslovky', vse: 'všechny', otazka: 'Zeptej se: kolik? kolikátý?', popis: 'Vyjadřuje počet nebo pořadí.' },
  5: { nazev: 'sloveso', mnozne: 'slovesa', vse: 'všechna', otazka: 'Zeptej se: co dělá? co se s ním děje?', popis: 'Vyjadřuje činnost nebo stav.' },
  6: { nazev: 'příslovce', mnozne: 'příslovce', vse: 'všechna', otazka: 'Zeptej se: jak? kde? kdy? proč?', popis: 'Blíže určuje, jak, kde nebo kdy se něco děje.' },
  7: { nazev: 'předložka', mnozne: 'předložky', vse: 'všechny', otazka: 'Stojí před jménem.', popis: 'Například na, v, do, pod, u.' },
  8: { nazev: 'spojka', mnozne: 'spojky', vse: 'všechny', otazka: 'Spojuje slova nebo věty.', popis: 'Například a, ale, nebo, protože.' },
  9: { nazev: 'částice', mnozne: 'částice', vse: 'všechny', otazka: 'Uvozuje větu nebo vyjadřuje přání.', popis: 'Například ať, kéž, prý.' },
  10: { nazev: 'citoslovce', mnozne: 'citoslovce', vse: 'všechna', otazka: 'Vyjadřuje zvuk nebo pocit.', popis: 'Například haf, bum, au.' },
};

export const SVETY = {
  1: { nazev: 'Zelené údolí', hvezdy: 1, popis: 'Podstatná jména, přídavná jména a slovesa', komu: 'Začínáš? Tady se naučíš poznat tři nejdůležitější slovní druhy.' },
  2: { nazev: 'Pestrý les', hvezdy: 2, popis: 'Všech deset slovních druhů', komu: 'Znáš základy? Procvič všech deset druhů.' },
  3: { nazev: 'Mlžné bažiny', hvezdy: 3, popis: 'Záludná slova v jednoduché větě', komu: 'Umíš všech deset? Zkus slova, která mění druh podle věty.' },
  4: { nazev: 'Horský průsmyk', hvezdy: 4, popis: 'Souvětí: spojky, příslovce, zájmena', komu: 'Pro pokročilé: slovní druhy v souvětí.' },
  5: { nazev: 'Hrad mistrů', hvezdy: 5, popis: 'Druhy i poddruhy', komu: 'Pro mistry: slovní druhy i jejich poddruhy.' },
};

// „zbývá 1“, „zbývají 2“, „zbývá 5“
export const zbyvaText = n => `${n >= 2 && n <= 4 ? 'zbývají' : 'zbývá'} ${n}`;
