# import-sort

`import-sort` is a set of packages that allow you to sort your ES2015 (aka ES6)
imports. Both JavaScript and TypeScript files are supported.

# Sorting imports

There are multiple ways to actually sort your imports. Just pick the one that
suits you most.

## atom-import-sort

Sort your imports directly from within [Atom](https://atom.io/). Go to [package](https://atom.io/packages/atom-import-sort) or install it directly with `apm install atom-import-sort`. The plugin can sort imports in both JavaScript and TypeScript.

After you installed the package you can sort your imports using the <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>o</kbd> key binding or trigger it manually from the command palette with the `Import Sort: Sort` command.

The package also offers a "sort on save" option to automatically sort your imports whenever you save a JavaScript or TypeScript file. It's disabled by default.

## import-sort-cli

Sort your imports from the command line. Useful to sort all your files in bulk or from a script in your `package.json`.

Install it with `npm install --save-dev import-sort-cli import-sort-parser-babylon import-sort-style-eslint`.


```
Usage: import-sort [OPTION] [FILE]
       import-sort [OPTION] [DIRECTORY]

Options:
  --overwrite, -o  Sort files in-place                                 [boolean]
  --write, -w      Sort and write files to specified location           [string]
  --diff, -d       Print unified diffs of changes                      [boolean]
  --status, -s     Only set the exit code                              [boolean]
  --help, -h       Show help                                           [boolean]
```

## import-sort

Sort your imports via [Node.js](https://nodejs.org/). For more information take a look at the code of the `import-sort-cli` package.

To use it you probably want to install `import-sort`, `import-sort-config`, a parser (say `import-sort-babylon`) and a style (say `import-sort-style-eslint`).

The `import-sort` library is basically the heart that powers `import-sort-cli` and `atom-import-sort` and should be used if you want to integrate it with other environments.

# Dealing with comments

Prior versions of `import-sort` had problems with comments that were attached to imports. This is now mostly fixed and situations like the following should no longer cause problems.

```js
import foo from "bar" // This will move with the import
```

```js
// This will also move with the import
import foo from "bar"
```

```js
// This won't move with the import

// This will move with the import
import foo from "bar"
// This won't move with the import
```

In general, every comment that is directly above the import (no blank line between them) or is on the same line is considered part of it.

That means that things like `// eslint-disable line` and `// eslint-disable-next-line` are finally supported.

# Using a different style or parser

Styles (and parsers) can be configured on a per-project basis including support for different types of files (currently JavaScript and TypeScript).

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
```

The keys are a list of file extensions that map to the parser and style that should be used for files that have any of the listed file extensions.

By default, `import-sort` comes with two styles.

* `import-sort-style-eslint` (default): A style that sorts your imports such that they conform to [ESLint](http://eslint.org/) rule [sort-imports](http://eslint.org/docs/rules/sort-imports). See [example-babylon-eslint](https://github.com/renke/import-sort/tree/master/packages/example-babylon-eslint).

* `import-sort-style-renke`: My personal style. It's a bit more "complex" than the `eslint` style and is probably not for everybody (hence not being the default). See [example-babylon-renke](https://github.com/renke/import-sort/tree/master/packages/example-babylon-renke).

# Writing you own custom style

Since styles can now be configured using your `package.json` it's way easier to write and use your own style.

A style is module that should be called `import-sort-style-$name` where `$name` is the name of the style.

An API is provided to specify how the imports are sorted (see [style API](packages/import-sort-style/src/index.ts#L3) for more details).

The best way to write your own style is to look at existing styles like [`import-sort-style-renke`](packages/import-sort-style-renke/src/index.ts) and adapt it to your liking.

# Feedback

I appreciate any kind of feedback. Just create an issue or drop me a mail. Thanks!

# License

See [LICENSE](LICENSE).
