# import-sort-style-eslint

A style for [import-sort](https://github.com/renke/import-sort) that conforms to
 the [ESLint](http://eslint.org/) rule
 [sort-imports](http://eslint.org/docs/rules/sort-imports).

```js
// Modules with side effects (not sorted because order may matter)
import "a";
import "c";
import "b";

// Modules with only namespace member sorted by member
import * as aa from "aa";
import * as bb from "bb";

// Modules with multiple members sorted by first member
import aaa, {bbb} from "aaa";
import {ccc, ddd} from "ccc";
import eee, * as fff from "eee";

// Modules with single member sorted by member
import aaaa from "aaaa";
import {bbbb} from "bbbb";

```
