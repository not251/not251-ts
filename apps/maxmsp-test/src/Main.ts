import * as not251 from "@not251/not251";

inlets = 1;
outlets = 1;
autowatch = 1;

function bang() {
  let scale = not251.scale();
  post(scale.data + "\n");
}

bang();

// .ts files with this at the end become a script usable in a [js] or [jsui] object
// If you are going to require your module instead of import it then you should comment
// these two lines out of this script
let module = {};
export = {};
