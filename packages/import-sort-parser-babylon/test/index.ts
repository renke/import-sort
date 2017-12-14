import "mocha";

import {assert} from "chai";
import {IImport} from "import-sort-parser";

import {formatImport, parseImports} from "../src";

describe("parseImports", () => {
  it("should return imports", () => {
    const imports = parseImports(
      `
import "a";
import b from "b";
import {c} from "c";
import d, {e} from "f";
import g, {h as hh} from "i";
import * as j from "k";
import l, * as m from "o";
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

  it("should return default type import", () => {
    const imports = parseImports(
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

  it("should include nearby comments", () => {
    const imports = parseImports(
      `
// Above
import "a"; // Besides
// Below
`.trim(),
    );

    assert.equal(imports[0].start, 0);
    assert.equal(imports[0].end, 31);
  });

  it("should include all comments", () => {
    const imports = parseImports(
      `
// Above
// Above
import "a"; // Besides
// Below
// Below
`.trim(),
    );

    assert.equal(imports[0].start, 0);
    assert.equal(imports[0].end, 40);
  });

  it("should only include nearby comments", () => {
    const imports = parseImports(
      `
// Above

import "a"; // Besides

// Below
`.trim(),
    );

    assert.equal(imports[0].start, 10);
    assert.equal(imports[0].end, 10 + 22);
  });

  it("should not include shebang", () => {
    const imports = parseImports(
      `
#!/bin/sh
import "a";
`.trim(),
    );

    assert.equal(imports[0].start, 10);
    assert.equal(imports[0].end, 10 + 11);
  });

  it("should include all nearby but exclude far away comments", () => {
    const imports = parseImports(
      `
// Above

// Above
import "a"; // Besides
// Below

// Below
`.trim(),
    );

    assert.equal(imports[0].start, 10);
    assert.equal(imports[0].end, 10 + 31);
  });

  it("should not treat trailing comment on previous import as leading comment", () => {
    const imports = parseImports(
      `
import "a"; // Besides
import "b";
`.trim(),
    );

    assert.equal(imports[0].start, 0);
    assert.equal(imports[0].end, 22);

    assert.equal(imports[1].start, 23);
    assert.equal(imports[1].end, 1 + 22 + 11);
  });

  it("should include type information for named type imports", () => {
    const imports = parseImports(
      `
import {type a} from "x";
`.trim(),
    );

    assert.equal(imports[0].namedMembers[0].type, true);
  });
});

describe("formatImport", () => {
  it("should not change one-line imports", () => {
    const actual = `
import {a, b, c} from "xyz"
`.trim();

    const imported: IImport = {
      start: 0,
      end: 27,
      type: "import",
      moduleName: "xyz",
      namedMembers: [
        {name: "a", alias: "a"},
        {name: "b", alias: "b"},
        {name: "c", alias: "c"},
      ],
    };

    const expected = `
import {a, b, c} from "xyz"
`.trim();

    assert.equal(formatImport(actual, imported), expected);
  });

  it("should not change full multi-line imports with same indendation", () => {
    const actual = `
import {
  a,
  b,
  c
} from "xyz"
`.trim();

    const imported: IImport = {
      start: 0,
      end: 36,
      type: "import",
      moduleName: "xyz",
      namedMembers: [
        {name: "a", alias: "a"},
        {name: "b", alias: "b"},
        {name: "c", alias: "c"},
      ],
    };

    const expected = `
import {
  a,
  b,
  c
} from "xyz"
`.trim();

    assert.equal(formatImport(actual, imported), expected);
  });

  it("should change partial multi-line imports indented by 2 spaces", () => {
    const actual = `
import {a,
  b,
c
} from "xyz"
`.trim();

    const imported: IImport = {
      start: 0,
      end: 30,
      type: "import",
      moduleName: "xyz",
      namedMembers: [
        {name: "a", alias: "a"},
        {name: "b", alias: "b"},
        {name: "c", alias: "c"},
      ],
    };

    const expected = `
import {
  a,
  b,
  c
} from "xyz"
`.trim();

    assert.equal(formatImport(actual, imported), expected);
  });

  it("should change partial multi-line imports indented by 4 spaces", () => {
    const actual = `
import {a,
    b,
c
} from "xyz"
`.trim();

    const imported: IImport = {
      start: 0,
      end: 32,
      type: "import",
      moduleName: "xyz",
      namedMembers: [
        {name: "a", alias: "a"},
        {name: "b", alias: "b"},
        {name: "c", alias: "c"},
      ],
    };

    const expected = `
import {
    a,
    b,
    c
} from "xyz"
`.trim();

    assert.equal(formatImport(actual, imported), expected);
  });

  it("should preserve whitespace around braces in one-line imports", () => {
    const actual = `
import { a, b, c } from "xyz"
`.trim();

    const imported: IImport = {
      start: 0,
      end: 29,
      type: "import",
      moduleName: "xyz",
      namedMembers: [
        {name: "a", alias: "a"},
        {name: "b", alias: "b"},
        {name: "c", alias: "c"},
      ],
    };

    const expected = `
import { a, b, c } from "xyz"
`.trim();

    assert.equal(formatImport(actual, imported), expected);
  });

  it("should format named same-line type imports", () => {
    const actual = `
import { type a, type b, c } from "xyz"
`.trim();

    const imported: IImport = {
      start: 0,
      end: 40,
      type: "import",
      moduleName: "xyz",
      namedMembers: [
        {name: "a", alias: "a", type: true},
        {name: "b", alias: "b", type: true},
        {name: "c", alias: "c"},
      ],
    };

    const expected = `
import { type a, type b, c } from "xyz"
`.trim();

    assert.equal(formatImport(actual, imported), expected);
  });

  it("should format named multi-line type imports", () => {
    const actual = `
import {
  type a,
  type b,
  c
} from "xyz"
`.trim();

    const imported: IImport = {
      start: 0,
      end: 46,
      type: "import",
      moduleName: "xyz",
      namedMembers: [
        {name: "a", alias: "a", type: true},
        {name: "b", alias: "b", type: true},
        {name: "c", alias: "c"},
      ],
    };

    const expected = `
import {
  type a,
  type b,
  c
} from "xyz"
`.trim();

    assert.equal(formatImport(actual, imported), expected);
  });
});
