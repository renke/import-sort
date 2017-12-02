# import-sort

`import-sort` is a set of packages that allow you to sort your ES2015 (aka ES6)
imports. Both JavaScript and TypeScript files are supported.

# Sorting imports

There are multiple ways to actually sort your imports. Just pick the one that
suits you most.

* Visual Studio Code
* Atom
* Vim
* Command Line

## Visual Studio Code (vsc-sort-imports)

Sort your imports directy from within
[Visual Studio Code](https://code.visualstudio.com/).

See
[sort-imports](https://marketplace.visualstudio.com/items?itemName=amatiasq.sort-imports)
in the Visual Studio Marketplace for more details.

This extension was originally developed by
[Peter Juras](https://github.com/peterjuras) and is currently maintained by
[A. Matías Quezada](https://github.com/amatiasq). Thank you very much!

## Atom (atom-import-sort)

Sort your imports directly from within [Atom](https://atom.io/). Go to
[package](https://atom.io/packages/atom-import-sort) or install it directly with
`apm install atom-import-sort`. The plugin can sort imports in both JavaScript
and TypeScript.

After you installed the package you can sort your imports using the
<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>o</kbd> key binding or trigger it
manually from the command palette with the `Import Sort: Sort` command.

The package also offers a "sort on save" option to automatically sort your
imports whenever you save a JavaScript or TypeScript file. It's disabled by
default.

## Vim (vim-sort-imports)

Sort your imports directy from within Vim. See
[vim-sort-imports](https://github.com/ruanyl/vim-sort-imports) for more details
about the configuration.

## Command Line (import-sort-cli)

Sort your imports from the command line. Useful to sort all your files in bulk
or from a script in your `package.json`.

Install it with `npm install --save-dev import-sort-cli
import-sort-parser-babylon import-sort-style-eslint`.

_ATTENTION_: Since version 4 `--write` modifies file in-place. The old
`--overwrite` flag was removed. The CLI now behaves closer to
[prettier's](https://github.com/prettier/prettier) CLI. Also, the exit code is
now 0 even when unsorted were sorted (unless `--list-different` is used.)

```
Usage: import-sort [OPTION]... [FILE/GLOB]...

Options:
  --list-different, -l  Print the names of files that are not sorted.  [boolean]
  --write               Edit files in-place.                           [boolean]
  --with-node-modules   Process files inside 'node_modules' directory..[boolean]
  --version, -v         Show version number                            [boolean]
  --help, -h            Show help                                      [boolean]
```

## Node.js (import-sort)

Sort your imports via [Node.js](https://nodejs.org/). For more information take
a look at the code of the `import-sort-cli` package.

To use it you probably want to install `import-sort`, `import-sort-config`, a
parser (say `import-sort-parser-babylon`) and a style (say
`import-sort-style-eslint`).

The `import-sort` library is basically the heart that powers `import-sort-cli`
and `atom-import-sort` and should be used if you want to integrate it with other
environments.

# Dealing with comments

Prior versions of `import-sort` had problems with comments that were attached to
imports. This is now mostly fixed and situations like the following should no
longer cause problems.

```js
import foo from "bar"; // This will move with the import
```

```js
// This will also move with the import
import foo from "bar";
```

```js
// This won't move with the import

// This will move with the import
import foo from "bar";
// This won't move with the import
```

In general, every comment that is directly above the import (no blank line
between them) or is on the same line is considered part of it.

That means that things like `// eslint-disable line` and `//
eslint-disable-next-line` are finally supported.

For copyright headers and compiler pragmas (like `@flow`) a blank line should be
added after the comment.

```js
// @flow

import foo from "bar";
```

# Using a different style or parser

Styles (and parsers) can be configured on a per-project basis including support
for different types of files (currently JavaScript and TypeScript).

Just add the following to your `package.json` and adapt it to your liking:

```json
"importSort": {
  ".js, .jsx, .es6, .es": {
    "parser": "babylon",
    "style": "eslint"
  },
  ".ts, .tsx": {
    "parser": "typescript",
    "style": "eslint"
  }
}
```

The keys are a list of file extensions that map to the parser and style that
should be used for files that have any of the listed file extensions.

Instead of putting your configuration into your `package.json` you can also use
a `.importsortrc` file written in JSON. For more details see
[cosmiconfig](https://github.com/davidtheclark/cosmiconfig) which is used
internally by `import-sort`.

By default, `import-sort` comes with these styles:

* [`import-sort-style-eslint` (default)](packages/import-sort-style-eslint): A
  style that that is compatible with [ESLint's](http://eslint.org/)
  [sort-imports](http://eslint.org/docs/rules/sort-imports) rule.

* [`import-sort-style-module`](packages/import-sort-style-module): A style that
  groups and sorts by module.

* [`import-sort-style-renke`](packages/import-sort-style-renke): Renke's
  personal style.

# Writing you own custom style

Since styles can now be configured using your `package.json` it's way easier to
write and use your own style.

A style is module that should be called `import-sort-style-$name` where `$name`
is the name of the style.

An API is provided to specify how the imports are sorted (see
[style API](packages/import-sort-style/src/index.ts#L3) for more details).

The best way to write your own style is to look at existing styles like
[`import-sort-style-renke`](packages/import-sort-style-renke/src/index.ts) and
adapt it to your liking.

# Feedback

I appreciate any kind of feedback. Just create an issue or drop me a mail.
Thanks!

# License

See [LICENSE](LICENSE).
