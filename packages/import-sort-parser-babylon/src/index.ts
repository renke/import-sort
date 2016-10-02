import {parse} from "babylon";
import {
  isImportSpecifier,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
} from "babel-types";
import traverse from "babel-traverse";
import {IImport, NamedMember} from "import-sort-parser";

// TODO: Mocha currently doesn't pick up the declaration in index.d.ts
const findLineColumn = require("find-line-column");

export function parseImports(code: string): Array<IImport> {
  const parsed = parse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
      "flow",
      "doExpressions",
      "objectRestSpread",
      "decorators",
      "classProperties",
      "exportExtensions",
      "asyncGenerators",
      "functionBind",
      "functionSent",
    ],
  });

  const imports: Array<IImport> = [];

  traverse(parsed, {
    ImportDeclaration(path) {
      const node = path.node;

      let start = node.start;
      let end = node.end;

      if (node.leadingComments) {
        const comments = node.leadingComments;

        let current = node.leadingComments.length - 1;
        let previous: number | undefined;

        while (comments[current] && comments[current].end + 1 === start) {
          if (code.substring(comments[current].start, comments[current].end).indexOf("#!") === 0) {
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

      const imported: IImport = {
        start,
        end,

        moduleName: node.source.value,

        type: "import",
        namedMembers: [],
      };

      if (node.specifiers) {
        node.specifiers.forEach(specifier => {
          if (isImportSpecifier(specifier)) {
            imported.namedMembers!.push({
              name: specifier.imported.name,
              alias: specifier.local.name,
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

export function formatImport(code: string, imported: IImport): string {
  const originalImportCode = code.substring(imported.start, imported.end);
  const {namedMembers} = imported;

  if (namedMembers.length === 0) {
    return originalImportCode;
  }

  return originalImportCode.replace(/\{[\s\S]*\}/g, namedMembersString => {
      const useMultipleLines = namedMembersString.indexOf("\n") !== -1;

      if (useMultipleLines) {
          const prefix = namedMembersString.split("\n")[1].match(/^\s*/)![0];
          return formatNamedMembers(namedMembers, useMultipleLines, prefix);
      }

      return formatNamedMembers(namedMembers, useMultipleLines);
  });
}

function formatNamedMembers(namedMembers: Array<NamedMember>, useMultipleLines: boolean, prefix?: string): string {
  if (useMultipleLines) {
    return "{\n" + namedMembers.map(({name, alias}) => {
      if (name === alias) {
        return `${prefix}${name},\n`;
      }

      return `${prefix}${name} as ${alias},\n`;
    }).join("") + "}";
  } else {
    return "{" + namedMembers.map(({name, alias}) => {
      if (name === alias) {
        return `${name}`;
      }

      return `${name} as ${alias}`;
    }).join(", ") + "}";
  }
}
