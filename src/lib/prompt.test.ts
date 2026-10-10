import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { crisisMessage } from "./crisis";
import { loadJesusPrompt } from "./prompt";

describe("JESUS_PROMPT.md", () => {
  const prompt = loadJesusPrompt();

  it("leaves the editor's note in the file and out of what Jesus is told", () => {
    const raw = readFileSync("JESUS_PROMPT.md", "utf8");
    assert.match(raw, /Editing this file changes Jesus's personality/);
    assert.doesNotMatch(prompt, /Editing this file/);
    assert.match(prompt, /^You are AI Jesus/);
  });

  it("answers as AI Jesus and stays in character", () => {
    assert.match(prompt, /You are AI Jesus/);
    assert.match(prompt, /say that you are AI Jesus/);
    assert.match(prompt, /Do not say "I am an AI and not Jesus\."/);
    assert.match(prompt, /Do not add disclaimers/);
    assert.doesNotMatch(prompt, /You are an AI interpretation, not Jesus/);
  });

  it("forbids hedging and keeps each reply very short", () => {
    assert.match(prompt, /Never hedge with "scripture says,"/);
    assert.match(prompt, /"Protestants believe,"/);
    assert.match(prompt, /"many Christians think,"/);
    assert.match(prompt, /usually one or two sentences/);
  });

  it("paces a back-and-forth instead of a speech", () => {
    assert.match(prompt, /a guide, not a script/);
    assert.match(prompt, /Do not force the steps/);
    assert.match(prompt, /one short, loving question/);
    assert.match(prompt, /words of love and healing/);
    assert.match(prompt, /Only once you understand the situation/);
    assert.match(prompt, /one Psalm or other Old Testament quotation/);
  });

  it("quotes the Hebrew scriptures, and not the later New Testament books", () => {
    assert.match(prompt, /quote the Hebrew scriptures, the way you do in the Gospels/);
    assert.match(prompt, /The Psalms especially, and also Isaiah, Deuteronomy, Proverbs/);
    assert.match(prompt, /Do not quote Acts, the New Testament letters, or Revelation/);
    assert.match(prompt, /They were written after you/);
    assert.match(prompt, /Come to me, all who are weary/);
    assert.doesNotMatch(prompt, /You may also draw on Acts/);
    assert.doesNotMatch(prompt, /John 14:27/);
  });

  it("keeps sparse scripture quotes in the gold-italic marker", () => {
    assert.match(prompt, /Most messages have no quotation/);
    assert.match(prompt, /must be from the Hebrew scriptures/);
    assert.match(prompt, /> Exact words you are sure of\. \(Book 1:1\)/);
    assert.match(prompt, /> The Lord is my shepherd; I shall not want\. \(Psalm 23:1\)/);
  });

  it("still points a person in danger to real help", () => {
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
