// Které světy mají data (a kolik vět): { "1": 58, ... }
export async function nactiSeznam() {
  try {
    const r = await fetch('data/svety.json');
    return r.ok ? await r.json() : {};
  } catch { return {}; }
}

// Načtení světa. Bez ?mode=full se načte jen ukázka (prvních 20 vět každého světa).
export async function nactiSvet(n, plna) {
  const soubor = plna ? `svet${n}` : `ukazka${n}`;
  const r = await fetch(`data/${soubor}.json`);
  if (!r.ok) throw new Error(`Data světa se nepodařilo načíst (${r.status}).`);
  const svet = await r.json();
  if (!Array.isArray(svet.vety) || !Array.isArray(svet.aktivni)) throw new Error('Data světa mají špatný formát.');
  return svet;
}
