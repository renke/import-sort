export function not(matcher) {
  return imported => {
    return !matcher(imported);
  }
}

export function and(...matchers) {
  return imported => {
    return matchers.every(matcher => matcher(imported));
  }
}
export function or(...matchers) {
  return imported => {
    return matchers.any(matcher => matcher(imported));
  }
}

export function hasDefaultImport({node, text}) {
  return node.specifiers.length && node.specifiers[0].type === "ImportDefaultSpecifier";
}

export function hasNamedImports({node, text}) {
  if (node.specifiers.length === 1) {
    return node.specifiers[0].type === "ImportSpecifier";
  } else {
    return node.specifiers.length > 1;
  }
}

export function isNodeModule(imported) {
  return !isRelativeModule(imported);
}

export function isRelativeModule({node, text}) {
  return node.source.value.startsWith(".");
}

export function startsWithUpperCase({node, text}) {
  let start = identifierOf({node, text}).charAt(0);
  return start === start.toUpperCase();
}

export function startsWithLowerCase({node, text}) {
  let start = identifierOf({node, text}).charAt(0);
  return start === start.toLowerCase();
}

export function startsWithAlphanumeric({node, text}) {
  return identifierOf({node, text}).match(/^[A-Za-z0-9]/);
}

export function identifierOf({node, text}) {
  if (hasDefaultImport({node, text})) {
    return node.specifiers[0].local.name;
  }

  if (hasNamedImports({node, text})) {
    let local = node.specifiers[0].local
  }

  return node.source.value;
}
