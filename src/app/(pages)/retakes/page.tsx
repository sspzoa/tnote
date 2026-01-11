"use client";

import { useAtom } from "jotai";
import Link from "next/link";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { postponeDateAtom, postponeNoteAtom } from "./(atoms)/useFormStore";
import {
  selectedStudentIdAtom,
  showAbsentModalAtom,
  showAssignModalAtom,
  showCompleteModalAtom,
  showHistoryModalAtom,
  showManagementStatusModalAtom,
  showPostponeModalAtom,
  showStudentModalAtom,
} from "./(atoms)/useModalStore";
import {
  filterAtom,
  openMenuIdAtom,
  retakesAtom,
  searchQueryAtom,
  selectedRetakeAtom,
} from "./(atoms)/useRetakesStore";
import ManagementStatusModal from "./(components)/ManagementStatusModal";
import RetakeAbsentModal from "./(components)/RetakeAbsentModal";
import RetakeAssignModal from "./(components)/RetakeAssignModal";
import RetakeCompleteModal from "./(components)/RetakeCompleteModal";
import RetakeHistoryModal from "./(components)/RetakeHistoryModal";
import RetakeList from "./(components)/RetakeList";
import RetakePostponeModal from "./(components)/RetakePostponeModal";
import StudentInfoModal from "./(components)/StudentInfoModal";
import { useRetakeDelete } from "./(hooks)/useRetakeDelete";
import { useRetakes } from "./(hooks)/useRetakes";

export default function RetakesPage() {
  const [filter, setFilter] = useAtom(filterAtom);
  const [retakes] = useAtom(retakesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [, setSelectedRetake] = useAtom(selectedRetakeAtom);
  const [, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [, setShowPostponeModal] = useAtom(showPostponeModalAtom);
  const [, setShowAbsentModal] = useAtom(showAbsentModalAtom);
  const [, setShowCompleteModal] = useAtom(showCompleteModalAtom);
  const [, setShowHistoryModal] = useAtom(showHistoryModalAtom);
  const [, setShowAssignModal] = useAtom(showAssignModalAtom);
  const [, setShowStudentModal] = useAtom(showStudentModalAtom);
  const [, setShowManagementStatusModal] = useAtom(showManagementStatusModalAtom);
  const [, setSelectedStudentId] = useAtom(selectedStudentIdAtom);
  const [, setPostponeDate] = useAtom(postponeDateAtom);
  const [, setPostponeNote] = useAtom(postponeNoteAtom);

  const { retakes: fetchedRetakes, isLoading, error, refetch } = useRetakes(filter);
  const { deleteRetake } = useRetakeDelete();

  const handlePostpone = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setPostponeDate("");
    setPostponeNote("");
    setShowPostponeModal(true);
    setOpenMenuId(null);
  };

  const handleAbsent = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setShowAbsentModal(true);
    setOpenMenuId(null);
  };

  const handleComplete = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setShowCompleteModal(true);
    setOpenMenuId(null);
  };

  const handleViewHistory = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setShowHistoryModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (retake: (typeof retakes)[number]) => {
    setOpenMenuId(null);
    if (!confirm(`${retake.student.name} 학생의 ${retake.exam.course.name} 재시험을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteRetake(retake.id);
      alert("재시험이 삭제되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };

  const handleViewStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowStudentModal(true);
  };

  const handleAssignClick = () => {
    setShowAssignModal(true);
  };

  const handleManagementStatusChange = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setShowManagementStatusModal(true);
    setOpenMenuId(null);
  };

  const handleActionSuccess = () => {
    refetch();
  };

  const filteredRetakes = fetchedRetakes.filter((retake) =>
    retake.student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (error) {
    return (
      <Container>
        <Header title="재시험 관리" subtitle="학생들의 재시험을 관리합니다" />
        <ErrorComponent errorMessage={error.message} />
      </Container>
    );
  }

  return (
    <Container>
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <Header
        title="재시험 관리"
        subtitle="학생들의 재시험을 관리합니다"
        action={
          <button
            onClick={handleAssignClick}
            className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            + 재시험 할당
          </button>
        }
      />

      {/* 필터 */}
      <div className="mb-spacing-600 flex flex-wrap gap-spacing-300">
        {[
          { value: "all", label: "전체" },
          { value: "pending", label: "대기중" },
          { value: "completed", label: "완료" },
          { value: "absent", label: "결석" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as typeof filter)}
            className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
              filter === item.value
                ? "bg-core-accent text-solid-white"
                : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
            }`}>
            {item.label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="mb-spacing-600">
        <input
          type="text"
          placeholder="학생 이름 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
        />
      </div>

      {/* 재시험 목록 */}
      {isLoading ? (
        <LoadingComponent />
      ) : fetchedRetakes.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">재시험이 없습니다.</p>
        </div>
      ) : filteredRetakes.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <RetakeList
          retakes={filteredRetakes}
          onViewStudent={handleViewStudent}
          onPostpone={handlePostpone}
          onAbsent={handleAbsent}
          onComplete={handleComplete}
          onViewHistory={handleViewHistory}
          onDelete={handleDelete}
          onManagementStatusChange={handleManagementStatusChange}
        />
      )}

      {/* 모달들 */}
      <RetakePostponeModal onSuccess={handleActionSuccess} />
      <RetakeAbsentModal onSuccess={handleActionSuccess} />
      <RetakeCompleteModal onSuccess={handleActionSuccess} />
      <RetakeHistoryModal />
      <StudentInfoModal />
      <RetakeAssignModal onSuccess={handleActionSuccess} />
      <ManagementStatusModal onSuccess={handleActionSuccess} />
    </Container>
  );
}
