import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeConversation } from "./conversation";

describe("normalizeConversation", () => {
  it("keeps earlier turns as context and counts only the latest question", () => {
    const parsed = normalizeConversation({
      messages: [
        { role: "user", content: "My name is Mara." },
        { role: "assistant", content: "Mara, I am glad you are here." },
        { role: "user", content: "I am afraid of tomorrow." },
      ],
    });
    assert.deepEqual(parsed, {
      question: "I am afraid of tomorrow.",
      history: [
        { role: "user", content: "My name is Mara." },
        { role: "assistant", content: "Mara, I am glad you are here." },
      ],
    });
  });

  it("still accepts a single question with no history", () => {
    assert.deepEqual(normalizeConversation({ question: "How do I forgive?" }), {
      question: "How do I forgive?",
      history: [],
    });
  });

  it("rejects a thread that does not end with a person speaking", () => {
    assert.equal(
      normalizeConversation({
        messages: [{ role: "assistant", content: "Peace to you." }],
      }),
      null,
    );
    assert.equal(normalizeConversation({ question: " " }), null);
  });
});
