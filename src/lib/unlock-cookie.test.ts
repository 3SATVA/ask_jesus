import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readUnlock, sealUnlock } from "./unlock-cookie";

describe("unlock cookie", () => {
  const secret = "test-unlock-secret";
  const now = new Date("2026-10-16T18:00:00.000Z");

  it("round-trips a signature and rejects tampering, the wrong secret, and expiry", () => {
    const sealed = sealUnlock(
      {
        kind: "day",
        until: "2026-10-16T23:59:59.999Z",
        transactionId: "tip-1",
        productId: "com.starseedsquad.askjesus.tip.299",
      },
      secret,
    );
    assert.equal(readUnlock(sealed, secret, now)?.kind, "day");
    assert.equal(readUnlock(sealed, "other-secret", now), null);
    assert.equal(readUnlock(`${sealed}x`, secret, now), null);
    assert.equal(readUnlock(sealed, secret, new Date("2026-10-17T00:00:00.000Z")), null);
    assert.equal(readUnlock(undefined, secret, now), null);
  });
});
