"use strict";

interface MIMEType {
  type: string;
  subtype: string;
}

interface File {
  extensions: string[];
  MIME: MIMEType;
}

export type Type = Record<string, unknown>;

export interface LessHarmfulXMLI {}

export interface LessHarmfulXMLIStatic {
  new():LessHarmfulXMLI;

  readonly file: File;
  readonly delimeter: string;
  stringify(data: Type[]): string;
  parse(notXML: string): Type[];
}

export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {constructor};
}

export type Path = PropertyKey[];
