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
  
  static readonly newline = "\x0D\x0A";
  static readonly delimeter = "\x2C";

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
        key = escape(key);

        const keyPath = calculatePath(path.concat("" + key));
        const value = KV[key];

        // FIXME: Things need to be parsed when parsed. Change message
        if (typeof value == "string" && canJSONParse(value))
          console.warn(`the value "${value} can be parsed into an object and` +
                       "that makes parsing the the CSV to a JS object not" +
                       "becoming the same object");

        if (Array.isArray(value)) {
          head.add(keyPath);
          row.set(keyPath, escape(JSON.stringify(value)));
        } else if (typeof value === "object")
          createRow(value as Type, keyPath, row);
        else if (value) {
          head.add(keyPath);
          row.set(keyPath, escape("" + value));
        }
      }

      return row;

      function escape(field: string) {
        if (["\x0D", "\x0A", "\x22", CSV.delimeter].some(c => field.includes(c))) {
          if (field.includes("\x22"))
            return `"${field.replace(/\x22/g, "\x22\x22")}"`;

          return `"${field}"`;
        }

        return field;
      }
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
      .map(i => splitRow(i))
      .map(i => i.map(j => j.startsWith("\x22")
        ? j.slice(1, -1).replace(/\x22\x22/g, "\x22")
        : j));

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

    function splitRow(row: string): string[] {
      const pieces = row.split(CSV.delimeter), correctPieces = [];
      console.log(pieces);

      let notFinished = false;

      for (const p of pieces) {
        if (!notFinished)
          correctPieces.push(p);
        else
          correctPieces[correctPieces.length - 1] += CSV.delimeter + p;


        if (p.endsWith("\x22") && !p.endsWith("\x22\x22"))
          notFinished = false;
        else if (p.startsWith("\x22"))
          notFinished = true;
      }

      return correctPieces;
    }

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
