import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UNLIMITED_FOOTER, remainingLabel } from "./quota-label";

describe("remainingLabel", () => {
  it("shows the free count until a purchase unlocks messages", () => {
    assert.equal(remainingLabel(7, 10, null, false), "7 of 10 questions left today");
    assert.equal(remainingLabel(1, 10, null, false), "1 question left today");
    assert.equal(remainingLabel(7, 10, "day", false), UNLIMITED_FOOTER);
    assert.equal(remainingLabel(0, 10, "subscription", false), UNLIMITED_FOOTER);
    assert.equal(remainingLabel(0, 10, "day", true), "Rest until tomorrow");
  });
});