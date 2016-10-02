import "mocha";
import {assert} from "chai";

import {getConfig} from "../src";
import resolve = require("resolve-from");

describe("default config", () => {
  it("", () => {
    const config = getConfig(".js");

    assert.equal(config!.parser, resolve(__dirname, "import-sort-parser-babylon"));
    assert.equal(config!.style, resolve(__dirname, "import-sort-style-eslint"));
  });
});
