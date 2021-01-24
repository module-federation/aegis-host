"use strict";

export default function makeObject(prop) {
  if (Array.isArray(prop)) {
    return prop.reduce((p, c) => ({ ...c, ...p }));
  }
  return prop;
}
