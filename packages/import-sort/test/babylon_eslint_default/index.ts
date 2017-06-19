import "mocha";
import {assert} from "chai";

import * as parser from "import-sort-parser-babylon";
import style from "import-sort-style-eslint";
import {sortImports} from "../../src";

import {CLIEngine} from "eslint";
import {readFileSync} from "fs";
import {join} from "path";

describe("sortImports (babylon, eslint)", () => {
  it("should have no errors", () => {
    const file = join(__dirname, "babylon_eslint.js.test");
    const code = readFileSync(file, "utf-8");

    const result = sortImports(code, parser, style, file);

    const cli = new CLIEngine({
      pwd: __dirname,
    });

    const report = cli.executeOnText(result.code, file);

    assert.equal(report.errorCount, 0);
  });
});