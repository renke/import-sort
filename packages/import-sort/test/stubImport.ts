import {IImport, NamedMember, ImportType} from "import-sort-parser";

export default function stubImport(data: {
  type?: ImportType,
  moduleName?: string,
  defaultMember?: string,
  namespaceMember?: string,
  namedMembers?: Array<NamedMember>,
}): IImport {
  const imported = {
    start: 0,
    end: 0,

    type: data.type || "import",
    moduleName: data.moduleName || "foo",

    defaultMember: data.defaultMember,
    namespaceMember: data.namespaceMember,
    namedMembers: data.namedMembers || [],
  };

  return imported;
}
