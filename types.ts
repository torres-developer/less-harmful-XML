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

export interface LessHarmfulXML {
  readonly file: File;
  readonly delimeter: string;
  stringify(data: Type[]): string;
  parse(notXML: string): Type[];
}

export type Path = PropertyKey[];
