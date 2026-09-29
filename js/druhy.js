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

// Poddruhy (svět 5, docs/sporna-pojeti.md G). `jed` a `mn` se shodují s názvem druhu:
// „tvrdé přídavné jméno“ / „všechna tvrdá přídavná jména“, „řadová číslovka“ / „všechny řadové číslovky“.
export const PODDRUHY = {
  2: {
    tvrde: { jed: 'tvrdé', mn: 'tvrdá', otazka: 'Skloňuje se podle vzoru mladý.' },
    mekke: { jed: 'měkké', mn: 'měkká', otazka: 'Skloňuje se podle vzoru jarní.' },
    privlastnovaci: { jed: 'přivlastňovací', mn: 'přivlastňovací', otazka: 'Zeptej se: čí? Končí na -ův, -in.' },
  },
  3: {
    osobni: { jed: 'osobní', mn: 'osobní', otazka: 'Zastupuje osobu: já, ty, on, ona, my, vy, oni.' },
    zvratne: { jed: 'zvratné', mn: 'zvratná', otazka: 'Vrací děj k tomu, kdo ho dělá: se, si, sebe, sobě.' },
    privlastnovaci: { jed: 'přivlastňovací', mn: 'přivlastňovací', otazka: 'Zeptej se: čí? Například můj, tvůj, náš, svůj.' },
    ukazovaci: { jed: 'ukazovací', mn: 'ukazovací', otazka: 'Ukazuje na něco: ten, ta, to, tento, takový.' },
    tazaci: { jed: 'tázací', mn: 'tázací', otazka: 'Ptá se: kdo? co? jaký? čí?' },
    vztazne: { jed: 'vztažné', mn: 'vztažná', otazka: 'Připojuje vedlejší větu: který, jenž, jaký.' },
    neurcite: { jed: 'neurčité', mn: 'neurčitá', otazka: 'Neříká přesně kdo nebo co: někdo, něco, nějaký.' },
    zaporne: { jed: 'záporné', mn: 'záporná', otazka: 'Popírá: nikdo, nic, žádný.' },
  },
  4: {
    zakladni: { jed: 'základní', mn: 'základní', otazka: 'Zeptej se: kolik? Například jeden, dva, pět.' },
    radova: { jed: 'řadová', mn: 'řadové', otazka: 'Zeptej se: kolikátý? Například první, pátý.' },
    druhova: { jed: 'druhová', mn: 'druhové', otazka: 'Zeptej se: kolikero? kolikerý? Například dvoje, troje, dvojí.' },
    nasobna: { jed: 'násobná', mn: 'násobné', otazka: 'Zeptej se: kolikrát? Například dvakrát, třikrát.' },
  },
};

// „přivlastňovací zájmeno“, „řadová číslovka“; bez poddruhu jen název druhu.
export const nazevDruhu = (d, p) => (p && PODDRUHY[d] && PODDRUHY[d][p] ? `${PODDRUHY[d][p].jed} ${DRUHY[d].nazev}` : DRUHY[d].nazev);
export const mnozneDruhu = (d, p) => (p && PODDRUHY[d] && PODDRUHY[d][p] ? `${PODDRUHY[d][p].mn} ${DRUHY[d].mnozne}` : DRUHY[d].mnozne);
