import "mocha";
import {assert} from "chai";
import {IImport} from "import-sort-parser";
import stubImport from "../stubImport";

import StyleAPI from "../../src/style/StyleAPI";

describe("dotSegmentCount does not account for dots in filename (issue #36) ", () => {
  it("should not count file extension dots", () => {
    // Segment count 1
    let firstImport: IImport = stubImport({moduleName: "./a.a"});

    // Segment count 1
    let secondImport: IImport = stubImport({moduleName: "./b"});

    assert.equal(StyleAPI.dotSegmentCount(firstImport, secondImport), 0);

    // Segment count 3
    firstImport = stubImport({moduleName: "../aa.aa/./a.a"});

    // Segment count 2
    secondImport = stubImport({moduleName: "../b"});

    // firstImport should be before secondImport
    assert.equal(StyleAPI.dotSegmentCount(firstImport, secondImport), -1);
  });
});
