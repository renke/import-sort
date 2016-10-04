import * as startsWith from "core-js/library/fn/string/starts-with";
import * as typescript from "typescript";

import {IImport, ImportType, NamedMember} from "import-sort-parser";

export function parseImports(code: string): Array<IImport> {
  const host: typescript.CompilerHost = {
    fileExists: () => true,
    readFile: () => "",

    getSourceFile: () => {
      return typescript.createSourceFile("", code, typescript.ScriptTarget.Latest, true);
    },

    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: () => null,
    getCurrentDirectory: () => "",
    getDirectories: () => [],
    getCanonicalFileName: fileName => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => typescript.sys.newLine,
  };

  const program = typescript.createProgram(["foo.ts"], {
    noResolve: true,
    target: typescript.ScriptTarget.Latest,
    experimentalDecorators: true,
    experimentalAsyncFunctions: true,
  }, host);

  const sourceFile = program.getSourceFile("foo.ts");

  const imports: Array<IImport> = [];

  typescript.forEachChild(sourceFile, node => {
      switch (node.kind) {
        case typescript.SyntaxKind.ImportDeclaration: {
          imports.push(parseImportDeclaration(code, sourceFile, node as typescript.ImportDeclaration));
          break;
        }
        case typescript.SyntaxKind.ImportEqualsDeclaration: {
          break;
        }
        default: {
          break;
        }
      }
  });

  return imports;
}

function parseImportDeclaration(
  code: string, sourceFile: typescript.SourceFile, importDeclaration: typescript.ImportDeclaration
): IImport {
  let start = importDeclaration.pos + importDeclaration.getLeadingTriviaWidth();
  let end = importDeclaration.end;

  const leadingComments = getComments(sourceFile, importDeclaration, false);
  const trailingComments = getComments(sourceFile, importDeclaration, true);

  if (leadingComments) {
    const comments = leadingComments;

    let current = leadingComments.length - 1;
    let previous: number | undefined;

    while (comments[current] && comments[current].end + 1 === start) {
      if (startsWith(code.substring(comments[current].pos, comments[current].end), "#!")) {
        break;
      }

      previous = current;
      start = comments[previous].pos;
      current--;
    }
  }

  if (trailingComments) {
    const comments = trailingComments;

    let current = 0;
    let previous: number | undefined;

    while (comments[current] && comments[current].pos - 1 === end) {
      // TODO: Why is this not needed?
      // if (comments[current].loc.start.line !== node.loc.start.line) {
      //   break;
      // }

      previous = current;
      end = comments[previous].end;
      current++;
    }
  }

  let type: ImportType = "import";

  let moduleName = importDeclaration.moduleSpecifier.getText().replace(/"/g, "");

  const imported: IImport = {
    start,
    end,
    type,
    moduleName,
    namedMembers: [],
  };

  const importClause = importDeclaration.importClause;

  if (importClause) {
    if (importClause.name) {
      imported.defaultMember = importClause.name.text;
    }

    const namedBindings = importClause.namedBindings;

    if (namedBindings)  {
      if (namedBindings.kind === typescript.SyntaxKind.NamespaceImport) {
        const namespaceImport = namedBindings as typescript.NamespaceImport;
        imported.namespaceMember = namespaceImport.name.text;
      }

      if (namedBindings.kind === typescript.SyntaxKind.NamedImports) {
        const namedImports = namedBindings as typescript.NamedImports;

        for (const element of namedImports.elements) {
          const alias = element.name.text;
          let name = alias;

          if (element.propertyName) {
            name = element.propertyName.text;
          }

          imported.namedMembers.push({name, alias});
        }
      }
    }
  }

  return imported;
}

// Taken from https://github.com/fkling/astexplorer/blob/master/src/parsers/js/typescript.js#L68
function getComments(
  sourceFile: typescript.SourceFile, node: typescript.Node, isTrailing: boolean
): Array<typescript.CommentRange> | undefined {
  if (node.parent) {
    const nodePos = isTrailing ? node.end : node.pos;
    const parentPos = isTrailing ? node.parent.end : node.parent.pos;

    if (node.parent.kind === typescript.SyntaxKind.SourceFile || nodePos !== parentPos) {
      let comments: Array<typescript.CommentRange>;

      if (isTrailing) {
        comments = typescript.getTrailingCommentRanges(sourceFile.text, nodePos);
      } else {
        comments = typescript.getLeadingCommentRanges(sourceFile.text, nodePos);
      }

      if (Array.isArray(comments)) {
        return comments;
      }
    }
  }
};

export function formatImport(code: string, imported: IImport): string {
  const originalImportCode = code.substring(imported.start, imported.end);
  const {namedMembers} = imported;

  if (namedMembers.length === 0) {
    return originalImportCode;
  }

  return originalImportCode.replace(/\{[\s\S]*\}/g, namedMembersString => {
      const useMultipleLines = namedMembersString.indexOf("\n") !== -1;

      let prefix: string | undefined;

      if (useMultipleLines) {
          prefix = namedMembersString.split("\n")[1].match(/^\s*/)![0];
      }

      let useSpaces = namedMembersString.charAt(1) === " ";

      return formatNamedMembers(namedMembers, useMultipleLines, useSpaces, prefix);
  });
}

function formatNamedMembers(
  namedMembers: Array<NamedMember>,
  useMultipleLines: boolean,
  useSpaces: boolean,
  prefix: string | undefined,
): string {
  if (useMultipleLines) {
    return "{\n" + namedMembers.map(({name, alias}) => {
      if (name === alias) {
        return `${prefix}${name},\n`;
      }

      return `${prefix}${name} as ${alias},\n`;
    }).join("") + "}";
  } else {
    const space = useSpaces ? " " : "";

    return "{" + space + namedMembers.map(({name, alias}) => {
      if (name === alias) {
        return `${name}`;
      }

      return `${name} as ${alias}`;
    }).join(", ") + space + "}";
  }
}
