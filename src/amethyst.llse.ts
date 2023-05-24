// LiteLoader-AIDS automatic generated
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="c:\Users\MnyaCat\Documents\LLSE/dts/HelperLib-master/src/index.d.ts"/>

import { registerSudoCommand } from "amethyst-plugin/sudo.llse";
import { registerProtectedBed } from "amethyst-plugin/bed_protection.llse";
import { registerCoordinatesNote } from "amethyst-plugin/coordinates_note.llse";

registerProtectedBed();

mc.listen("onServerStarted", () => {
  registerSudoCommand();
  registerCoordinatesNote();
});

ll.registerPlugin(
  /* name */ "Amethyst-Plugin",
  /* introduction */ "",
  /* version */ [0, 1, 0],
  /* otherInformation */ {}
);
