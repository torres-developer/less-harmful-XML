"use strict";

import {
  Type,
  staticImplements,
  LessHarmfulXMLIStatic,
  Path,
} from "../types.ts";

import { canJSONParse, getObjectVK } from "../utils.ts";

@staticImplements<LessHarmfulXMLIStatic>() export class CSV {
  static readonly file = {
    extensions: [ ".csv" ],
    MIME: {
      type: "text",
      subtype: "csv"
    }
  };
  
  static readonly newline = "\r\n";
  static readonly delimeter = ",";

  public static stringify(data: Type[]): string {
    const head: Set<Path> = new Set();
    let headString = "";

    const rows: Map<Path, string>[] = [];
    const rowsStrings: string[] = [];

    for (const i of data) rows.push(createRow(i));

    const values = head.values();

    for (const i of values) {
      headString += i.map(j => j.replace(/\./g, "\0.")).join(".");
      headString += CSV.delimeter;

      for (const j in rows) {
        const toAdd = rows[j].get(i);
        if (!rowsStrings[j]) rowsStrings[j] = "";
        rowsStrings[j] += (toAdd ?? "") + CSV.delimeter;
      }
    }

    let spreadsheet = headString.slice(0, -1);
    for (const i of rowsStrings) spreadsheet += CSV.newline + i.slice(0, -1);

    return spreadsheet;

    function createRow(
      object: Type,
      path: Path = [],
      row: Map<Path, string> = new Map()
    ): Map<Path, string> {
      const KV = getObjectVK(object);

      for (let key in KV) {
        if (["\r", "\n", "\"", CSV.delimeter].some(c => key.includes(c)))
          if (key.includes("\""))
            key = `"${key.replace(/"/g, "\"\"")}"`;
          else
            key = `"${key}"`;

        const keyPath = calculatePath(path.concat("" + key));
        const value = KV[key];

        // FIXME: Things need to be parsed when parsed. Change message
        if (typeof value == "string" && canJSONParse(value))
          console.warn(`the value "${value} can be parsed into an object and` +
                       "that makes parsing the the CSV to a JS object not" +
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
    const [ head, ...body ] = notXML.split(CSV.newline)
      .map(i => i.split(CSV.delimeter));

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
