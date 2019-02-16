// WIP

// // import "mocha";
// // import {assert} from "chai";

// import {CLIEngine, Linter} from "eslint";
// import {sortImports} from "import-sort";
// import * as parser from "import-sort-parser-babylon";

// import style from "../../src";

// const eslintCLI = new CLIEngine({});

// const eslintConfig = eslintCLI.getConfigForFile(`${__dirname}/.eslintrc`);

// const linter = new Linter();

// const code = `
// import def from "m";
// import x, {a} from "m";
// import y, * as b from "m";
// import * as all from "m";
// import {named} from "m";
// `.trim();

// const {code: actual, changes} = sortImports(
//   code,
//   parser,
//   style,
//   `${__dirname}/index.ts`,
// );

// console.log(actual);

// const errors = linter.verify(actual, eslintConfig);

// console.log(errors);
