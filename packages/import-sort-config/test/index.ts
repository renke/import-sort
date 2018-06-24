import "mocha";

import {assert} from "chai";

import {getConfig} from "../src";

import path = require("path");

import resolve = require("resolve-from");

describe("default config", () => {
  const fixtures = path.join(__dirname, "./fixtures");

  it("should resolve to default config", () => {
    const config = getConfig(".js");

    assert.equal(
      config!.parser,
      resolve(__dirname, "import-sort-parser-babylon"),
    );
    assert.equal(config!.style, resolve(__dirname, "import-sort-style-eslint"));
  });

  it("should resolve shorthand module names", () => {
    const config = getConfig("shorthand", fixtures);

    assert.equal(config!.style, resolve(fixtures, "import-sort-style-test"));
  });

  it("should resolve relative modules", () => {
    const config = getConfig("relative", fixtures);

    assert.equal(config!.style, resolve(fixtures, "./local-style.js"));
  });

  it("should resolve any module", () => {
    const config = getConfig("unprefixed", fixtures);

    assert.equal(config!.parser, resolve(fixtures, "some-parser"));
  });
});
