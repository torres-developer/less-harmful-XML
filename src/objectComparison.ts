export default function objectComparison(x: any, y: any): boolean {
  if (x === y) return true;

  if ([x, y].some(o => o == null || typeof o != "object")) return false;

  const xKeys = Object.keys(x), yKeys = Object.keys(y);

  if (xKeys.length != yKeys.length) return false;

  for (const key of xKeys)
    if (!yKeys.includes(key) || !objectComparison(x[key], y[key])) return false;

  return true;
}
