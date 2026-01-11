import { useAtom } from "jotai";
import { type Admin, openMenuIdAtom } from "../(atoms)/useAdminsStore";
import { useAdminDelete } from "../(hooks)/useAdminDelete";

interface AdminListProps {
  admins: Admin[];
}

export default function AdminList({ admins }: AdminListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const { deleteAdmin } = useAdminDelete();

  const handleDelete = async (admin: Admin) => {
    if (admin.role === "owner") {
      alert("워크스페이스 소유자는 삭제할 수 없습니다.");
      return;
    }

    if (!confirm(`${admin.name} 관리자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteAdmin(admin.id);
      alert("관리자가 삭제되었습니다.");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error instanceof Error ? error.message : "관리자 삭제에 실패했습니다.");
    }
  };

  return (
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
                      <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
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
  );
}
