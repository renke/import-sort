import {expect} from "chai";
import importSort from "../src";

import {
  startsWithLowerCase,
  startsWithUpperCase,
} from "../src/matcher";

import {byIdentifier} from "../src/sorter";

describe("importSorter", () => {
  it("should sort a single bucket", () => {
    const unsorted =
`
import b from "b";
import a from "a";
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";
`.trim() + "\n";

    const style = [
      {match: () => true, sort: byIdentifier},
    ];

    expect(importSort(unsorted, style)).to.equal(expected);
  });

  it("should sort buckets individually", () => {
    const unsorted =
`
import b from "b";
import B from "B";
import a from "a";
import A from "A";
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";
import A from "A";
import B from "B";
`.trim() + "\n";

    const style = [
      {match: startsWithLowerCase, sort: byIdentifier},
      {match: startsWithUpperCase, sort: byIdentifier},
    ];

    expect(importSort(unsorted, style)).to.equal(expected);
  });

  it("should separate buckets", () => {
    const unsorted =
`
import a from "a";
import A from "A";
`.trim() + "\n";

    const expected =
`
import a from "a";

import A from "A";
`.trim() + "\n";

    const style = [
      {match: startsWithLowerCase, sort: byIdentifier},
      {match: () => false, separator: "\n"},
      {match: startsWithUpperCase, sort: byIdentifier},
    ];

    expect(importSort(unsorted, style)).to.equal(expected);
  });

  it("should not add trailing or leading separator", () => {
    const unsorted =
`
import a from "a";
import A from "A";
`.trim() + "\n";

    const expected =
`
import a from "a";
import A from "A";
`.trim() + "\n";

    const style = [
      {match: () => false, separator: "\n"},
      {match: startsWithLowerCase, sort: byIdentifier},
      {match: startsWithUpperCase, sort: byIdentifier},
      {match: () => false, separator: "\n"},
    ];

    expect(importSort(unsorted, style)).to.equal(expected);
  });

  it("should leave things like copyright headers and shebangs untouched", () => {
    const unsorted =
`
#!/usr/bin/env node

import a from "a";
import A from "A";
`.trim() + "\n";

    const expected =
`
#!/usr/bin/env node

import a from "a";
import A from "A";
`.trim() + "\n";

    const style = [
      {match: () => false, separator: "\n"},
      {match: startsWithLowerCase, sort: byIdentifier},
      {match: startsWithUpperCase, sort: byIdentifier},
      {match: () => false, separator: "\n"},
    ];

    expect(importSort(unsorted, style)).to.equal(expected);
  });

  it("should leave things that lead and follow untouched", () => {
    const unsorted =
`
#!/usr/bin/env node

import a from "a";
import A from "A";

a();
`.trim() + "\n";

    const expected =
`
#!/usr/bin/env node

import a from "a";
import A from "A";

a();
`.trim() + "\n";

    const style = [
      {match: () => false, separator: "\n"},
      {match: startsWithLowerCase, sort: byIdentifier},
      {match: startsWithUpperCase, sort: byIdentifier},
      {match: () => false, separator: "\n"},
    ];

    expect(importSort(unsorted, style)).to.equal(expected);
  });

  it("should leave at most one blank line before and after", () => {
    const unsorted =
`
#!/usr/bin/env node

import a from "a";
import A from "A";

a();
`.trim() + "\n";

    const expected =
`
#!/usr/bin/env node

import a from "a";
import A from "A";

a();
`.trim() + "\n";

    const style = [
      {match: () => false, separator: "\n"},
      {match: startsWithLowerCase, sort: byIdentifier},
      {match: startsWithUpperCase, sort: byIdentifier},
      {match: () => false, separator: "\n"},
    ];

    expect(importSort(unsorted, style)).to.equal(expected);
  });

  it("should join imports by \\n", () => {
    const unsorted =
`
import a from "a"; import A from "A";
`.trim() + "\n";

    const expected =
`
import a from "a";
import A from "A";
`.trim() + "\n";

    const style = [
      {match: () => false, separator: "\n"},
      {match: startsWithLowerCase, sort: byIdentifier},
      {match: startsWithUpperCase, sort: byIdentifier},
      {match: () => false, separator: "\n"},
    ];

    expect(importSort(unsorted, style)).to.equal(expected);
  });

  it("should throw exception on invalid syntax", () => {
    const unsorted =
`
import a from "a";
import A from "A";
let
`.trim() + "\n";

    expect(() => importSort(unsorted)).to.throw();
  });

  it("should be indempotent", () => {
    const unsorted =
`
import a from "a";
import A from "A";
`.trim() + "\n";

    const expected =
`
import a from "a";

import A from "A";
`.trim() + "\n";

    const style = [
      {match: startsWithLowerCase, sort: byIdentifier},
      {match: () => false, separator: "\n"},
      {match: startsWithUpperCase, sort: byIdentifier},
    ];

    let sorted = importSort(unsorted, style);

    expect(sorted).to.equal(expected);
    expect(importSort(sorted, style)).to.equal(sorted);
  });
});
