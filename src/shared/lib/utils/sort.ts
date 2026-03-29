/** "2/22 11 수열의 합" → 222, "1/10 01 다항식" → 110 */
export const parseDatePrefix = (name: string): number => {
  const match = name.match(/^(\d{1,2})\/(\d{1,2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number.parseInt(match[1], 10) * 100 + Number.parseInt(match[2], 10);
};

export const compareByDatePrefix = <T extends { name: string }>(a: T, b: T): number => {
  return parseDatePrefix(a.name) - parseDatePrefix(b.name);
};
