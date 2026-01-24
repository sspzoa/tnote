import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 - Tnote",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-spacing-600 py-spacing-800">
      <h1 className="mb-spacing-600 font-bold text-content-standard-primary text-display">개인정보처리방침</h1>

      <div className="space-y-spacing-600 text-body text-content-standard-secondary">
        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제1조 (개인정보의 수집 항목 및 수집 방법)
          </h2>
          <p className="mb-spacing-300">서비스는 다음과 같은 개인정보를 수집합니다:</p>

          <h3 className="mb-spacing-200 font-medium text-body text-content-standard-primary">
            1. 소유자 (직접 회원가입)
          </h3>
          <ul className="mb-spacing-300 list-disc space-y-spacing-200 pl-spacing-500">
            <li>필수 항목: 이름, 전화번호, 비밀번호, 워크스페이스 이름</li>
            <li>자동 수집 항목: 접속 로그, IP 주소, 서비스 이용 기록</li>
          </ul>

          <h3 className="mb-spacing-200 font-medium text-body text-content-standard-primary">
            2. 관리자 (소유자가 등록)
          </h3>
          <ul className="mb-spacing-300 list-disc space-y-spacing-200 pl-spacing-500">
            <li>필수 항목: 이름, 전화번호</li>
          </ul>

          <h3 className="mb-spacing-200 font-medium text-body text-content-standard-primary">
            3. 학생 (소유자 또는 관리자가 등록)
          </h3>
          <ul className="list-disc space-y-spacing-200 pl-spacing-500">
            <li>필수 항목: 이름, 전화번호</li>
            <li>선택 항목: 학부모 전화번호, 학교, 분원, 출생연도</li>
          </ul>

          <p className="mt-spacing-300 rounded-radius-300 bg-components-fill-standard-secondary p-spacing-400 text-content-standard-tertiary text-footnote">
            ※ 관리자 및 학생의 개인정보는 소유자가 직접 등록합니다. 소유자는 등록 전에 해당 구성원(미성년자의 경우
            법정대리인)으로부터 개인정보 수집·이용에 대한 동의를 받아야 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제2조 (개인정보의 수집 및 이용 목적)
          </h2>
          <p className="mb-spacing-200">수집된 개인정보는 다음의 목적을 위해 이용됩니다:</p>
          <ul className="list-disc space-y-spacing-200 pl-spacing-500">
            <li>서비스 제공 및 운영: 학생 관리, 수업/시험 관리, 출석 관리, 상담 기록</li>
            <li>문자 발송: 시험 결과, 재시험 안내 등 학사 관련 알림 (학생 및 학부모 전화번호 이용)</li>
            <li>서비스 개선: 이용 통계 분석, 서비스 품질 향상</li>
            <li>본인 확인 및 인증: 로그인, 비밀번호 변경</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제3조 (개인정보의 보유 및 이용 기간)
          </h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>이용자의 개인정보는 워크스페이스가 유지되는 동안 보유 및 이용됩니다.</li>
            <li>소유자가 워크스페이스를 삭제하면 해당 워크스페이스의 모든 구성원 정보가 즉시 파기됩니다.</li>
            <li>소유자 또는 관리자가 개별 학생/관리자를 삭제하면 해당 정보는 즉시 파기됩니다.</li>
            <li>
              단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다:
              <ul className="mt-spacing-200 list-disc space-y-spacing-100 pl-spacing-500">
                <li>서비스 이용 기록: 3개월 (통신비밀보호법)</li>
                <li>접속 로그: 3개월 (통신비밀보호법)</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제4조 (개인정보의 제3자 제공)
          </h2>
          <p className="mb-spacing-200">
            서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
          </p>
          <ul className="list-disc space-y-spacing-200 pl-spacing-500">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제5조 (개인정보 처리의 위탁)
          </h2>
          <p className="mb-spacing-200">서비스는 원활한 운영을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-line-divider text-footnote">
              <thead>
                <tr className="bg-components-fill-standard-secondary">
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">수탁업체</th>
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Supabase</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">데이터베이스 호스팅</td>
                </tr>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Solapi</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">문자 메시지 발송</td>
                </tr>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Vercel</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">웹 서비스 호스팅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제6조 (개인정보의 파기 절차 및 방법)
          </h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>파기 절차: 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 즉시 파기합니다.</li>
            <li>파기 방법: 전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제합니다.</li>
            <li>워크스페이스 삭제 시 해당 워크스페이스에 속한 모든 구성원의 개인정보가 일괄 파기됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제7조 (이용자의 권리와 행사 방법)
          </h2>
          <p className="mb-spacing-200">이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc space-y-spacing-200 pl-spacing-500">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ul>
          <p className="mt-spacing-200">
            학생 및 관리자는 소유자에게 자신의 정보 열람, 정정, 삭제를 요청할 수 있으며, 소유자는 정당한 사유 없이 이를
            거부할 수 없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제8조 (소유자의 개인정보 관리 책임)
          </h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>소유자는 워크스페이스에 등록하는 구성원의 개인정보에 대한 관리 책임이 있습니다.</li>
            <li>
              소유자는 학생 등록 시 해당 학생(미성년자의 경우 법정대리인)에게 개인정보 수집·이용 목적, 항목, 보유 기간을
              고지하고 동의를 받아야 합니다.
            </li>
            <li>소유자는 구성원의 개인정보를 서비스 목적 외로 활용하거나 제3자에게 무단 제공하여서는 안 됩니다.</li>
            <li>소유자가 본 조의 의무를 위반하여 발생하는 법적 책임은 소유자에게 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제9조 (개인정보의 안전성 확보 조치)
          </h2>
          <p className="mb-spacing-200">서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
          <ul className="list-disc space-y-spacing-200 pl-spacing-500">
            <li>비밀번호의 암호화 저장 (bcrypt)</li>
            <li>SSL/TLS를 통한 데이터 전송 암호화</li>
            <li>접근 권한 관리 (역할 기반 접근 제어: 소유자, 관리자, 학생)</li>
            <li>워크스페이스 간 데이터 격리</li>
            <li>접속 로그의 보관 및 위변조 방지</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">부칙</h2>
          <p>본 개인정보처리방침은 2026년 1월 24일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}
