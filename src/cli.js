#!/usr/bin/env node

import "babel/polyfill";

import {readFileSync, writeFileSync} from "fs";

import importSort from "./index";

let source = process.argv[2];
let unsorted = "";

// Read code from file
if (source) {
  unsorted = readFileSync(source, {encoding: "utf8"});
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
    let sorted = importSort(unsorted)
    let target = process.argv[3];

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
