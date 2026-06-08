import { useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { useToast } from "@/shared/hooks/useToast";
import { formatLocaleDateKorean } from "@/shared/lib/utils/date";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import type { Admin } from "../(atoms)/useAdminsStore";
import { useAdminDelete } from "../(hooks)/useAdminDelete";
import { useAdminResetPassword } from "../(hooks)/useAdminResetPassword";

interface AdminListProps {
  admins: Admin[];
  isOwner: boolean;
}

type AdminSortKey = "name" | "phone" | "role" | "createdAt";

export default function AdminList({ admins, isOwner }: AdminListProps) {
  const { deleteAdmin } = useAdminDelete();
  const { resetPassword } = useAdminResetPassword();
  const toast = useToast();
  const confirm = useConfirm();

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

    const ok = await confirm({
      title: "관리자 삭제",
      message: `${admin.name} 관리자를 삭제하시겠습니까?`,
      variant: "danger",
      confirmLabel: "삭제",
    });
    if (!ok) return;

    try {
      await deleteAdmin(admin.id);
      toast.success("관리자가 삭제되었습니다.");
    } catch (error) {
      toast.error(getErrorMessage(error, "관리자 삭제에 실패했습니다."));
    }
  };

  const handleResetPassword = async (admin: Admin) => {
    const ok = await confirm({
      title: "비밀번호 초기화",
      message: `${admin.name} 관리자의 비밀번호를 전화번호로 초기화하시겠습니까?`,
    });
    if (!ok) return;

    try {
      await resetPassword(admin.id);
      toast.success("비밀번호가 전화번호로 초기화되었습니다.");
    } catch (error) {
      toast.error(getErrorMessage(error, "비밀번호 초기화에 실패했습니다."));
    }
  };

  const getMenuItems = (admin: Admin): DropdownMenuItem[] => [
    { label: "비밀번호 초기화", onClick: () => handleResetPassword(admin) },
    { label: "삭제", onClick: () => handleDelete(admin), variant: "danger" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full rounded-lg">
        <thead className="bg-muted">
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
              <th className="w-24 whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground" />
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((admin) => (
            <tr key={admin.id} className="border-border border-t transition-colors hover:bg-accent">
              <td className="whitespace-nowrap px-5 py-4 font-medium text-base text-foreground">{admin.name}</td>
              <td className="whitespace-nowrap px-5 py-4 text-base text-muted-foreground">
                {formatPhoneNumber(admin.phone_number)}
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <Badge variant={admin.role === "owner" ? "purple" : "blue"} size="sm">
                  {admin.role === "owner" ? "소유자" : "관리자"}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-base text-muted-foreground">
                {formatLocaleDateKorean(admin.created_at)}
              </td>
              {isOwner && (
                <td className="whitespace-nowrap px-5 py-4">
                  {admin.role !== "owner" && <DropdownMenu items={getMenuItems(admin)} />}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
