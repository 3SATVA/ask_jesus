import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decideAsk } from "./ask";
import { detectCrisis } from "./crisis";
import { parseQuota } from "./quota";

describe("parseQuota", () => {
  it("ignores another day and malformed cookies", () => {
    assert.equal(parseQuota(undefined, "2026-10-10"), 0);
    assert.equal(parseQuota("2026-10-09:4", "2026-10-10"), 0);
    assert.equal(parseQuota("2026-10-10:nope", "2026-10-10"), 0);
    assert.equal(parseQuota("2026-10-10:3", "2026-10-10"), 3);
  });
});

describe("detectCrisis", () => {
  it("catches first-person danger and lets Gospel questions through", () => {
    assert.equal(detectCrisis("I want to die"), "self-harm");
    assert.equal(detectCrisis("What did Jesus say about suicide?"), null);
    assert.equal(detectCrisis("He hits me and I am scared"), "abuse");
    assert.equal(detectCrisis("What did Jesus teach about abuse?"), null);
    assert.equal(detectCrisis("I can't breathe"), "medical");
  });
});

describe("decideAsk", () => {
  const base = { used: 0, limit: 5, hasKey: true };

  it("helps a person in crisis before the daily limit or the API key", () => {
    assert.deepEqual(
      decideAsk({ ...base, question: "I want to kill myself", used: 5, hasKey: false }),
      { type: "crisis", kind: "self-harm" },
    );
  });

  it("stops at the daily limit, then reports a missing key", () => {
    assert.deepEqual(
      decideAsk({ ...base, question: "How do I forgive?", used: 5 }),
      { type: "limit" },
    );
    assert.deepEqual(
      decideAsk({ ...base, question: "How do I forgive?", hasKey: false }),
      { type: "missing_key" },
    );
    assert.deepEqual(decideAsk({ ...base, question: "How do I forgive?" }), {
      type: "answer",
    });
  });
});
