import {
  and,
  not,

  hasNamedImports,
  hasDefaultImport,

  isNodeModule,
  isRelativeModule,

  startsWithAlphanumeric,
  startsWithLowerCase,
  startsWithUpperCase,
} from "../matcher"

import {
  byIdentifier,
} from "../sorter"

export default [
  {match: and(not(hasNamedImports), not(hasDefaultImport), isNodeModule, not(startsWithAlphanumeric)), sort: byIdentifier},
  {match: and(not(hasNamedImports), not(hasDefaultImport), isNodeModule, startsWithLowerCase), sort: byIdentifier},
  {match: and(not(hasNamedImports), not(hasDefaultImport), isNodeModule, startsWithUpperCase), sort: byIdentifier},

  {match: () => false, separator: "\n"},

  {match: and(not(hasNamedImports), not(hasDefaultImport), isRelativeModule, not(startsWithAlphanumeric)), sort: byIdentifier},
  {match: and(not(hasNamedImports), not(hasDefaultImport), isRelativeModule, startsWithLowerCase), sort: byIdentifier},
  {match: and(not(hasNamedImports), not(hasDefaultImport), isRelativeModule, startsWithUpperCase), sort: byIdentifier},

  {match: () => false, separator: "\n"},

  {match: and(hasDefaultImport, not(hasNamedImports), isNodeModule, not(startsWithAlphanumeric)), sort: byIdentifier},
  {match: and(hasDefaultImport, not(hasNamedImports), isNodeModule, startsWithLowerCase), sort: byIdentifier},
  {match: and(hasDefaultImport, not(hasNamedImports), isNodeModule, startsWithUpperCase), sort: byIdentifier},

  {match: and(hasDefaultImport, hasNamedImports, isNodeModule, not(startsWithAlphanumeric)), sort: byIdentifier},
  {match: and(hasDefaultImport, hasNamedImports, isNodeModule, startsWithLowerCase), sort: byIdentifier},
  {match: and(hasDefaultImport, hasNamedImports, isNodeModule, startsWithUpperCase), sort: byIdentifier},

  {match: and(not(hasDefaultImport), hasNamedImports, isNodeModule, not(startsWithAlphanumeric)), sort: byIdentifier},
  {match: and(not(hasDefaultImport), hasNamedImports, isNodeModule, startsWithLowerCase), sort: byIdentifier},
  {match: and(not(hasDefaultImport), hasNamedImports, isNodeModule, startsWithUpperCase), sort: byIdentifier},

  {match: () => false, separator: "\n"},

  {match: and(hasDefaultImport, not(hasNamedImports), isRelativeModule, not(startsWithAlphanumeric)), sort: byIdentifier},
  {match: and(hasDefaultImport, not(hasNamedImports), isRelativeModule, startsWithLowerCase), sort: byIdentifier},
  {match: and(hasDefaultImport, not(hasNamedImports), isRelativeModule, startsWithUpperCase), sort: byIdentifier},

  {match: and(hasDefaultImport, hasNamedImports, isRelativeModule, not(startsWithAlphanumeric)), sort: byIdentifier},
  {match: and(hasDefaultImport, hasNamedImports, isRelativeModule, startsWithLowerCase), sort: byIdentifier},
  {match: and(hasDefaultImport, hasNamedImports, isRelativeModule, startsWithUpperCase), sort: byIdentifier},

  {match: and(not(hasDefaultImport), hasNamedImports, isRelativeModule, not(startsWithAlphanumeric)), sort: byIdentifier},
  {match: and(not(hasDefaultImport), hasNamedImports, isRelativeModule, startsWithLowerCase), sort: byIdentifier},
  {match: and(not(hasDefaultImport), hasNamedImports, isRelativeModule, startsWithUpperCase), sort: byIdentifier},

  {match: () => false, separator: "\n"},

  {match: () => true, sort: byIdentifier},
]
