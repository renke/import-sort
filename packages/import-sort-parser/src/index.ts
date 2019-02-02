export interface IParserOptions {
  file?: string;
}

export interface IParser {
  parseImports(code: string, options?: IParserOptions): Array<IImport>;
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
  namedMembers: Array<NamedMember>;
}

export type ImportType = "import" | "require" | "import-equals" | "import-type";

export type NamedMember = {
  name: string;
  alias: string;
  type?: boolean;
};
