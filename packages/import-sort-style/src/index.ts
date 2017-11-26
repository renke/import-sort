import {IImport, NamedMember} from "import-sort-parser";

export interface IStyleAPI {
  member: ISelectorFunction;

  // firstNamedMember: ISelectorFunction;
  // defaultMember: ISelectorFunction;
  // namespaceMember: ISelectorFunction;

  moduleName: ISelectorFunction;

  name: INamedMemberSelectorFunction;
  alias: INamedMemberSelectorFunction;

  always: IMatcherFunction;
  not: (matcher: IMatcherFunction) => IMatcherFunction;

  and: (...matcher: Array<IMatcherFunction>) => IMatcherFunction;
  or: (...matcher: Array<IMatcherFunction>) => IMatcherFunction;

  hasNoMember: IMatcherFunction;
  hasMember: IMatcherFunction;

  hasDefaultMember: IMatcherFunction;
  hasNamespaceMember: IMatcherFunction;
  hasNamedMembers: IMatcherFunction;

  hasOnlyDefaultMember: IMatcherFunction;
  hasOnlyNamespaceMember: IMatcherFunction;
  hasOnlyNamedMembers: IMatcherFunction;

  hasMultipleMembers: IMatcherFunction;
  hasSingleMember: IMatcherFunction;

  isNodeModule: IMatcherFunction;
  isRelativeModule: IMatcherFunction;
  isAbsoluteModule: IMatcherFunction;

  startsWithUpperCase: IPredicateFunction;
  startsWithLowerCase: IPredicateFunction;
  startsWithAlphanumeric: IPredicateFunction;

  // reverse: (sorter: ISorterFunction) => ISorterFunction;
  naturally: IComparatorFunction;
  unicode: IComparatorFunction;
  dotSegmentCount: ISorterFunction;
}

export interface IMatcherFunction {
  (i: IImport): boolean;
}

export interface ISorterFunction {
  (i1: IImport, i2: IImport): number;
}

export interface INamedMemberSorterFunction {
  (n1: NamedMember, n2: NamedMember): number;
}

export interface ISelectorFunction {
  (f: IPredicateFunction): IMatcherFunction;
  (c: IComparatorFunction): ISorterFunction;
}

export interface INamedMemberSelectorFunction {
  (c: IComparatorFunction): INamedMemberSorterFunction;
}

export interface IPredicateFunction {
  (s: string): boolean;
}

export interface IComparatorFunction {
  (s1: string, s2: string): number;
}

export interface IStyleItem {
  match?: IMatcherFunction;

  sort?: ISorterFunction | Array<ISorterFunction>;
  sortNamedMembers?: INamedMemberSorterFunction | Array<INamedMemberSorterFunction>;

  separator?: boolean;
}

export interface IStyle {
  (styleApi: IStyleAPI, file?: string, options?: any): Array<IStyleItem>;
}
