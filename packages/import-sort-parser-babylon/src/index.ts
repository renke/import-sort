import {parse} from "@babel/parser";
import traverse from "@babel/traverse";
import {
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
  isImportSpecifier,
} from "@babel/types";
import {IImport, NamedMember} from "import-sort-parser";

// TODO: Mocha currently doesn't pick up the declaration in index.d.ts
const findLineColumn = require("find-line-column");

const BABYLON_PLUGINS = [
  "jsx",
  "flow",
  "flowComments",
  "doExpressions",
  "objectRestSpread",
  ["decorators", {decoratorsBeforeExport: true}],
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  "exportDefaultFrom",
  "exportNamespaceFrom",
  "asyncGenerators",
  "functionBind",
  "functionSent",
  "dynamicImport",
  "numericSeparator",
  "optionalChaining",
  "importMeta",
  "bigInt",
  "optionalCatchBinding",
  "throwExpressions",
  ["pipelineOperator", {proposal: "minimal"}],
  "nullishCoalescingOperator",
];

const BABYLON_OPTIONS = {
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,

  sourceType: "module",

  plugins: BABYLON_PLUGINS,
};

export function parseImports(code: string): Array<IImport> {
  const parsed = (parse as any)(code, BABYLON_OPTIONS);

  const imports: Array<IImport> = [];

  traverse(parsed, {
    ImportDeclaration(path) {
      const node = path.node;

      const importStart = node.start;
      const importEnd = node.end;

      let start = importStart;
      let end = importEnd;

      if (node.leadingComments) {
        const comments = node.leadingComments;

        let current = node.leadingComments.length - 1;
        let previous: number | undefined;

        while (comments[current] && comments[current].end + 1 === start) {
          if (
            code
              .substring(comments[current].start, comments[current].end)
              .indexOf("#!") === 0
          ) {
            break;
          }

          // TODO: Improve this so that comments with leading whitespace are allowed
          if (findLineColumn(code, comments[current].start).col !== 0) {
            break;
          }

          previous = current;
          start = comments[previous].start;
          current--;
        }
      }

      if (node.trailingComments) {
        const comments = node.trailingComments;

        let current = 0;
        let previous: number | undefined;

        while (comments[current] && comments[current].start - 1 === end) {
          if (comments[current].loc.start.line !== node.loc.start.line) {
            break;
          }

          previous = current;
          end = comments[previous].end;
          current++;
        }
      }

      const importKind = (node as any).importKind;

      const imported: IImport = {
        start,
        end,

        importStart,
        importEnd,

        moduleName: node.source.value,

        type: importKind === "type" ? "import-type" : (importKind === "typeof" ?  "import-type-of" : "import"),
        namedMembers: [],
      };

      if (node.specifiers) {
        node.specifiers.forEach(specifier => {
          if (isImportSpecifier(specifier)) {
            const type =
              (specifier as any).importKind === "type" ? {type: true} : {};
            const type_of =
              (specifier as any).importKind === "typeof" ? {type_of: true} : {};
            imported.namedMembers!.push({
              name: specifier.imported.name,
              alias: specifier.local.name,
              ...type,
              ...type_of,
            });
          } else if (isImportDefaultSpecifier(specifier)) {
            imported.defaultMember = specifier.local.name;
          } else if (isImportNamespaceSpecifier) {
            imported.namespaceMember = specifier.local.name;
          }
        });
      }

      imports.push(imported);
    },
  });

  return imports;
}

export function formatImport(
  code: string,
  imported: IImport,
  eol = "\n",
): string {
  const importStart = imported.importStart || imported.start;
  const importEnd = imported.importEnd || imported.end;

  const importCode = code.substring(importStart, importEnd);

  const {namedMembers} = imported;

  if (namedMembers.length === 0) {
    return code.substring(imported.start, imported.end);
  }

  const newImportCode = importCode.replace(
    /\{[\s\S]*\}/g,
    namedMembersString => {
      const useMultipleLines = namedMembersString.indexOf(eol) !== -1;

      let prefix: string | undefined;

      if (useMultipleLines) {
        prefix = namedMembersString.split(eol)[1].match(/^\s*/)![0];
      }

      let useSpaces = namedMembersString.charAt(1) === " ";

      let userTrailingComma = namedMembersString
        .replace("}", "")
        .trim()
        .endsWith(",");

      return formatNamedMembers(
        namedMembers,
        useMultipleLines,
        useSpaces,
        userTrailingComma,
        prefix,
        eol,
      );
    },
  );

  return (
    code.substring(imported.start, importStart) +
    newImportCode +
    code.substring(importEnd, importEnd + (imported.end - importEnd))
  );
}

function formatNamedMembers(
  namedMembers: Array<NamedMember>,
  useMultipleLines: boolean,
  useSpaces: boolean,
  useTrailingComma: boolean,
  prefix: string | undefined,
  eol = "\n",
): string {
  if (useMultipleLines) {
    return (
      "{" +
      eol +
      namedMembers
        .map(({name, alias, type, type_of}, index) => {
          const lastImport = index === namedMembers.length - 1;
          const comma = !useTrailingComma && lastImport ? "" : ",";
          const typeModifier = type ? "type " : "";
          const typeOfModifier = type_of ? "typeof " : "";

          if (name === alias) {
            return `${prefix}${typeModifier}${typeOfModifier}${name}${comma}` + eol;
          }

          return `${prefix}${typeModifier}${typeOfModifier}${name} as ${alias}${comma}` + eol;
        })
        .join("") +
      "}"
    );
  } else {
    const space = useSpaces ? " " : "";
    const comma = useTrailingComma ? "," : "";

    return (
      "{" +
      space +
      namedMembers
        .map(({name, alias, type, type_of}) => {
          const typeModifier = type ? "type " : "";
          const typeOfModifier = type_of ? "typeof " : "";
          if (name === alias) {
            return `${typeModifier}${typeOfModifier}${name}`;
          }

          return `${typeModifier}${typeOfModifier}${name} as ${alias}`;
        })
        .join(", ") +
      comma +
      space +
      "}"
    );
  }
}
