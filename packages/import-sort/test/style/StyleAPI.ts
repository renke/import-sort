import "mocha";
import {assert} from "chai";

import {IPredicateFunction, IComparatorFunction} from "import-sort-style";
import {IImport} from "import-sort-parser";
import stubImport from "../stubImport";

import StyleAPI from "../../src/style/StyleAPI";

describe("StyleAPI", () => {
  it("member matcher", () => {

    const predicate: IPredicateFunction = member => {
      return member === "foo" ? true : false;
    };

    const imported: IImport = stubImport({defaultMember: "foo"});

    assert.isTrue(StyleAPI.member(predicate)(imported));
  });

  it("member sorter", () => {
    const comparator: IComparatorFunction = (firstMember, secondMember) => {
      return firstMember.localeCompare(secondMember);
    };

    const firstImport: IImport = stubImport({defaultMember: "a"});
    const secondImport: IImport = stubImport({defaultMember: "b"});

    assert.isBelow(StyleAPI.member(comparator)(firstImport, secondImport), 0);
  });
});
