import {dirname} from "path";

import {IImport} from "import-sort-parser";
import {
  IComparatorFunction,
  IMatcherFunction,
  INamedMemberSorterFunction,
  IPredicateFunction,
  ISorterFunction,
  IStyleAPI,
} from "import-sort-style";
import * as resolve from "resolve";

import isNodeModulePredicate = require("is-builtin-module");

function member(predicate: IPredicateFunction): IMatcherFunction;
function member(comparator: IComparatorFunction): ISorterFunction;
function member(
  predicateOrComparator: IPredicateFunction | IComparatorFunction,
): IMatcherFunction | ISorterFunction {
  // tslint:disable-next-line
  if ((predicateOrComparator as Function).length === 1) {
    const predicate = predicateOrComparator as IPredicateFunction;

    return (imported: IImport): boolean => {
      const importMember =
        imported.defaultMember ||
        imported.namespaceMember ||
        imported.namedMembers[0].alias;
      return predicate(importMember);
    };
  }
  const comparator = predicateOrComparator as IComparatorFunction;

  return (firstImport: IImport, secondImport: IImport): number => {
    const first =
      firstImport.defaultMember ||
      firstImport.namespaceMember ||
      firstImport.namedMembers.length > 0 && firstImport.namedMembers[0].alias;
    const second =
      secondImport.defaultMember ||
      secondImport.namespaceMember ||
      secondImport.namedMembers.length > 0 && secondImport.namedMembers[0].alias;

    return comparator(first, second);
  };
}

function moduleName(predicate: IPredicateFunction): IMatcherFunction;
function moduleName(comparator: IComparatorFunction): ISorterFunction;
function moduleName(
  predicateOrComparator: IPredicateFunction | IComparatorFunction,
): IMatcherFunction | ISorterFunction {
  // tslint:disable-next-line
  if ((predicateOrComparator as Function).length === 1) {
    const predicate = predicateOrComparator as IPredicateFunction;

    return (imported: IImport): boolean => {
      const importMember = imported.moduleName;
      return predicate(importMember);
    };
  }
  const comparator = predicateOrComparator as IComparatorFunction;

  return (firstImport: IImport, secondImport: IImport): number => {
    const first = firstImport.moduleName;
    const second = secondImport.moduleName;

    return comparator(first, second);
  };
}

function name(comparator: IComparatorFunction): INamedMemberSorterFunction {
  return (firstNamedMember, secondNamedMember) => {
    return comparator(firstNamedMember.name, secondNamedMember.name);
  };
}

function alias(comparator: IComparatorFunction): INamedMemberSorterFunction {
  return (firstNamedMember, secondNamedMember) => {
    return comparator(firstNamedMember.alias, secondNamedMember.alias);
  };
}

function always() {
  return true;
}

function not(matcher: IMatcherFunction): IMatcherFunction {
  return imported => {
    return !matcher(imported);
  };
}

function and(...matchers: IMatcherFunction[]): IMatcherFunction {
  return imported => {
    return matchers.every(matcher => matcher(imported));
  };
}

function or(...matchers: IMatcherFunction[]): IMatcherFunction {
  return imported => {
    return matchers.some(matcher => matcher(imported));
  };
}

function hasDefaultMember(imported: IImport): boolean {
  return !!imported.defaultMember;
}

function hasNamespaceMember(imported: IImport): boolean {
  return !!imported.namespaceMember;
}

function hasNamedMembers(imported: IImport): boolean {
  return imported.namedMembers.length > 0;
}

function hasMember(imported: IImport): boolean {
  return (
    hasDefaultMember(imported) ||
    hasNamespaceMember(imported) ||
    hasNamedMembers(imported)
  );
}

function hasNoMember(imported: IImport): boolean {
  return !hasMember(imported);
}

function hasOnlyDefaultMember(imported: IImport): boolean {
  return (
    hasDefaultMember(imported) &&
    !hasNamespaceMember(imported) &&
    !hasNamedMembers(imported)
  );
}

function hasOnlyNamespaceMember(imported: IImport): boolean {
  return (
    !hasDefaultMember(imported) &&
    hasNamespaceMember(imported) &&
    !hasNamedMembers(imported)
  );
}

function hasOnlyNamedMembers(imported: IImport): boolean {
  return (
    !hasDefaultMember(imported) &&
    !hasNamespaceMember(imported) &&
    hasNamedMembers(imported)
  );
}

function hasMultipleMembers(imported): boolean {
  return (
    imported.namedMembers.length +
      (imported.defaultMember ? 1 : 0) +
      (imported.namespaceMember ? 1 : 0) >
    1
  );
}

function hasSingleMember(imported): boolean {
  return (
    imported.namedMembers.length + (imported.defaultMember ? 1 : 0) === 1 &&
    !hasNamespaceMember(imported)
  );
}

function isNodeModule(imported: IImport): boolean {
  return isNodeModulePredicate(imported.moduleName);
}

function isRelativeModule(imported: IImport): boolean {
  return imported.moduleName.indexOf(".") === 0;
}

function isAbsoluteModule(imported: IImport): boolean {
  return !isRelativeModule(imported);
}

function isInstalledModule(baseFile: string): IMatcherFunction {
  return (imported: IImport) => {
    try {
      const resolvePath = resolve.sync(imported.moduleName, {
        basedir: dirname(baseFile),
      });

      return resolvePath.includes("node_modules");
    } catch (e) {
      return false;
    }
  };
}

function isScopedModule(imported: IImport): boolean {
  return imported.moduleName.startsWith("@");
}

function startsWithUpperCase(text: string): boolean {
  const start = text.charAt(0);
  return text.charAt(0) === start.toUpperCase();
}

function startsWithLowerCase(text: string): boolean {
  const start = text.charAt(0);
  return text.charAt(0) === start.toLowerCase();
}

function startsWithAlphanumeric(text: string): boolean {
  return !!text.match(/^[A-Za-z0-9]/);
}

function startsWith(...prefixes: string[]) {
  return text => {
    return prefixes.some(prefix => text.startsWith(prefix));
  };
}

function naturally(first: string, second: string): number {
  return first.localeCompare(second, "en");
}

function unicode(first: string, second: string): number {
  if (first < second) {
    return -1;
  }

  if (first > second) {
    return 1;
  }

  return 0;
}

function dotSegmentCount(firstImport: IImport, secondImport: IImport): number {
  const regex = /\.+(?=\/)/g;

  const firstCount = (firstImport.moduleName.match(regex) || []).join("")
    .length;
  const secondCount = (secondImport.moduleName.match(regex) || []).join("")
    .length;

  if (firstCount > secondCount) {
    return -1;
  }

  if (firstCount < secondCount) {
    return 1;
  }

  return 0;
}

const StyleAPI: IStyleAPI = {
  member,

  moduleName,

  name,
  alias,

  always,
  not,
  and,
  or,

  hasMember,
  hasNoMember,

  hasNamespaceMember,
  hasDefaultMember,
  hasNamedMembers,

  hasOnlyDefaultMember,
  hasOnlyNamespaceMember,
  hasOnlyNamedMembers,

  hasMultipleMembers,
  hasSingleMember,

  isNodeModule,
  isRelativeModule,
  isAbsoluteModule,
  isScopedModule,
  isInstalledModule,

  startsWithUpperCase,
  startsWithLowerCase,
  startsWithAlphanumeric,

  startsWith,

  naturally,
  unicode,
  dotSegmentCount,
};

export default StyleAPI;
