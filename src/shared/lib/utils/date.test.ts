import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  formatDateDotYMD,
  formatDateLongKorean,
  formatDateMD,
  formatLocaleDateKorean,
  formatLocaleTimeKorean,
  getTodayKorean,
} from "./date";

describe("date utils", () => {
  test("getTodayKorean returns the expected Korean label shape", () => {
    assert.match(getTodayKorean(), /^\d{1,2}\/\d{1,2}\([일월화수목금토]\)$/);
  });

  test("formatDateDotYMD formats YYYY.MM.DD", () => {
    assert.equal(formatDateDotYMD("2026-04-14"), "2026.04.14");
    assert.equal(formatDateDotYMD(null), "-");
  });

  test("formatDateMD formats M/D", () => {
    assert.equal(formatDateMD("2026-04-14"), "4/14");
    assert.equal(formatDateMD(null), "미정");
  });

  test("formatDateLongKorean formats long Korean date", () => {
    assert.equal(formatDateLongKorean("2026-04-14"), "2026년 4월 14일");
    assert.equal(formatDateLongKorean(null), "미정");
  });

  test("locale helpers match Korean display output", () => {
    const value = new Date("2026-04-14T15:30:00+09:00");

    assert.equal(formatLocaleDateKorean(value), value.toLocaleDateString("ko-KR"));
    assert.equal(
      formatLocaleTimeKorean(value),
      value.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    );
  });
});
