import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROMPT_PATH = join(process.cwd(), "JESUS_PROMPT.md");

/** Personality text from JESUS_PROMPT.md, without the editor's note at the top. */
export function loadJesusPrompt() {
  const raw = readFileSync(PROMPT_PATH, "utf8");
  return raw.replace(/^\uFEFF?\s*<!--[\s\S]*?-->\s*/, "").trim();
}

/**
 * Messages still available today, including the one being answered.
 * 1 means this is their last free message.
 */
export function questionsLeftNote(remaining: number) {
  const left = Math.max(0, Math.trunc(remaining));
  if (left <= 1) {
    return "The person has 1 message left today. This is their last message today.";
  }
  return `The person has ${left} messages left today, including this one.`;
}

/** Personality plus the server note about how many messages remain today. */
export function instructionsForTurn(remaining: number) {
  return `${loadJesusPrompt()}\n\n${questionsLeftNote(remaining)}`;
}
