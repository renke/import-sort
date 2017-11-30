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

  .help()
  .alias("help", "h");

const argv = yargs.argv;

const paths = argv._;

// We do things differently when only one file or directory is specified
const onlyOnePath = paths.length === 1;

for (const path of paths) {
  try {
    const realPath = realpathSync(path);
    const pathStats = lstatSync(realPath);

    if (pathStats.isFile()) {
      try {
        sortFile(realPath, onlyOnePath)
      } catch (e) {
        bailIf(onlyOnePath, e.message);
      }
    } else if (pathStats.isDirectory()) {
      sortDirectory(realPath);
    } else {
      bailIf(onlyOnePath, `'${realPath}' is not a file or directory`);
    }
  } catch (e) {
    bailIf(onlyOnePath, `Failed to read file or directory '${path}'`);
  }
}

function sortFile(file: string, printSortedCode: boolean) {
  const config = getAndCheckConfig(extname(file), dirname(file));

  const unsortedCode = readFileSync(file).toString("utf8");

  let sortResult: ISortResult | undefined;

  try {
    const {parser, style, config: rawConfig} = config;
    sortResult = sortImports(unsortedCode, parser!, style!, file, rawConfig.options);
  } catch (e) {
    throw new Error(`Failed to parse '${file}'`);
  }

  const {code: sortedCode, changes} = sortResult!;

  if (changes.length === 0) {
    return false;
  }

  if (argv.overwrite) {
    writeFileSync(file, sortedCode, {encoding: "utf-8"});
    return true;
  }

  if (argv.write) {
    writeFileSync(argv.write, sortedCode, {encoding: "utf-8"});
    return true;
  }

  if (argv.diff) {
    process.stdout.write(createPatch(file, unsortedCode, sortedCode, "", ""));
    return true;
  }

  if (printSortedCode) {
    process.stdout.write(sortedCode);
    return true;
  }

  // Print file name to stdout
  console.log(file);

  return true;
}

function sortDirectory(directory: string) {
  walkSync(directory, (baseDirectory, directories, fileNames) => {
    fileNames.forEach(fileName => {
      let config: IResolvedConfig;

      try {
        config = getAndCheckConfig(extname(fileName), baseDirectory);
      } catch (e) {
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

      if (argv.overwrite) {
        writeFileSync(file, sortedCode, {encoding: "utf-8"});
        return;
      }

      if (argv.diff) {
        process.stdout.write(createPatch(file, unsortedCode, sortedCode, "", ""));
        return;
      }

      // Print file name to stdout
      console.log(file);
    });
  });
}

function getAndCheckConfig(extension: string, fileDirectory: string): IResolvedConfig {
  const resolvedConfig = getConfig(extension, fileDirectory);

  throwIf(!resolvedConfig, `No configuration found for file type ${extension}`);

  const rawParser = resolvedConfig!.config.parser;
  const rawStyle = resolvedConfig!.config.style;

  throwIf(!rawParser, `No parser defined for file type ${extension}`);
  throwIf(!rawStyle, `No style defined for file type ${extension}`);

  const parser = resolvedConfig!.parser;
  const style = resolvedConfig!.style;

  throwIf(!parser, `Parser "${rawParser}" could not be resolved`);
  throwIf(!style, `Style "${rawStyle}" could not be resolved`);

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

function throwIf(condition: boolean, message: string) {
  if (condition) {
    throw new Error(message);
  }
}
