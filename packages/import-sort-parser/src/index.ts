export interface IParserOptions {
  file?: string;
}

export interface IParser {
  parseImports(code: string, options?: IParserOptions): IImport[];
  formatImport(code: string, imported: IImport, eol?: string): string;
}

export interface IImport {
  start: number;
  end: number;

  importStart?: number;
  importEnd?: number;

  type: ImportType;

  moduleName: string;

  defaultMember?: string;
  namespaceMember?: string;
  namedMembers: NamedMember[];
}

export type ImportType = "import" | "require" | "import-equals" | "import-type";

export interface NamedMember {
  name: string;
  alias: string;
  type?: boolean;
}
