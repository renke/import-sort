#!/usr/bin/env node

import "babel/polyfill";
import { argv } from 'yargs';
import { readFileSync, writeFileSync } from "fs";

import importSort from "./index";

const source = argv._[0];
const target = argv._[1];
const stylePath = argv.s || argv.style;

let style = stylePath && require(stylePath);

let unsorted = "";

// Read code from file
if (source) {
  unsorted = readFileSync(source, { encoding: "utf8" });
  write();

// Read code from stdin
} else {
  process.stdin.resume();

  process.stdin.on('data', buf => {
    unsorted += buf.toString("utf8");
  });

  process.stdin.on('end', function() {
    write();
  });
}

function write() {
  try {
    let sorted = importSort(unsorted, style)

    // Write to file
    if (target) {
      writeFileSync(target, sorted);

    // Write to stdout
    } else {
      process.stdout.write(sorted);
    }
  } catch (err) {
    console.error("Invalid syntax. Code was not changed.", err.stack);
    process.stdout.write(unsorted)
  }
}
