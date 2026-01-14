import { useAtom } from "jotai";
import { DropdownMenu, type DropdownMenuItem, MoreOptionsButton } from "@/shared/components/ui/dropdownMenu";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
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

  const getMenuItems = (admin: Admin): DropdownMenuItem[] => [
    { label: "삭제", onClick: () => handleDelete(admin), variant: "danger" },
  ];

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
                {formatPhoneNumber(admin.phone_number)}
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
                    <MoreOptionsButton onClick={() => setOpenMenuId(openMenuId === admin.id ? null : admin.id)} />
                    <DropdownMenu
                      isOpen={openMenuId === admin.id}
                      onClose={() => setOpenMenuId(null)}
                      items={getMenuItems(admin)}
                    />
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
