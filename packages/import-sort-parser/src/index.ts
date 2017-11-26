export interface IParser {
    parseImports(code: string): Array<IImport>;
    formatImport(code: string, imported: IImport, eol?: string): string;
}

export interface IImport {
  start: number;
  end: number;

  type: ImportType;

  moduleName: string;

  defaultMember?: string;
  namespaceMember?: string;
  namedMembers: Array<NamedMember>;
}

export type ImportType = "import" | "require" | "import-equals" | "import-type";

export type NamedMember = {
  name: string,
  alias: string,
}
