import "mocha";

import {assert} from "chai";

import {parseImports} from "../../lib";

const parseTypeScriptImports = code => {
  // No file name is passed to the parser here
  return parseImports(code, {file: __dirname + "/typescript.ts"});
};

describe("parseImports (TypeScript, without @babel/preset-typescript)", () => {
  it("should return imports", () => {
    const imports = parseTypeScriptImports(
      `
import "a";
import b from "b";
import {c} from "c";
import d, {e} from "f";
import g, {h as hh} from "i";
import * as j from "k";
import l, * as m from "o";

// Random TypeScript syntax (that is not Flow syntax)
const a: number = "123" as any;
`.trim(),
    );

    assert.equal(imports.length, 7);

    imports.forEach(imported => {
      assert.equal(imported.type, "import");
    });

    // import "a";
    assert.equal(imports[0].start, 0);
    assert.equal(imports[0].end, 11);
    assert.equal(imports[0].moduleName, "a");

    // import b from "b";
    assert.equal(imports[1].start, imports[0].end + 1);
    assert.equal(imports[1].end, imports[0].end + 1 + 18);
    assert.equal(imports[1].moduleName, "b");
    assert.equal(imports[1].defaultMember, "b");

    // import {c} from "c";
    assert.equal(imports[2].start, imports[1].end + 1);
    assert.equal(imports[2].end, imports[1].end + 1 + 20);
    assert.equal(imports[2].moduleName, "c");
    assert.deepEqual(imports[2].namedMembers![0], {name: "c", alias: "c"});

    // import d, {e} from "f";
    assert.equal(imports[3].start, imports[2].end + 1);
    assert.equal(imports[3].end, imports[2].end + 1 + 23);
    assert.equal(imports[3].moduleName, "f");
    assert.equal(imports[3].defaultMember, "d");
    assert.deepEqual(imports[3].namedMembers![0], {name: "e", alias: "e"});

    // import g, {h as hh} from "i";
    assert.equal(imports[4].start, imports[3].end + 1);
    assert.equal(imports[4].end, imports[3].end + 1 + 29);
    assert.equal(imports[4].moduleName, "i");
    assert.equal(imports[4].defaultMember, "g");
    assert.deepEqual(imports[4].namedMembers![0], {name: "h", alias: "hh"});

    // import * as j from "k";
    assert.equal(imports[5].start, imports[4].end + 1);
    assert.equal(imports[5].end, imports[4].end + 1 + 23);
    assert.equal(imports[5].moduleName, "k");
    assert.equal(imports[5].namespaceMember, "j");

    // import l, * as m from "o";
    assert.equal(imports[6].start, imports[5].end + 1);
    assert.equal(imports[6].end, imports[5].end + 1 + 26);
    assert.equal(imports[6].moduleName, "o");
    assert.equal(imports[6].defaultMember, "l");
    assert.equal(imports[6].namespaceMember, "m");
  });
});
