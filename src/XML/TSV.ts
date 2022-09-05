"use strict";

import {
  Type,
  staticImplements,
  LessHarmfulXMLIStatic,
  Path,
} from "../types.ts";

import { canJSONParse, getObjectVK } from "../utils.ts";

@staticImplements<LessHarmfulXMLIStatic>() export class TSV {
  static readonly file = {
    extensions: [ ".tsv", ".tab" ],
    MIME: {
      type: "text",
      subtype: "tab-separated-values"
    }
  };
  
  static readonly newline = "\n";
  static readonly delimeter = "\t";

  public static stringify(data: Type[]): string {
    const head: Set<Path> = new Set();
    let headString = "";

    const rows: Map<Path, string>[] = [];
    const rowsStrings: string[] = [];

    for (const i of data) rows.push(createRow(i));

    const values = head.values();

    for (const i of values) {
      headString += i.map(j => j.replace(/\./g, "\0.")).join(".");
      headString += TSV.delimeter;

      for (const j in rows) {
        const toAdd = rows[j].get(i);
        if (!rowsStrings[j]) rowsStrings[j] = "";
        rowsStrings[j] += (toAdd ?? "") + TSV.delimeter;
      }
    }

    let spreadsheet = headString.slice(0, -1);
    for (const i of rowsStrings) spreadsheet += TSV.newline + i.slice(0, -1);

    return spreadsheet;

    function createRow(
      object: Type,
      path: Path = [],
      row: Map<Path, string> = new Map()
    ): Map<Path, string> {
      const KV = getObjectVK(object);

      for (const key in KV) {
        const keyPath = calculatePath(path.concat("" + key));
        const value = KV[key];

        // TODO: Better Error message and perhaps a costum error
        if ([key, value].some(s => ("" + s).includes(TSV.delimeter)))
          throw new Error("Tab detected");

        // FIXME: Things need to be parsed when parsed. Change message
        if (typeof value == "string" && canJSONParse(value))
          console.warn(`the value "${value} can be parsed into an object and` +
                       "that makes parsing the the TSV to a JS object not" +
                       "becoming the same object");

        if (Array.isArray(value)) {
          head.add(keyPath);
          row.set(keyPath, JSON.stringify(value));
        } else if (typeof value === "object")
          createRow(value as Type, keyPath, row);
        else if (value) {
          head.add(keyPath);
          row.set(keyPath, "" + value);
        }
      }

      return row;
    }

    function calculatePath(keys: Path): Path {
      const values = head.values();

      for (const i of values)
        if (i.every((val, key) => val === keys[key]))
          return i;
      
      return keys;
    }
  }

  public static parse(notXML: string): Type[] {
    const [ head, ...body ] = notXML.split(TSV.newline)
      .map(i => i.split(TSV.delimeter));

    const array: Type[] = [];
    for (const objectArr of body) {
      const object: Type = {};

      for (let i = 0; i < head.length; i++) {
        const prop = head[i], val = objectArr[i];

        if (val) {
          if (prop.includes(".")) {
            const objs = prop.split(/(?<!\0)\./);
            const wVal = objs.pop()?.replace(/\0\./g, ".");

            if (wVal == null) continue;

            let cur = object;
            for (let j = 0; j < objs.length; j++) {
              const key = objs[j].replace(/\0\./g, ".");

              if (!(key in cur)) cur[key] = {};

              cur = cur[key] as Type;
            }

            cur[wVal] = calculateValue(val);
          } else
            object[prop] = calculateValue(val);
        }
      }
      
      array.push(object);
    }
        
    return array;

    function calculateValue(value: string): string {
      try {
        const parsedValue = JSON.parse(value);
        return parsedValue;
      } catch {
        return value;
      }
    }
  }
}
