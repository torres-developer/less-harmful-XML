"use strict";

interface MIMEType {
  type: string;
  subtype: string;
}

interface File {
  extensions: string[];
  MIME: MIMEType;
}

type Type = Record<string, unknown>;

interface LessHarmfulXML {
  readonly file: File;
  readonly delimeter: string;
  stringify(data: Type[]): string;
  parse(notXML: string): Type[];
}

type Path = PropertyKey[];

export class TSV implements LessHarmfulXML {
  readonly file = {
    extensions: [ ".tsv", ".tab" ],
    MIME: {
      type: "text",
      subtype: "tab-separated-values",
    }
  };
  
  readonly delimeter: string = "\t";

  stringify(data: Type[], tab = "        "): string {
    //console.log(data);
    const head: Set<Path> = new Set();
    let headString = "";

    const rows: Map<Path, string>[] = [];
    const rowsStrings: string[] = [];

    for (const i of data) rows.push(loop(i));

    for (const i of head.values()) {
      headString += i.join(".").replace(this.delimeter, tab) + this.delimeter;

      for (const j in rows) {
        const toAdd = rows[j].get(i);
        if (!rowsStrings[j]) rowsStrings[j] = "";
        rowsStrings[j] += (toAdd ?? "").replace(this.delimeter, tab) + this.delimeter;
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

  parse(notXML: string): Type[] {
    const [ head, ...body ] = notXML.split("\n").map(i => i.split("\t"));

    const arr: Type[] = [];
    for (const objectArr of body) {
      const object: Type = {};

      for (let i = 0; i < head.length; i++) {
        const prop = head[i], val = objectArr[i];
        if (val) {
          if (prop.includes(".")) {
            const objs = prop.split(".");
            const wVal = objs.pop();

            let cur = object;
            for (let j = 0; j < objs.length; j++) {
              if (!(objs[j] in cur)) cur[objs[j]] = {};
              cur = cur[objs[j]];
            }

            cur[wVal] = val
          } else object[prop] = val;
        }
      }
      
      arr.push(object);
    }
        
    return arr;
  }
}
