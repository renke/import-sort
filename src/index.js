import {parse, traverse, transform} from "babel";
import defaultStyle from "./styles/default";

export default function importSort(unsorted, style=defaultStyle) {
  const parsed = { type: "File", program: parse(unsorted) };

  // Find all imports
  let imports = []

  traverse(parsed, {
    ImportDeclaration(node, parent) {
      imports.push({node, text: unsorted.substring(node.start, node.end)});
    }
  });

  // Remove all imports
  let outer = unsorted;

  imports.slice().reverse().forEach(imported => {
    let importEnd = imported.node.end;

    if (outer.charAt(imported.node.end).match(/\s/)) {
      importEnd++;
    }

    outer = outer.slice(0, imported.node.start)
          + outer.slice(importEnd, outer.length);
  })

  let start = 0;

  if (imports.length) {
    start = imports[0].node.start;
  }

  const buckets = [];

  // Prepare buckets
  for (let i = 0; i < style.length; i++) {
    buckets[i] = [];
  }

  // Put imports into each bucket
  imports.forEach(imported => {
    for (let i = 0; i < style.length; i++) {
      if (style[i].match(imported)) {
        buckets[i].push(imported);
        break;
      }
    }
  })

  // Sort imports in each bucket
  for (let i = 0; i < buckets.length; i++) {
    buckets[i].sort(style[i].sort);
  }

  // Add sorted imports
  let inner = "";

  let separator = null;

  for (let i = 0; i < buckets.length; i++) {
    let bucket = buckets[i];

    if (bucket.length) {
      if (separator) {
        inner += "\n";
        separator = null;
      }

      inner += bucket.map(imported => imported.text).join("\n")

      // Make sure the following bucket is on its own line
      inner +="\n";
    }

    // Note that we need to add a newline as separator
    separator = (separator || style[i].separator) && inner;
  }

  // Split code at insert point
  let before = outer.substring(0, start);
  let after = outer.substring(start, outer.length);

  // Collapse all whitespace into a single blank line
  before = before.replace(/\s+$/g, "\n\n")

  // Collapse all whitespace into a single new line
  after = after.replace(/^\s+/g, "\n")

  // Remove all whitespace at the beginning of the code
  if (before.match(/^\s+$/)) {
    before = "";
  }

  // Remove all whitespace at the end of the code
  if (after.match(/^\s+$/)) {
    after = "";
  }

  return before + inner + after
}
