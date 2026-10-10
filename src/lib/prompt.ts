import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROMPT_PATH = join(process.cwd(), "JESUS_PROMPT.md");

/** Personality text from JESUS_PROMPT.md, without the editor's note at the top. */
export function loadJesusPrompt() {
  const raw = readFileSync(PROMPT_PATH, "utf8");
  return raw.replace(/^\uFEFF?\s*<!--[\s\S]*?-->\s*/, "").trim();
}
