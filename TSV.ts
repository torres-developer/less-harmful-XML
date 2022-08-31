"use strict";

import {
  Type,
  staticImplements,
  LessHarmfulXMLI,
  LessHarmfulXMLIStatic,
  Path
} from "./types.ts";

@staticImplements<LessHarmfulXMLIStatic>()
export class TSV implements LessHarmfulXMLI {
  static readonly file = {
    extensions: [ ".tsv", ".tab" ],
    MIME: {
      type: "text",
      subtype: "tab-separated-values",
    }
  };
  
  static readonly delimeter: string = "\t";

  public static stringify(data: Type[]): string {
    const head: Set<Path> = new Set();
    let headString = "";

    const rows: Map<Path, string>[] = [];
    const rowsStrings: string[] = [];

    for (const i of data) rows.push(loop(i));

    for (const i of head.values()) {
      headString += i.map(j => j.replaceAll(".", "\0.")).join(".") + this.delimeter;

      for (const j in rows) {
        const toAdd = rows[j].get(i);
        if (!rowsStrings[j]) rowsStrings[j] = "";
        rowsStrings[j] += (toAdd ?? "") + this.delimeter;
      }
    }

    let spreadsheet = headString.slice(0, -1);
    for (const i of rowsStrings) spreadsheet += "\n" + i.slice(0, -1);

    return spreadsheet;

    function loop(obj: Type, path: Path = [], dummy = new Map()): Map<Path, string> {
      for (const key in obj) {
        const keyPath = calcKey(path.concat(key));
        const value = obj[key];

        if (Array.isArray(value)) {
          head.add(keyPath);
          dummy.set(keyPath, JSON.stringify(value));
        } else if (typeof value === "object")
          loop(value as Type, keyPath, dummy);
        else if (value) {
          head.add(keyPath);
          dummy.set(keyPath, "" + value)
        }
      }

      return dummy;
    }

    function calcKey(keys: Path): Path {
      const values = head.values();
      for (const i of values)
        if (i.every((val, key) => val === keys[key]))
          return i
      
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
            const objs = prop.split(/(?<!\u0000)\./);
            const wVal = objs.pop();

            let cur = object;
            for (let j = 0; j < objs.length; j++) {
              if (!(objs[j] in cur)) cur = cur[objs[j].replaceAll("\x00.", ".")] = {};
              //cur = cur[objs[j]];
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
