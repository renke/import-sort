import {IStyleAPI, IStyleItem} from "import-sort-style";
import {CLIEngine} from "eslint";
import {resolve} from "path";
import * as _ from "lodash";

export default function(styleApi: IStyleAPI, file?: string): Array<IStyleItem> {
  const {
    member,
    alias,

    hasNoMember,
    hasOnlyNamespaceMember,
    hasMultipleMembers,
    hasSingleMember,

    unicode,
  } = styleApi;

  let useLowerCase = false;

  if (file) {
    try {
      const eslintCLI = new CLIEngine({});
      const eslintConfig = eslintCLI.getConfigForFile(resolve(file));

      useLowerCase = _.get(eslintConfig, "rules.sort-imports[1].ignoreCase", false);
    } catch (e) {
      // Just use defaults in this case
    }
  }

  const eslintSort = (first, second) => {
    if (useLowerCase) {
      return unicode(first.toLowerCase(), second.toLowerCase())
    } else {
      return unicode(first, second);
    }
  };

  return [
    // none (don't sort them, because side-effects may need a particular ordering)
    {match: hasNoMember},
    {separator: true},

    // all
    {match: hasOnlyNamespaceMember, sort: member(eslintSort)},
    {separator: true},

    // multiple
    {match: hasMultipleMembers, sort: member(eslintSort), sortNamedMembers: alias(eslintSort)},
    {separator: true},

    // single
    {match: hasSingleMember, sort: member(eslintSort)},
  ];
}
