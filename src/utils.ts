import { Type } from "./types.ts";

export function canJSONParse(parsable: string) {
  try { JSON.parse(parsable); } catch { return false; }

  return true;
}

export function getObjectVK(object: Type): Type {
  const newObject = Object.assign({}, object);

  const symbols = Object.getOwnPropertySymbols(object);

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];

    const key = Symbol.keyFor(symbol) ??
      symbol.description ??
      symbol.toString();
    if (key) newObject[key] = object[symbol];
  }

  return newObject;
}
