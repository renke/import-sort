import "mocha";

import {assert} from "chai";
import {IImport} from "import-sort-parser";

import {formatImport, parseImports} from "../../lib";

const parseFlowImports = code => {
  // No file name is passed to the parser here
  return parseImports(code);
};

describe("parseImports (Flow, without @babel/preset-flow)", () => {
  it("should return default type import", () => {
    const imports = parseFlowImports(
      `
import type p from 'q';
`.trim(),
    );

    assert.equal(imports[0].type, "import-type");
    assert.equal(imports[0].start, 0);
    assert.equal(imports[0].end, imports[0].end);
    assert.equal(imports[0].moduleName, "q");
    assert.equal(imports[0].defaultMember, "p");
  });

  it("should include type information for named type imports", () => {
    const imports = parseFlowImports(
      `
import {type a} from "x";
`.trim(),
    );

    assert.equal(imports[0].namedMembers[0].type, true);
  });
});
