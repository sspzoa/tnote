"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { type ExportRow, useExamExport } from "../(hooks)/useExamExport";
import type { Exam } from "../(hooks)/useExams";

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
}

export function ExcelExportModal({ isOpen, onClose, exam }: ExcelExportModalProps) {
  const [copied, setCopied] = useState(false);
  const { exportData, isLoading } = useExamExport(exam?.id ?? "", isOpen && !!exam);

  if (!exam) return null;

  const rows = exportData?.rows ?? [];

  const generateExcelText = (data: ExportRow[]) => {
    const dataRows = data.map((row) =>
      [
        row.name,
        formatPhoneNumber(row.parentPhone),
        row.assignmentStatus || "-",
        row.score !== null ? row.score.toString() : "-",
        row.rank !== null ? row.rank.toString() : "-",
      ].join("\t"),
    );

    return dataRows.join("\n");
  };

  const handleCopy = async () => {
    const text = generateExcelText(rows);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        닫기
      </Button>
      <Button onClick={handleCopy} disabled={rows.length === 0}>
        {copied ? "복사됨!" : "엑셀 형식으로 복사"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="(임시) 문자용 엑셀"
      subtitle={`${exam.name} (${exam.exam_number}회차)`}
      footer={footer}
      maxWidth="4xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-spacing-800">
          <div className="size-8 animate-spin rounded-full border-4 border-core-accent border-t-transparent" />
        </div>
      ) : rows.length === 0 ? (
        <div className="py-spacing-800 text-center text-body text-content-standard-tertiary">
          점수 데이터가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-components-fill-standard-secondary">
              <tr>
                <th className="whitespace-nowrap px-spacing-400 py-spacing-300 text-left font-semibold text-body text-content-standard-primary">
                  이름
                </th>
                <th className="whitespace-nowrap px-spacing-400 py-spacing-300 text-left font-semibold text-body text-content-standard-primary">
                  학부모번호
                </th>
                <th className="whitespace-nowrap px-spacing-400 py-spacing-300 text-left font-semibold text-body text-content-standard-primary">
                  과제검사결과
                </th>
                <th className="whitespace-nowrap px-spacing-400 py-spacing-300 text-left font-semibold text-body text-content-standard-primary">
                  점수
                </th>
                <th className="whitespace-nowrap px-spacing-400 py-spacing-300 text-left font-semibold text-body text-content-standard-primary">
                  석차
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-divider">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-core-accent-translucent/50">
                  <td className="whitespace-nowrap px-spacing-400 py-spacing-300 text-body text-content-standard-primary">
                    {row.name}
                  </td>
                  <td className="whitespace-nowrap px-spacing-400 py-spacing-300 text-body text-content-standard-primary">
                    {formatPhoneNumber(row.parentPhone) || "-"}
                  </td>
                  <td className="whitespace-nowrap px-spacing-400 py-spacing-300">
                    {row.assignmentStatus ? (
                      <span
                        className={`rounded-radius-200 px-spacing-200 py-spacing-100 font-medium text-footnote ${
                          row.assignmentStatus === "완료"
                            ? "bg-solid-translucent-green text-solid-green"
                            : row.assignmentStatus === "미흡"
                              ? "bg-solid-translucent-yellow text-solid-yellow"
                              : "bg-solid-translucent-red text-solid-red"
                        }`}>
                        {row.assignmentStatus}
                      </span>
                    ) : (
                      <span className="text-body text-content-standard-tertiary">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-spacing-400 py-spacing-300 text-body text-content-standard-primary">
                    {row.score !== null ? row.score : "-"}
                  </td>
                  <td className="whitespace-nowrap px-spacing-400 py-spacing-300 text-body text-content-standard-primary">
                    {row.rank !== null ? row.rank : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-spacing-400 text-content-standard-tertiary text-footnote">
            총 {rows.length}명의 데이터가 있습니다. &quot;엑셀 형식으로 복사&quot; 버튼을 클릭하면 탭으로 구분된
            형식으로 복사됩니다.
          </p>
        </div>
      )}
    </Modal>
  );
}
