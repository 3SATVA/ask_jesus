import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { crisisMessage } from "./crisis";
import { JESUS_SYSTEM_PROMPT } from "./prompt";

describe("JESUS_SYSTEM_PROMPT", () => {
  it("answers as AI Jesus and stays in character", () => {
    const prompt = JESUS_SYSTEM_PROMPT;
    assert.match(prompt, /You are AI Jesus/);
    assert.match(prompt, /say that you are AI Jesus/);
    assert.match(prompt, /Do not say "I am an AI and not Jesus\."/);
    assert.match(prompt, /Do not add disclaimers/);
    assert.doesNotMatch(prompt, /You are an AI interpretation, not Jesus/);
  });

  it("forbids hedging and keeps replies short, with a question", () => {
    const prompt = JESUS_SYSTEM_PROMPT;
    assert.match(prompt, /Never hedge with "scripture says,"/);
    assert.match(prompt, /"Protestants believe,"/);
    assert.match(prompt, /"many Christians think,"/);
    assert.match(prompt, /Usually one or two sentences/);
    assert.match(prompt, /End with one caring question/);
  });

  it("keeps sparse scripture quotes in the gold-italic marker", () => {
    const prompt = JESUS_SYSTEM_PROMPT;
    assert.match(prompt, /Most messages have no quotation/);
    assert.match(prompt, /> Exact words you are sure of\. \(Book 1:1\)/);
    assert.match(prompt, /> Peace I leave with you; my peace I give to you\. \(John 14:27\)/);
  });

  it("still points a person in danger to real help", () => {
    const prompt = JESUS_SYSTEM_PROMPT;
    assert.match(prompt, /stay loving and stay in this voice/);
    assert.match(prompt, /call or text 988/);
    assert.match(prompt, /988lifeline\.org/);
    assert.match(prompt, /1-800-799-7233/);
    assert.match(prompt, /call 911/);
  });
});

describe("crisisMessage", () => {
  it("stays in a loving first person and names 988, the hotline, and 911", () => {
    const harm = crisisMessage("self-harm");
    assert.match(harm, /I want you alive/);
    assert.match(harm, /call or text 988/);
    assert.match(harm, /988lifeline\.org/);
    assert.match(harm, /iasp\.info\/suicidalthoughts/);
    assert.doesNotMatch(harm, /I am an AI|not Jesus|I hear you/i);

    const abuse = crisisMessage("abuse");
    assert.match(abuse, /I am with you/);
    assert.match(abuse, /1-800-799-7233/);
    assert.match(abuse, /thehotline\.org/);
    assert.match(abuse, /1-800-422-4453/);
    assert.doesNotMatch(abuse, /I am an AI|not Jesus/i);

    const medical = crisisMessage("medical");
    assert.match(medical, /Call 911/);
    assert.match(medical, /I will not guess/);
    assert.doesNotMatch(medical, /I cannot diagnose|I am an AI|not Jesus/i);
  });
});
