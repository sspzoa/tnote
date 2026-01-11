import { useAtom } from "jotai";
import { Button, FormInput, Modal } from "@/shared/components/ui";
import { formErrorAtom, inviteFormAtom } from "../(atoms)/useFormStore";
import { showInviteModalAtom } from "../(atoms)/useModalStore";
import { useAdminCreate } from "../(hooks)/useAdminCreate";

export default function AdminInviteModal() {
  const [showModal, setShowModal] = useAtom(showInviteModalAtom);
  const [form, setForm] = useAtom(inviteFormAtom);
  const [error, setError] = useAtom(formErrorAtom);
  const { createAdmin, isCreating } = useAdminCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    try {
      await createAdmin({
        name: form.name,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      alert("관리자가 추가되었습니다.");
      setShowModal(false);
      setForm({ name: "", phoneNumber: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "관리자 추가에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
        setError("");
      }}
      title="관리자 추가"
      subtitle="워크스페이스에 새로운 관리자를 추가합니다."
      footer={
        <>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setShowModal(false);
              setError("");
            }}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            isLoading={isCreating}
            loadingText="추가 중...">
            추가
          </Button>
        </>
      }>
      <form onSubmit={handleSubmit} className="space-y-spacing-400">
        <FormInput
          label="이름"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <FormInput
          label="전화번호"
          type="tel"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          placeholder="01012345678"
          required
        />

        <FormInput
          label="비밀번호"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="최소 8자 이상"
          required
        />

        <FormInput
          label="비밀번호 확인"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="비밀번호를 다시 입력하세요"
          required
        />

        {error && (
          <div className="rounded-radius-300 border border-core-status-negative/20 bg-solid-translucent-red px-spacing-400 py-spacing-300 font-medium text-core-status-negative text-label">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
