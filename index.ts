"use strict";

import { TSV } from "./TSV.ts";
export { TSV } from "./TSV.ts";

const arr = [
  {
    name: "Olivia",
    age: 23,
    sex: "M",
    file: {
      extensions: [ ".csv", ],
      MIME: {
        type: "text",
        subtype: "csv",
      },
    },
  },
  {
    name: "John",
    age: 43,
    sex: "M",
    "file.MIME": "ok"
  },
  {
    name: "Fred",
    age: 1,
    sex: "M"
  },
  {name: "Jodi", age: 54, sex: "M", file: {
    extensions: [ ".tsv", ".tab" ],
    MIME: {
      type: "text",
      subtype: "tab-separated-values",
    }
  }},
  {name: "Peter\tParker", age: 45, sex: "F"},
  {name: "Vinnie", age: 33, sex: "M"},
  {name: "Rae", age: 75, sex: "M"},
  {name: "Andrea", age: 18, sex: "M"},
  {name: "Alex", age: 4, sex: "F"},
  {name: "Asmon", age: 82, sex: "F"},
  {name: "Blare", age: 43, sex: "M"},
  {name: "Esfand", age: 29, sex: "M"},
  {name: "Logan", age: 83, sex: "F"},
  {name: "Jake", age: 56, sex: "F"},
  {name: "Knut", age: 16, sex: "F"},
  {name: "Imane", age: 8, sex: "M"},
  {name: "Andrew", age: 32, sex: "F"},
  {name: "Leslie", age: 54, sex: "F"},
  {name: "Warwick", age: 32, sex: "M"},
  {name: "Nick", age: 76, sex: "F"},
  {name: "Ludwig", age: 54, sex: "M"},
  {name: "Bonnie", age: 6, sex: "M"},
]
console.log((new TSV).stringify(arr));
console.log((new TSV).parse((new TSV).stringify(arr)));
