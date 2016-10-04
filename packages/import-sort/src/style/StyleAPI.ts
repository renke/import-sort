import {
  IComparatorFunction,
  IMatcherFunction,
  INamedMemberSorterFunction,
  IPredicateFunction,
  ISorterFunction,
  IStyleAPI,
} from "import-sort-style";

import {IImport} from "import-sort-parser";

function member(predicate: IPredicateFunction): IMatcherFunction;
function member(comparator: IComparatorFunction): ISorterFunction;
function member(predicateOrComparator: IPredicateFunction | IComparatorFunction): IMatcherFunction | ISorterFunction {
  if ((predicateOrComparator as Function).length === 1) {
    const predicate = predicateOrComparator as IPredicateFunction;

    return (imported: IImport): boolean => {
      const member = imported.defaultMember || imported.namespaceMember || imported.namedMembers[0].alias;
      return predicate(member);
    };
  } else {
    const comparator = predicateOrComparator as IComparatorFunction;

    return (firstImport: IImport, secondImport: IImport): number => {
      const first = firstImport.defaultMember || firstImport.namespaceMember || firstImport.namedMembers[0].alias;
      const second = secondImport.defaultMember || secondImport.namespaceMember || secondImport.namedMembers[0].alias;

      return comparator(first, second);
    };
  }
}

function moduleName(predicate: IPredicateFunction): IMatcherFunction;
function moduleName(comparator: IComparatorFunction): ISorterFunction;
function moduleName(predicateOrComparator: IPredicateFunction | IComparatorFunction): IMatcherFunction | ISorterFunction {
  if ((predicateOrComparator as Function).length === 1) {
    const predicate = predicateOrComparator as IPredicateFunction;

    return (imported: IImport): boolean => {
      const member = imported.moduleName;
      return predicate(member);
    };
  } else {
    const comparator = predicateOrComparator as IComparatorFunction;

    return (firstImport: IImport, secondImport: IImport): number => {
      const first = firstImport.moduleName;
      const second = secondImport.moduleName;

      return comparator(first, second);
    };
  }
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

function and(...matchers: Array<IMatcherFunction>): IMatcherFunction {
  return imported => {
    return matchers.every(matcher => matcher(imported));
  }
}

function or(...matchers: Array<IMatcherFunction>): IMatcherFunction {
  return imported => {
    return matchers.some(matcher => matcher(imported));
  }
}

function hasMember(imported: IImport): boolean {
  return hasDefaultMember(imported) || hasNamespaceMember(imported) || hasNamedMembers(imported);
}

function hasNoMember(imported: IImport): boolean {
  return !hasMember(imported);
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

function hasOnlyDefaultMember(imported: IImport): boolean {
  return hasDefaultMember(imported) && !hasNamespaceMember(imported) && !hasNamedMembers(imported);
}

function hasOnlyNamespaceMember(imported: IImport): boolean {
  return !hasDefaultMember(imported) && hasNamespaceMember(imported) && !hasNamedMembers(imported);
}

function hasOnlyNamedMembers(imported: IImport): boolean {
    return !hasDefaultMember(imported) && !hasNamespaceMember(imported) && hasNamedMembers(imported);
}

function hasMultipleMembers(imported): boolean {
  return (imported.namedMembers.length + (imported.defaultMember ? 1 : 0) + (imported.namespaceMember ? 1 : 0)) > 1;
};

function hasSingleMember(imported): boolean {
  return (imported.namedMembers.length + (imported.defaultMember ? 1 : 0)) === 1 && !hasNamespaceMember(imported);
}

function isRelativeModule(imported: IImport): boolean {
  return imported.moduleName.indexOf(".") === 0;
}

function isAbsoluteModule(imported: IImport): boolean {
  return !isRelativeModule(imported);
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

  isRelativeModule,
  isAbsoluteModule,

  naturally,
  unicode,
};

export default StyleAPI;
