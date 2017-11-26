#!/usr/bin/env node

import * as mkdirp from "mkdirp";
import * as yargs from "yargs";

import {IResolvedConfig, getConfig} from "import-sort-config";
import {basename, dirname, extname, join} from "path";
import {lstatSync, readFileSync, realpathSync, writeFileSync} from "fs";
import sortImports, {ISortResult} from "import-sort";

import {createPatch} from "diff";
import {walkSync} from "file";

yargs
  .check(argv => {
    if (argv._.length === 0) {
      throw new Error("No file or directory was specified");
    }

    if (argv._.length > 1) {
      throw new Error("Only one file or directory can be specified");
    }

    return true;
  })
  // Write and overwrite cannot be combined
  .check(argv => {
    if (argv.write && argv.overwrite) {
      throw new Error("The write and overwrite option cannot be combined");
    }

    return true;
  })
  .usage(
`
Usage: import-sort [OPTION] [FILE]
       import-sort [OPTION] [DIRECTORY]
       
The exit code is the number of affected files or -1 if something failed.          
`.trim())

  .describe("overwrite", "Sort files in-place")
  .boolean("overwrite")
  .alias("overwrite", "o")

  .describe("write", "Sort and write files to specified location")
  .string("write")
  .requiresArg("write")
  .alias("write", "w")

  .describe("diff", "Print unified diffs of changes")
  .boolean("diff")
  .alias("diff", "d")

  .describe("status", "Only set the exit code")
  .boolean("status")
  .alias("status", "s")

  .help()
  .alias("help", "h");

const argv = yargs.argv;

const fileOrDirectory: string = argv._[0];
let file: string | undefined;
let directory: string | undefined;

try {
  const rawFileOrDirectory = realpathSync(fileOrDirectory);
  const stats = lstatSync(rawFileOrDirectory);

  if (stats.isFile()) {
    file = rawFileOrDirectory;
  } else if (stats.isDirectory()) {
    directory = rawFileOrDirectory;
  } else {
    bail(`'${rawFileOrDirectory}' is not a file or directory`);
  }

} catch (e) {
  console.error(`Failed to read file or directory '${fileOrDirectory}'`);
  process.exit(-1);
}

if (file) {
  const config = getAndCheckConfig(extname(file), dirname(file));

  const unsortedCode = readFileSync(file).toString("utf8");

  let sortResult: ISortResult | undefined;

  try {
    const {parser, style, config: rawConfig} = config;
    sortResult = sortImports(unsortedCode, parser!, style!, file, rawConfig.options);
  } catch (e) {
    bail(`Failed to parse '${fileOrDirectory}'`);
  }

  const {code: sortedCode, changes} = sortResult!;

  if (changes.length === 0) {
    process.exit(0);
  }

  if (argv.overwrite) {
    writeFileSync(file, sortedCode, {encoding: "utf-8"});
    process.exit(1);
  }

  if (argv.write) {
    writeFileSync(argv.write, sortedCode, {encoding: "utf-8"});
    process.exit(1);
  }

  if (argv.diff) {
    process.stdout.write(createPatch(file, unsortedCode, sortedCode, "", ""));
    process.exit(1);
  }

  if (argv.status) {
    process.exit(changes.length > 0 ? 1 : 0);
  }

  // Default case for a file is printing the changed code to stdout
  process.stdout.write(sortedCode);
  process.exit(1);
}

if (directory) {
  const unsortedFiles: Array<string> = [];

  walkSync(directory, (baseDirectory, directories, fileNames) => {
    fileNames.forEach(fileName => {
      const config = getConfig(extname(fileName), baseDirectory);

      if (!config || !config!.parser || !config!.style) {
        return;
      }

      const file = join(baseDirectory, fileName);

      const unsortedCode = readFileSync(file).toString("utf8");

      let sortResult: ISortResult | undefined;

      try {
        const {parser, style, config: rawConfig} = config;
        sortResult = sortImports(unsortedCode, parser!, style!, file, rawConfig.options);
      } catch (e) {
        return;
      }

      const {code: sortedCode, changes} = sortResult!;

      if (argv.write) {
        const targetDirectory = join(argv.write, realpathSync(baseDirectory).replace(directory!, "").replace("/", ""));
        const targetFile = join(targetDirectory, basename(file));

        mkdirp.sync(targetDirectory);
        writeFileSync(targetFile, sortedCode, {encoding: "utf-8"});
      }

      if (changes.length === 0) {
        return;
      }

      unsortedFiles.push(file);

      if (argv.overwrite) {
        writeFileSync(file, sortedCode, {encoding: "utf-8"});
        return;
      }

      if (argv.diff) {
        process.stdout.write(createPatch(file, unsortedCode, sortedCode, "", ""));
        return;
      }
    });
  });

  // Unless the status option is used, the list of unsorted files is printed
  if (!argv.status) {
    unsortedFiles.forEach(file => {
      console.log(file);
    });
  }

  process.exit(unsortedFiles.length);
}

function getAndCheckConfig(extension: string, fileDirectory: string): IResolvedConfig {
  const resolvedConfig = getConfig(extension, fileDirectory);

  bailIf(!resolvedConfig, `No configuration found for file type ${extension}`);

  const rawParser = resolvedConfig!.config.parser;
  const rawStyle = resolvedConfig!.config.style;

  bailIf(!rawParser, `No parser defined for file type ${extension}`);
  bailIf(!rawStyle, `No style defined for file type ${extension}`);

  const parser = resolvedConfig!.parser;
  const style = resolvedConfig!.style;

  bailIf(!parser, `Parser "${rawParser}" could not be resolved`);
  bailIf(!style, `Style "${rawStyle}" could not be resolved`);

  return resolvedConfig!;
}

function bail(message: string)  {
  console.error(message);
  process.exit(-1);
}

function bailIf(condition: boolean, message: string) {
  if (condition) {
    bail(message);
  }
}
