import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type MenuPosition,
  MoreOptionsButton,
} from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { useToast } from "@/shared/hooks/useToast";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { type Admin, openMenuIdAtom } from "../(atoms)/useAdminsStore";
import { useAdminDelete } from "../(hooks)/useAdminDelete";
import { useAdminResetPassword } from "../(hooks)/useAdminResetPassword";

interface AdminListProps {
  admins: Admin[];
  isOwner: boolean;
}

type AdminSortKey = "name" | "phone" | "role" | "createdAt";

export default function AdminList({ admins, isOwner }: AdminListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const { deleteAdmin } = useAdminDelete();
  const { resetPassword } = useAdminResetPassword();
  const toast = useToast();

  const comparators = useMemo(
    () => ({
      name: (a: Admin, b: Admin) => a.name.localeCompare(b.name, "ko"),
      phone: (a: Admin, b: Admin) => a.phone_number.localeCompare(b.phone_number),
      role: (a: Admin, b: Admin) => a.role.localeCompare(b.role),
      createdAt: (a: Admin, b: Admin) => a.created_at.localeCompare(b.created_at),
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<Admin, AdminSortKey>({
    data: admins,
    comparators,
    defaultSort: { key: "name", direction: "asc" },
  });

  const handleDelete = async (admin: Admin) => {
    if (admin.role === "owner") {
      toast.error("워크스페이스 소유자는 삭제할 수 없습니다.");
      return;
    }

    if (!confirm(`${admin.name} 관리자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteAdmin(admin.id);
      toast.success("관리자가 삭제되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "관리자 삭제에 실패했습니다.");
    }
  };

  const handleResetPassword = async (admin: Admin) => {
    if (!confirm(`${admin.name} 관리자의 비밀번호를 전화번호로 초기화하시겠습니까?`)) {
      return;
    }

    try {
      await resetPassword(admin.id);
      toast.success("비밀번호가 전화번호로 초기화되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "비밀번호 초기화에 실패했습니다.");
    }
  };

  const getMenuItems = (admin: Admin): DropdownMenuItem[] => [
    { label: "비밀번호 초기화", onClick: () => handleResetPassword(admin) },
    { label: "삭제", onClick: () => handleDelete(admin), variant: "danger" },
  ];

  return (
    <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
          <tr>
            <SortableHeader
              label="이름"
              sortKey="name"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="전화번호"
              sortKey="phone"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="역할"
              sortKey="role"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="가입일"
              sortKey="createdAt"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            {isOwner && (
              <th className="w-24 whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((admin) => (
            <tr
              key={admin.id}
              className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400 font-medium text-body text-content-standard-primary">
                {admin.name}
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                {formatPhoneNumber(admin.phone_number)}
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <Badge variant={admin.role === "owner" ? "purple" : "blue"} size="sm">
                  {admin.role === "owner" ? "소유자" : "관리자"}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                {new Date(admin.created_at).toLocaleDateString("ko-KR")}
              </td>
              {isOwner && (
                <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                  {admin.role !== "owner" && (
                    <MoreOptionsButton
                      onClick={(pos) => {
                        if (openMenuId === admin.id) {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        } else {
                          setOpenMenuId(admin.id);
                          setMenuPosition(pos);
                        }
                      }}
                    />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {openMenuId && (
        <DropdownMenu
          isOpen={true}
          onClose={() => {
            setOpenMenuId(null);
            setMenuPosition(null);
          }}
          items={getMenuItems(sortedData.find((a) => a.id === openMenuId)!)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
