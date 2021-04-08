"use strict";

import makeArray from "../lib/make-array";

export default function checkAcl(requirement, allow, deny = []) {
  console.log({ func: checkAcl.name, requirement, allow });

  return (
    makeArray(requirement).some((r) => makeArray(allow).includes(r)) &&
    makeArray(requirement).every((r) => !makeArray(deny).includes(r))
  );
}
