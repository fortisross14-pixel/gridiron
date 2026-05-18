// Random helpers. Kept tiny and dependency-free.

export const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const choice = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

// Rarity distribution depends on which pool we're filling.
// Tune these probabilities to change the talent landscape.
export const generateRarity = (poolType) => {
  const r = Math.random();
  if (poolType === 'fa-star' || poolType === 'fa-coach') {
    if (r < 0.02) return 'Legend';
    if (r < 0.07) return 'Epic';
    if (r < 0.20) return 'Rare';
    if (r < 0.50) return 'Uncommon';
    return 'Common';
  }
  if (poolType === 'qb' || poolType === 'coach') {
    if (r < 2/32)  return 'Legend';
    if (r < 5/32)  return 'Epic';
    if (r < 12/32) return 'Rare';
    if (r < 22/32) return 'Uncommon';
    return 'Common';
  }
  // 'star'
  if (r < 4/64)  return 'Legend';
  if (r < 10/64) return 'Epic';
  if (r < 20/64) return 'Rare';
  if (r < 38/64) return 'Uncommon';
  return 'Common';
};
