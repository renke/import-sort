import {extname} from "path";

import {
  loadOptions as babelLoadOptions,
  loadPartialConfig as babelLoadPartialOptions,
  parse as babelParse,
} from "@babel/core";
import {ParserOptions, parse as babelParserParse} from "@babel/parser";
import traverse from "@babel/traverse";
import {
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
  isImportSpecifier,
} from "@babel/types";
// tslint:disable-next-line:no-implicit-dependencies
import {IImport, IParserOptions, NamedMember} from "import-sort-parser";

// TODO: Mocha currently doesn't pick up the declaration in index.d.ts
// eslint-disable-next-line
const findLineColumn = require("find-line-column");

const TYPESCRIPT_EXTENSIONS = [".ts", ".tsx"];

const COMMON_PARSER_PLUGINS = [
  "jsx",
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

const FLOW_PARSER_PLUGINS = ["flow", "flowComments", ...COMMON_PARSER_PLUGINS];

const FLOW_PARSER_OPTIONS = {
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,

  sourceType: "module",

  plugins: FLOW_PARSER_PLUGINS,
};

const TYPESCRIPT_PARSER_PLUGINS = ["typescript", ...COMMON_PARSER_PLUGINS];

const TYPESCRIPT_PARSER_OPTIONS = {
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,

  sourceType: "module",

  plugins: TYPESCRIPT_PARSER_PLUGINS,
};

export function parseImports(
  code: string,
  options: IParserOptions = {},
): IImport[] {
  const babelPartialOptions = babelLoadPartialOptions({filename: options.file});

  let parsed;

  if (babelPartialOptions.hasFilesystemConfig()) {
    // We always prefer .babelrc (or similar) if one was found
    parsed = babelParse(code, babelLoadOptions({filename: options.file}));
  } else {
    const {file} = options;

    const isTypeScript = file && TYPESCRIPT_EXTENSIONS.includes(extname(file));

    const parserOptions = isTypeScript
      ? TYPESCRIPT_PARSER_OPTIONS
      : FLOW_PARSER_OPTIONS;

    parsed = babelParserParse(
      code,
      (parserOptions as unknown) as ParserOptions,
    );
  }

  const imports: IImport[] = [];

  const ignore = (parsed.comments || []).some(comment => {
    return comment.value.includes("import-sort-ignore");
  });

  if (ignore) {
    return imports;
  }

  traverse(parsed, {
    ImportDeclaration(path) {
      const {node} = path;

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
          ({start} = comments[previous]);
          current -= 1;
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
          ({end} = comments[previous]);
          current += 1;
        }
      }

      const imported: IImport = {
        start,
        end,

        importStart,
        importEnd,

        moduleName: node.source.value,

        type: node.importKind === "type" ? "import-type" : "import",
        namedMembers: [],
      };

      if (node.specifiers) {
        node.specifiers.forEach(specifier => {
          if (isImportSpecifier(specifier)) {
            const type = specifier.importKind === "type" ? {type: true} : {};

            imported.namedMembers.push({
              name: specifier.imported.name,
              alias: specifier.local.name,
              ...type,
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
        [prefix] = namedMembersString
          .split(eol)[1]
          .match(/^\s*/) as RegExpMatchArray;
      }

      const useSpaces = namedMembersString.charAt(1) === " ";

      const userTrailingComma = namedMembersString
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
  namedMembers: NamedMember[],
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
        .map(({name, alias, type}, index) => {
          const lastImport = index === namedMembers.length - 1;
          const comma = !useTrailingComma && lastImport ? "" : ",";
          const typeModifier = type ? "type " : "";

          if (name === alias) {
            return `${prefix}${typeModifier}${name}${comma}` + eol;
          }

          return `${prefix}${typeModifier}${name} as ${alias}${comma}` + eol;
        })
        .join("") +
      "}"
    );
  }

  const space = useSpaces ? " " : "";
  const comma = useTrailingComma ? "," : "";

  return (
    "{" +
    space +
    namedMembers
      .map(({name, alias, type}) => {
        const typeModifier = type ? "type " : "";

        if (name === alias) {
          return `${typeModifier}${name}`;
        }

        return `${typeModifier}${name} as ${alias}`;
      })
      .join(", ") +
    comma +
    space +
    "}"
  );
}
