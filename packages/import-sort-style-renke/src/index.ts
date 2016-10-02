import {IStyleAPI, IStyleItem} from "import-sort-style";

export default function(styleApi: IStyleAPI): Array<IStyleItem> {
  const {
    and,
    hasDefaultMember,
    hasNamedMembers,
    hasNamespaceMember,
    hasNoMember,
    hasOnlyDefaultMember,
    hasOnlyNamedMembers,
    hasOnlyNamespaceMember,
    isAbsoluteModule,
    isRelativeModule,
    member,
    unicode,
    name,
  } = styleApi;

  return [
    // import "foo"
    {match: and(hasNoMember, isAbsoluteModule)},
    {separator: true},

    // import "./foo"
    {match: and(hasNoMember, isRelativeModule)},
    {separator: true},

    // import * as foo from "bar";
    {match: and(hasOnlyNamespaceMember, isAbsoluteModule), sort: member(unicode)},

    // import foo, * as bar from "baz";
    {match: and(hasDefaultMember, hasNamespaceMember, isAbsoluteModule), sort: member(unicode)},

    // import foo from "bar";
    {match: and(hasOnlyDefaultMember, isAbsoluteModule), sort: member(unicode)},

    // import foo, {bar, …} from "baz";
    {match: and(hasDefaultMember, hasNamedMembers, isAbsoluteModule), sort: member(unicode), sortNamedMembers: name(unicode)},

    // import {foo, bar, …} from "baz";
    {match: and(hasOnlyNamedMembers, isAbsoluteModule), sort: member(unicode), sortNamedMembers: name(unicode)},
    {separator: true},

    // import * as foo from "./bar";
    {match: and(hasOnlyNamespaceMember, isRelativeModule), sort: member(unicode)},

    // import foo, * as bar from "./baz";
    {match: and(hasDefaultMember, hasNamespaceMember, isAbsoluteModule), sort: member(unicode)},

    // import foo from "./bar";
    {match: and(hasOnlyDefaultMember, isRelativeModule), sort: member(unicode)},

    // import foo, {bar, …} from "./baz";
    {match: and(hasDefaultMember, hasNamedMembers, isRelativeModule), sort: member(unicode), sortNamedMembers: name(unicode)},

    // import {foo, bar, …} from "./baz";
    {match: and(hasOnlyNamedMembers, isRelativeModule), sort: member(styleApi.unicode), sortNamedMembers: name(unicode)},
    {separator: true},
  ];
}
