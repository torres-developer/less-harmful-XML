import { Type } from "./types.ts";

export function canJSONParse(parsable: string) {
  try { JSON.parse(parsable); } catch { return false; }

  return true;
}

export function getObjectVK(object: Type): Type {
  const newObject = Object.assign({}, object);

  const symbols = Object.getOwnPropertySymbols(object);

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];

    const key = Symbol.keyFor(sym) ??
      sym.description ??
      sym.toString();
    if (key) newObject[key] = object[sym];
  }

  return newObject;
}
