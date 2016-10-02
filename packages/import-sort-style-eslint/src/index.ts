import {IStyleAPI, IStyleItem} from "import-sort-style";

export default function(styleApi: IStyleAPI): Array<IStyleItem> {
  const {
    member,
    alias,

    hasNoMember,
    hasOnlyNamespaceMember,
    hasMultipleMembers,
    hasSingleMember,

    unicode,
  } = styleApi;

  return [
    // none (don't sort them, because side-effects may need a particular ordering)
    {match: hasNoMember},
    {separator: true},

    // all
    {match: hasOnlyNamespaceMember, sort: member(unicode)},
    {separator: true},

    // multiple
    {match: hasMultipleMembers, sort: member(unicode), sortNamedMembers: alias(unicode)},
    {separator: true},

    // single
    {match: hasSingleMember, sort: member(unicode)},
  ];
}
