import {IStyle, IStyleAPI, IStyleItem} from "import-sort-style";
import {applyChanges, sortImports} from "../src";
import {assert} from "chai";
import * as parserBabylon from "import-sort-parser-babylon";
import * as parserTypescript from "import-sort-parser-typescript";

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

describe("Error with comments (issue #35)", () => {
  it("should not swallow parts of the leading comments (babylon)", () => {
     const code = `
// NativeModules.TTRNBridge = {log:()=>{}};NativeModules.TTRNDeviceInfo = { model: 'iPhone', appVersion: '6.3.0' };
import { consoleKiller } from './src/utils';     
`.trim() + "\n";

    const result = sortImports(code, parserBabylon, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    assert.equal(code, result.code);
  });

  it("should not swallow parts of the leading comments (typescript)", () => {
    const code = `
// NativeModules.TTRNBridge = {log:()=>{}};NativeModules.TTRNDeviceInfo = { model: 'iPhone', appVersion: '6.3.0' };
import { consoleKiller } from './src/utils';     
`.trim() + "\n";

    const result = sortImports(code, parserTypescript, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    assert.equal(code, result.code);
  });
});

describe("Respect line ending (issue #37)", () => {
  it("CR+LF", () => {
    const code = `import b from "b"\r\nimport a from "a"\r\n`;

    const expected = `import a from "a"\r\nimport b from "b"\r\n`;

    const result = sortImports(code, parserBabylon, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("CR+LF, named members, babylon", () => {
    const code = `import {\r\nb,\r\na,\r\n} from "ab"\r\n`;

    const expected = `import {\r\na,\r\nb,\r\n} from "ab"\r\n`;

    const result = sortImports(code, parserBabylon, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("CR+LF, named members, typescript", () => {
    const code = `import {\r\nb,\r\na,\r\n} from "ab"\r\n`;

    const expected = `import {\r\na,\r\nb,\r\n} from "ab"\r\n`;

    const result = sortImports(code, parserTypescript, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("LF", () => {
    const code = `import b from "b"\nimport a from "a"\n`;

    const expected = `import a from "a"\nimport b from "b"\n`;

    const result = sortImports(code, parserBabylon, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("LF, named members, babylon", () => {
    const code = `import {\nb,\na,\n} from "ab"\n`;

    const expected = `import {\na,\nb,\n} from "ab"\n`;

    const result = sortImports(code, parserBabylon, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });

  it("LF, named members, typescript", () => {
    const code = `import {\nb,\na,\n} from "ab"\n`;

    const expected = `import {\na,\nb,\n} from "ab"\n`;

    const result = sortImports(code, parserTypescript, ONE_BUCKET_NATURAL_NAMED_MEMBERS_STYLE);

    const actual = result.code;
    const changes = result.changes;

    assert.equal(actual, expected);
    assert.equal(applyChanges(code, changes), expected);
  });
});
