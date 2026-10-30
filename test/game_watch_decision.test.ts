import assert from "node:assert/strict";
import { decidePageChange } from "../src/game_watch_decision.ts";

assert.deepEqual(decidePageChange("same", "same"), { changed: false, diff: "" });
assert.equal(decidePageChange("old player asset", "new player asset").changed, true);
console.log("game watch decision test passed");
