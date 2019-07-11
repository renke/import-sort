import * as detectNewline from "detect-newline";
import {IImport, IParser, NamedMember} from "import-sort-parser";
import {
  INamedMemberSorterFunction,
  ISorterFunction,
  IStyle,
} from "import-sort-style";

import StyleAPI from "./style/StyleAPI";

export interface ISortResult {
  code: string;
  changes: ICodeChange[];
}

export interface ICodeChange {
  start: number;
  end: number;
  code: string;
  note?: string;
}

export interface IOptions {
  parserOptions?: object;

  styleOptions?: object;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [option: string]: any;
}

export default function importSort(
  code: string,
  rawParser: string | IParser,
  rawStyle: string | IStyle,
  file?: string,
  options?: IOptions,
): ISortResult {
  let style: IStyle;

  const parser: IParser =
    typeof rawParser === "string" ? require(rawParser) : (rawParser as IParser);

  if (typeof rawStyle === "string") {
    style = require(rawStyle);

    // eslint-disable-next-line
    if ((style as any).default) {
      // eslint-disable-next-line
      style = (style as any).default;
    }
  } else {
    style = rawStyle as IStyle;
  }

  return sortImports(code, parser, style, file, options);
}

export function sortImports(
  code: string,
  parser: IParser,
  style: IStyle,
  file?: string,
  options?: IOptions,
): ISortResult {
  const {parserOptions, styleOptions, ...rest}: IOptions = options || {};
  // eslint-disable-next-line
  const items = addFallback(style, file, {...rest, styleOptions})(StyleAPI);

  const buckets: IImport[][] = items.map(() => []);

  const imports = parser.parseImports(code, {
    ...parserOptions,
    file,
  });

  if (imports.length === 0) {
    return {code, changes: []};
  }

  const eol = detectNewline.graceful(code);

  const changes: ICodeChange[] = [];

  // Fill buckets
  for (const imported of imports) {
    let sortedImport = imported;

    const index = items.findIndex(item => {
      // eslint-disable-next-line
      sortedImport = sortNamedMembers(imported, item.sortNamedMembers);
      return !!item.match && item.match(sortedImport);
    });

    if (index !== -1) {
      buckets[index].push(sortedImport);
    }
  }

  // Sort buckets
  buckets.forEach((bucket, index) => {
    const {sort} = items[index];

    if (!sort) {
      return;
    }

    if (!Array.isArray(sort)) {
      bucket.sort(sort as ISorterFunction);
      return;
    }

    const sorters = sort as ISorterFunction[];

    if (sorters.length === 0) {
      return;
    }

    const multiSort = (first: IImport, second: IImport): number => {
      let sorterIndex = 0;
      let comparison = 0;

      while (comparison === 0 && sorters[sorterIndex]) {
        comparison = sorters[sorterIndex](first, second);
        sorterIndex += 1;
      }

      return comparison;
    };

    bucket.sort(multiSort);
  });

  let importsCode = "";

  // Track if we need to insert a separator
  let separator = false;

  buckets.forEach((bucket, index) => {
    if (bucket.length > 0 && separator) {
      importsCode += eol;
      separator = false;
    }

    bucket.forEach(imported => {
      // const sortedImport = sortNamedMembers(imported, items[index].sortNamedMembers);
      const importString = parser.formatImport(code, imported, eol);
      importsCode += importString + eol;
    });

    // Add separator but only when at least one import was already added
    if (items[index].separator && importsCode !== "") {
      separator = true;
    }
  });

  let sortedCode = code;

  // Remove imports
  imports
    .slice()
    .reverse()
    .forEach(imported => {
      let importEnd = imported.end;

      if (sortedCode.charAt(imported.end).match(/\s/)) {
        importEnd += 1;
      }

      changes.push({
        start: imported.start,
        end: importEnd,
        code: "",
        note: "import-remove",
      });

      sortedCode =
        sortedCode.slice(0, imported.start) +
        sortedCode.slice(importEnd, code.length);
    });

  const {start} = imports[0];

  // Split code at first original import
  let before = code.substring(0, start);
  let after = sortedCode.substring(start, sortedCode.length);

  const oldBeforeLength = before.length;
  const oldAfterLength = after.length;

  let beforeChange: ICodeChange | undefined;
  let afterChange: ICodeChange | undefined;

  // Collapse all whitespace into a single blank line
  before = before.replace(/\s+$/, match => {
    beforeChange = {
      start: start - match.length,
      end: start,
      code: eol + eol,
      note: "before-collapse",
    };

    return eol + eol;
  });

  // Collapse all whitespace into a single new line
  after = after.replace(/^\s+/, match => {
    afterChange = {
      start,
      end: start + match.length,
      code: eol,
      note: "after-collapse",
    };

    return eol;
  });

  // Remove all whitespace at the beginning of the code
  if (before.match(/^\s+$/)) {
    beforeChange = {
      start: start - oldBeforeLength,
      end: start,
      code: "",
      note: "before-trim",
    };

    before = "";
  }

  // Remove all whitespace at the end of the code
  if (after.match(/^\s+$/)) {
    afterChange = {
      start,
      end: start + oldAfterLength,
      code: "",
      note: "after-trim",
    };

    after = "";
  }

  if (afterChange) {
    changes.push(afterChange);
  }

  if (beforeChange) {
    changes.push(beforeChange);
  }

  const change = {
    start: before.length,
    end: before.length,
    code: importsCode,
    note: "imports",
  };

  changes.push(change);

  if (code === before + importsCode + after) {
    return {code, changes: []};
  }

  return {
    code: before + importsCode + after,
    changes,
  };
}

function sortNamedMembers(
  imported: IImport,
  rawSort?: INamedMemberSorterFunction | INamedMemberSorterFunction[],
): IImport {
  const sort = rawSort;

  if (!sort) {
    return imported;
  }

  if (!Array.isArray(sort)) {
    const singleSortedImport = {...imported};

    singleSortedImport.namedMembers = [...imported.namedMembers].sort(
      sort as INamedMemberSorterFunction,
    );

    return singleSortedImport;
  }

  const sorters = sort as INamedMemberSorterFunction[];

  if (sorters.length === 0) {
    return imported;
  }

  const multiSort = (first: NamedMember, second: NamedMember): number => {
    let sorterIndex = 0;
    let comparison = 0;

    while (comparison === 0 && sorters[sorterIndex]) {
      comparison = sorters[sorterIndex](first, second);
      sorterIndex += 1;
    }

    return comparison;
  };

  const sortedImport = {...imported};
  sortedImport.namedMembers = [...imported.namedMembers].sort(multiSort);

  return sortedImport;
}

export function applyChanges(code: string, changes: ICodeChange[]): string {
  let changedCode = code;

  for (const change of changes) {
    changedCode =
      changedCode.slice(0, change.start) +
      change.code +
      changedCode.slice(change.end, changedCode.length);
  }

  return changedCode;
}

function addFallback(style: IStyle, file?: string, options?: object): IStyle {
  return styleApi => {
    const items = [{separator: true}, {match: styleApi.always}];

    return style(styleApi, file, options).concat(items);
  };
}
