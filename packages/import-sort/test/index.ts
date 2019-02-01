import "mocha";
import {assert} from "chai";
import {sortImports, applyChanges} from "../src";
import {IStyleAPI, IStyle, IStyleItem} from "import-sort-style";
import * as parser from "import-sort-parser-babylon";

const NO_BUCKET_STYLE: IStyle = (styleApi: IStyleAPI): Array<IStyleItem> => {
  return [];
};

describe("sortImports (babylon, NO_BUCKET_STYLE)", () => {
  it("should not sort imports but keep them", () => {
    const code =
`
import b from "b";
import a from "a";
`.trim() + "\n";

    const expected =
`
import b from "b";
import a from "a";
`.trim() + "\n";

    const result = sortImports(code, parser, NO_BUCKET_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});

const ONE_BUCKET_NATURALLY_STYLE: IStyle = (styleApi: IStyleAPI): Array<IStyleItem> => {
  const items: Array<IStyleItem> = [
    {
      match: styleApi.always,
      sort: styleApi.member(styleApi.naturally),
    },
  ];

  return items;
};

describe("sortImports (babylon, ONE_BUCKET_NATURALLY_STYLE)", () => {
  it("should sort code containing only imports", () => {
    const code =
`
import b from "b";
import a from "a";
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort code containing imports and other things", () => {
    const code =
`
import b from "b";
import a from "a";

console.log("Hello World");
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";

console.log("Hello World");
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort code containing imports and other things", () => {
    const code =
`
import b from "b";
import a from "a";

console.log("Hello World");
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";

console.log("Hello World");
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort code containing imports, a comment and trailing new lines", () => {
    const code =
`
// Above

import b from "b";
import a from "a";
`.trim() + "\n\n";

    const expected =
`
// Above

import a from "a";
import b from "b";
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort code containing imports followed by a comment", () => {
    const code =
`
import b from "b";
import a from "a" // a;

console.log("Hello World");
`.trim() + "\n";

    const expected =
`
import a from "a" // a;
import b from "b";

console.log("Hello World");
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort code containing imports followed by a comment", () => {
    const code =
`
import b from "b";
// a
import a from "a";

console.log("Hello World");
`.trim() + "\n";

    const expected =
`
// a
import a from "a";
import b from "b";

console.log("Hello World");
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort code containing imports anywhere at top-level", () => {
    const code =
`
import b from "b";
import a from "a";

console.log("Hello");
import c from "c";
console.log("World");
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";
import c from "c";

console.log("Hello");
console.log("World");
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should format import such that all named members are on its own line", () => {
    const code =
`
import {a,
  b, c} from "a";
`.trim() + "\n";

    const expected =
`
import {
  a,
  b,
  c
} from "a";
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});

const TWO_BUCKETS_NATURALLY_STYLE: IStyle = (styleApi: IStyleAPI): Array<IStyleItem> => {
  const items: Array<IStyleItem> = [
    {
      match: styleApi.isAbsoluteModule,
      sort: styleApi.member(styleApi.naturally),
    },
    {
      match: styleApi.isRelativeModule,
      sort: styleApi.member(styleApi.naturally),
    },
  ];

  return items;
};

describe("sortImports (babylon, TWO_BUCKETS_NATURALLY_STYLE)", () => {
  it("should sort code containing only imports", () => {
    const code =
`
import b from "b";
import d from "./d";
import a from "a";
import c from "./c";
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";
import c from "./c";
import d from "./d";
`.trim() + "\n";

    const result = sortImports(code, parser, TWO_BUCKETS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort code containing imports and other code", () => {
    const code =
`
import b from "b";
import d from "./d";
import a from "a";
import c from "./c";

console.log("Hello World");
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";
import c from "./c";
import d from "./d";

console.log("Hello World");
`.trim() + "\n";

    const result = sortImports(code, parser, TWO_BUCKETS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});

const TWO_BUCKETS_WITH_SEPARATOR_NATURALLY_STYLE: IStyle = (styleApi: IStyleAPI): Array<IStyleItem> => {
  const items: Array<IStyleItem> = [
    {
      match: styleApi.isAbsoluteModule,
      sort: styleApi.member(styleApi.naturally),
    },
    {
      separator: true,
    },
    {
      match: styleApi.isRelativeModule,
      sort: styleApi.member(styleApi.naturally),
    },
  ];

  return items;
};

describe("sortImports (babylon, TWO_BUCKETS_WITH_SEPARATOR_NATURALLY_STYLE)", () => {
  it("should sort code containing only imports", () => {
    const code =
`
import b from "b";
import d from "./d";
import a from "a";
import c from "./c";
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";

import c from "./c";
import d from "./d";
`.trim() + "\n";

    const result = sortImports(code, parser, TWO_BUCKETS_WITH_SEPARATOR_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort code containing imports and other code", () => {
    const code =
`
import b from "b";
import d from "./d";

import a from "a";
import c from "./c";

console.log("Hello World");
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";

import c from "./c";
import d from "./d";

console.log("Hello World");
`.trim() + "\n";

    const result = sortImports(code, parser, TWO_BUCKETS_WITH_SEPARATOR_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});

const FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE: IStyle = (styleApi: IStyleAPI): Array<IStyleItem> => {
  const items: Array<IStyleItem> = [
    {
      match: styleApi.not(styleApi.hasMember),
      sort: styleApi.member(styleApi.naturally),
    },
    {
      separator: true,
    },
    {
      match: styleApi.hasOnlyDefaultMember,
      sort: styleApi.member(styleApi.naturally),
    },
    {
      separator: true,
    },
    {
      match: styleApi.hasOnlyNamespaceMember,
      sort: styleApi.member(styleApi.naturally),
    },
    {
      separator: true,
    },
    {
      match: styleApi.hasOnlyNamedMembers,
      sort: styleApi.member(styleApi.naturally),
    },
  ];

  return items;
};

describe("sortImports (babylon, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE)", () => {
  it("should sort code containing only imports", () => {
    const code =
`
import {d} from "./d";
import * as c from "c";
import b from "b";
import "a";
`.trim() + "\n";

    const expected =
`
import "a";

import b from "b";

import * as c from "c";

import {d} from "./d";
`.trim() + "\n";

    const result = sortImports(code, parser, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should not add unnecessary separators", () => {
    const code =
`
import {d} from "./d";
import "a";
`.trim() + "\n";

    const expected =
`
import "a";

import {d} from "./d";
`.trim() + "\n";

    const result = sortImports(code, parser, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should not change code containing no imports", () => {
    const code =
`
`.trim() + "\n";

    const expected =
`
`.trim() + "\n";

    const result = sortImports(code, parser, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort imports even placed in a single line", () => {
    const code =
`
import a from "a"; import b from "b";
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";
`.trim() + "\n";

    const result = sortImports(code, parser, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort imports the span multiple lines", () => {
    const code =
`
import {e} from "e";
import {
  b,
  c,
  d,
} from "bcd";
import {a} from "a";
`.trim() + "\n";

    const expected =
`
import {a} from "a";
import {
  b,
  c,
  d,
} from "bcd";
import {e} from "e";
`.trim() + "\n";

    const result = sortImports(code, parser, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should leave a blank line after headers (such as copyright texts)", () => {
    const code =
`
// Copyright

import b from "b";
import a from "a";
`.trim() + "\n";

    const expected =
`
// Copyright

import a from "a";
import b from "b";
`.trim() + "\n";

    const result = sortImports(code, parser, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should add a blank line after the shebang", () => {
    const code =
`
#!/usr/bin/env node
import b from "b";
import a from "a";
`.trim() + "\n";

    const expected =
`
#!/usr/bin/env node

import a from "a";
import b from "b";
`.trim() + "\n";

    const result = sortImports(code, parser, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should leave no blank files if imports come first", () => {
    const code = "\n\n" +
`
import b from "b";
import a from "a";
`.trim() + "\n";

    const expected =
`
import a from "a";
import b from "b";
`.trim() + "\n";

    const result = sortImports(code, parser, FOUR_BUCKETS_WITH_SEPARATORS_NATURALLY_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});

const ONE_BUCKET_NATURALLY_BY_MODULE_AND_MEMBER_STYLE: IStyle = (styleApi: IStyleAPI): Array<IStyleItem> => {
  const items: Array<IStyleItem> = [
    {
      match: styleApi.always,
      sort: [styleApi.moduleName(styleApi.naturally), styleApi.member(styleApi.naturally)],
    },
  ];

  return items;
};

describe("sortImports (babylon, ONE_BUCKET_NATURALLY_BY_MODULE_AND_MEMBER_STYLE)", () => {
  it("should sort code containing only imports", () => {
    const code =
`
import b from "y";
import a from "x";
import d from "y";
import c from "x";
`.trim() + "\n";

    const expected =
`
import a from "x";
import c from "x";
import b from "y";
import d from "y";
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURALLY_BY_MODULE_AND_MEMBER_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});

const ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE: IStyle = (styleApi: IStyleAPI): Array<IStyleItem> => {
  const items: Array<IStyleItem> = [
    {
      match: styleApi.always,
      sort: [styleApi.moduleName(styleApi.naturally), styleApi.member(styleApi.naturally)],
      sortNamedMembers: styleApi.name(styleApi.naturally),
    },
  ];

  return items;
};

describe("sortImports (babylon, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE)", () => {
  it("should sort named members", () => {
    const code =
`
import {c, b, a} from "x";
`.trim() + "\n";

    const expected =
`
import {a, b, c} from "x";
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("should sort named members", () => {
    const code =
`
import {
  c,
  b,
  a
} from "x";
`.trim() + "\n";

    const expected =
`
import {
  a,
  b,
  c
} from "x";
`.trim() + "\n";

    const result = sortImports(code, parser, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});

describe("respect typeof (babylon, NO_BUCKET_STYLE)", () => {
  it("should not remove typeof", () => {
    const code =
`
import {typeof a} from "a";
`.trim() + "\n";

    const expected =
`
import {typeof a} from "a";
`.trim() + "\n";

    const result = sortImports(code, parser, NO_BUCKET_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});