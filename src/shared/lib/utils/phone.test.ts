import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatPhoneNumber } from "./phone";

describe("formatPhoneNumber", () => {
  test("formats 11-digit mobile numbers", () => {
    assert.equal(formatPhoneNumber("01012345678"), "010-1234-5678");
  });

  test("formats 10-digit regional numbers", () => {
    assert.equal(formatPhoneNumber("0311234567"), "031-123-4567");
  });

  test("formats 02 area code numbers", () => {
    assert.equal(formatPhoneNumber("0212345678"), "02-1234-5678");
  });

  test("returns empty string for empty input", () => {
    assert.equal(formatPhoneNumber(""), "");
  });

  test("returns original value when digits are not a supported phone shape", () => {
    assert.equal(formatPhoneNumber("invalid"), "invalid");
  });
});
