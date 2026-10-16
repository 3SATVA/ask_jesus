import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Environment } from "@apple/app-store-server-library";
import { environmentOfJws, normalizePem } from "./apple-iap";

function jws(payload: unknown) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `aaa.${body}.bbb`;
}

describe("Apple purchase config helpers", () => {
  it("reads the environment claim without trusting the signature", () => {
    assert.equal(environmentOfJws(jws({ environment: "Sandbox" })), Environment.SANDBOX);
    assert.equal(environmentOfJws(jws({ environment: "Production" })), Environment.PRODUCTION);
    assert.equal(environmentOfJws("not-a-jws"), null);
  });

  it("accepts a .p8 with escaped newlines", () => {
    const pem = normalizePem("-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----");
    assert.match(pem, /BEGIN PRIVATE KEY/);
    assert.match(pem, /\nABC\n/);
    assert.equal(normalizePem(""), "");
  });
});
