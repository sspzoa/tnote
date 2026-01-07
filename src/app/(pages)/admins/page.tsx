"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Admin {
  id: string;
  phone_number: string;
  name: string;
  role: "owner" | "admin";
  created_at: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admins");
      const result = await response.json();

      if (response.ok) {
        setAdmins(result.data || []);
      } else {
        alert(result.error || "관리자 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (inviteForm.password !== inviteForm.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (inviteForm.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteForm.name,
          phoneNumber: inviteForm.phoneNumber,
          password: inviteForm.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("관리자가 추가되었습니다.");
        setShowInviteModal(false);
        setInviteForm({ name: "", phoneNumber: "", password: "", confirmPassword: "" });
        fetchAdmins();
      } else {
        setError(result.error || "관리자 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Invite error:", error);
      setError("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (admin.role === "owner") {
      alert("워크스페이스 소유자는 삭제할 수 없습니다.");
      return;
    }

    if (!confirm(`${admin.name} 관리자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admins/${admin.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("관리자가 삭제되었습니다.");
        fetchAdmins();
      } else {
        const result = await response.json();
        alert(result.error || "관리자 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 홈으로 돌아가기
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">관리자 관리</h1>
              <p className="text-body text-content-standard-secondary">워크스페이스 관리자 {admins.length}명</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
              관리자 추가
            </button>
          </div>
        </div>

        {/* 관리자 목록 */}
        {loading ? (
          <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
        ) : admins.length === 0 ? (
          <div className="py-spacing-900 text-center">
            <p className="text-body text-content-standard-tertiary">관리자가 없습니다.</p>
          </div>
        ) : (
          <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <table className="w-full rounded-radius-400">
              <thead className="bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    이름
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    전화번호
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    역할
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    가입일
                  </th>
                  <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="px-spacing-500 py-spacing-400 font-medium text-body text-content-standard-primary">
                      {admin.name}
                    </td>
                    <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                      {admin.phone_number}
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <span
                        className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-semibold text-footnote ${
                          admin.role === "owner"
                            ? "bg-solid-translucent-purple text-solid-purple"
                            : "bg-solid-translucent-blue text-solid-blue"
                        }`}>
                        {admin.role === "owner" ? "소유자" : "관리자"}
                      </span>
                    </td>
                    <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                      {new Date(admin.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="relative px-spacing-500 py-spacing-400">
                      {admin.role !== "owner" && (
                        <>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === admin.id ? null : admin.id)}
                            className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                            <svg
                              className="h-5 w-5 text-content-standard-tertiary"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openMenuId === admin.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[120px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleDelete(admin);
                                  }}
                                  className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative transition-colors hover:bg-solid-translucent-red">
                                  삭제
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 관리자 추가 모달 */}
        {showInviteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowInviteModal(false)}>
            <div
              className="flex w-full max-w-md flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">관리자 추가</h2>
                <p className="mt-spacing-100 text-content-standard-secondary text-label">
                  워크스페이스에 새로운 관리자를 추가합니다.
                </p>
              </div>

              {/* 모달 내용 */}
              <form onSubmit={handleInvite} className="flex-1 overflow-y-auto p-spacing-600">
                <div className="space-y-spacing-400">
                  {/* 이름 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      이름 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="text"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      required
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  {/* 전화번호 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      전화번호 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="tel"
                      value={inviteForm.phoneNumber}
                      onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })}
                      required
                      placeholder="01012345678"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  {/* 비밀번호 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      비밀번호 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="password"
                      value={inviteForm.password}
                      onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                      required
                      placeholder="최소 8자 이상"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  {/* 비밀번호 확인 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      비밀번호 확인 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="password"
                      value={inviteForm.confirmPassword}
                      onChange={(e) => setInviteForm({ ...inviteForm, confirmPassword: e.target.value })}
                      required
                      placeholder="비밀번호를 다시 입력하세요"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="rounded-radius-300 border border-core-status-negative/20 bg-solid-translucent-red px-spacing-400 py-spacing-300 font-medium text-core-status-negative text-label">
                      {error}
                    </div>
                  )}
                </div>

                {/* 모달 푸터 */}
                <div className="mt-spacing-600 flex gap-spacing-300">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setError("");
                    }}
                    className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                    {saving ? "추가 중..." : "추가"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
