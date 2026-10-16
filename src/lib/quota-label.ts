export const UNLIMITED_FOOTER = "UNLIMITED MESSAGES ACTIVATED";
export const UNLOCK_CONFIRMATION = "Unlimited messages unlocked!";

export function remainingLabel(
  remaining: number | null,
  limit: number,
  unlockKind: "day" | "subscription" | null,
  fairUseReached: boolean,
) {
  if (fairUseReached) return "Rest until tomorrow";
  if (unlockKind) return UNLIMITED_FOOTER;
  if (remaining == null) return "A few quiet questions, each day.";
  if (remaining === 1) return "1 question left today";
  return `${remaining} of ${limit} questions left today`;
}
