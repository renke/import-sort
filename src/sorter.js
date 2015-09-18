import {identifierOf} from "./matcher";

export function byIdentifier(imported, otherImported) {
  return identifierOf(imported).localeCompare(identifierOf(otherImported));
}
