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
    extensions: [ ".csv", ],
    MIME: {
      type: "text",
      subtype: "csv"
    }
  };
  
  static readonly delimeter = ",";

  public static stringify(data: Type[]): string {
    const head: Set<Path> = new Set();
    let headString = "";

    const rows: Map<Path, string>[] = [];
    const rowsStrings: string[] = [];

    for (const i of data) rows.push(createRow(i));

    const values = head.values();

    for (const i of values) {
      headString += i.join(".") + this.delimeter;

      for (const j in rows) {
        const toAdd = rows[j].get(i);
        if (!rowsStrings[j]) rowsStrings[j] = "";
        rowsStrings[j] += (toAdd ?? "") + this.delimeter;
      }
    }

    let spreadsheet = headString.slice(0, -1);
    for (const i of rowsStrings) spreadsheet += "\n" + i.slice(0, -1);

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

        if (Array.isArray(value)) {
          head.add(keyPath);
          row.set(keyPath, JSON.stringify(value));
        } else if (typeof value === "object") {
          createRow(value as Type, keyPath, row);
        } else if (value) {
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
    const [ head, ...body ] = notXML.split("\n").map(i => i.split("\t"));

    const arr: Type[] = [];
    for (const objectArr of body) {
      const object: Type = {};

      for (let i = 0; i < head.length; i++) {
        const prop = head[i], val = objectArr[i];

        if (val) {
          if (prop.includes(".")) {
            const objs = prop.split(/(?<!\0)\./);
            const wVal = objs.pop();

            let cur = object;
            for (let j = 0; j < objs.length; j++) {
              const key = objs[j]/*.replaceAll("\x00.", ".")*/;

              if (!(key in cur)) cur[key] = {};

              cur = cur[key];
            }

            try {
              cur[wVal.replaceAll("\0.", ".")] = JSON.parse(val);
            } catch {
              cur[wVal.replaceAll("\0.", ".")] = val
            }
          } else {
            try {
              object[prop.replaceAll("\0.", ".")] = JSON.parse(val);
            } catch {
              object[prop.replaceAll("\0.", ".")] = val;
            }
          }
        }
      }
      
      arr.push(object);
    }
        
    return arr;
  }
}