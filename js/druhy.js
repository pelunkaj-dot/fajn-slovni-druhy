// Školní číslování slovních druhů 1–10, barvy a pomocné otázky pro nápovědu.
// Texty nápověd kontroluje Jan.
export const DRUHY = {
  1: { nazev: 'podstatné jméno', mnozne: 'podstatná jména', otazka: 'Zeptej se: kdo? co?', popis: 'Pojmenovává osobu, zvíře, věc nebo vlastnost.' },
  2: { nazev: 'přídavné jméno', mnozne: 'přídavná jména', otazka: 'Zeptej se: jaký? jaká? jaké? čí?', popis: 'Říká, jaké něco je.' },
  3: { nazev: 'zájmeno', mnozne: 'zájmena', otazka: 'Zastupuje jméno nebo na ně ukazuje.', popis: 'Například já, ty, on, můj, ten, se.' },
  4: { nazev: 'číslovka', mnozne: 'číslovky', otazka: 'Zeptej se: kolik? kolikátý?', popis: 'Vyjadřuje počet nebo pořadí.' },
  5: { nazev: 'sloveso', mnozne: 'slovesa', otazka: 'Zeptej se: co dělá? co se s ním děje?', popis: 'Vyjadřuje činnost nebo stav.' },
  6: { nazev: 'příslovce', mnozne: 'příslovce', otazka: 'Zeptej se: jak? kde? kdy? proč?', popis: 'Blíže určuje, jak, kde nebo kdy se něco děje.' },
  7: { nazev: 'předložka', mnozne: 'předložky', otazka: 'Stojí před jménem.', popis: 'Například na, v, do, pod, u.' },
  8: { nazev: 'spojka', mnozne: 'spojky', otazka: 'Spojuje slova nebo věty.', popis: 'Například a, ale, nebo, protože.' },
  9: { nazev: 'částice', mnozne: 'částice', otazka: 'Uvozuje větu nebo vyjadřuje přání.', popis: 'Například ať, kéž, prý.' },
  10: { nazev: 'citoslovce', mnozne: 'citoslovce', otazka: 'Vyjadřuje zvuk nebo pocit.', popis: 'Například haf, bum, au.' },
};

export const SVETY = {
  1: { nazev: 'Zelené údolí', popis: 'Podstatná jména, přídavná jména a slovesa', data: 'svet1' },
  2: { nazev: 'Pestrý les', popis: 'Všech deset slovních druhů', data: 'svet2' },
  3: { nazev: 'Mlžné bažiny', popis: 'Záludná slova v jednoduché větě', data: 'svet3' },
  4: { nazev: 'Horský průsmyk', popis: 'Souvětí: spojky, příslovce, zájmena', data: 'svet4' },
  5: { nazev: 'Hrad mistrů', popis: 'Druhy i poddruhy', data: 'svet5' },
};
