import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 - Tnote",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-spacing-600 py-spacing-800">
      <h1 className="mb-spacing-600 font-bold text-content-standard-primary text-display">이용약관</h1>

      <div className="space-y-spacing-600 text-body text-content-standard-secondary">
        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">제1조 (목적)</h2>
          <p>
            본 약관은 Tnote(이하 &quot;서비스&quot;)의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및
            책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제2조 (서비스 제공자 정보)
          </h2>
          <ul className="list-disc space-y-spacing-200 pl-spacing-500">
            <li>서비스명: Tnote</li>
            <li>운영자: 서승표</li>
            <li>이메일: me@sspzoa.io</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">제3조 (용어의 정의)</h2>
          <ul className="list-disc space-y-spacing-200 pl-spacing-500">
            <li>&quot;서비스&quot;란 Tnote가 제공하는 학생 관리 및 교육 관련 서비스를 의미합니다.</li>
            <li>
              &quot;소유자&quot;란 서비스에 직접 회원가입하여 워크스페이스를 생성하고 운영하는 교사 또는 관리 책임자를
              의미합니다.
            </li>
            <li>&quot;관리자&quot;란 소유자가 워크스페이스에 등록한 공동 관리 권한을 가진 이용자를 의미합니다.</li>
            <li>&quot;학생&quot;이란 소유자 또는 관리자가 워크스페이스에 등록한 교육 대상자를 의미합니다.</li>
            <li>
              &quot;워크스페이스&quot;란 소유자가 생성하여 학생, 수업, 시험 등을 관리하는 독립된 서비스 공간을
              의미합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제4조 (이용 계약의 체결)
          </h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>
              서비스 이용 계약은 소유자가 본 약관과 개인정보처리방침에 동의하고 회원가입을 완료함으로써 체결됩니다.
            </li>
            <li>
              관리자 및 학생은 소유자에 의해 워크스페이스에 등록되며, 소유자는 해당 구성원에게 서비스 이용에 대한 안내
              및 동의를 얻을 책임이 있습니다.
            </li>
            <li>
              소유자는 구성원의 개인정보를 등록하기 전에 해당 구성원(또는 법정대리인)으로부터 개인정보 수집·이용에 대한
              동의를 받아야 합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제5조 (약관의 효력 및 변경)
          </h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
            <li>서비스 제공자는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
            <li>약관이 변경되는 경우 변경 사항을 시행일자 7일 전부터 서비스 내에 공지합니다.</li>
            <li>
              이용자에게 불리한 약관 변경의 경우 시행일자 30일 전부터 공지하며, 이용자가 변경된 약관에 동의하지 않는
              경우 서비스 이용 계약을 해지할 수 있습니다.
            </li>
            <li>변경된 약관의 시행일 이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 간주합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제6조 (서비스의 제공)
          </h2>
          <p className="mb-spacing-200">서비스는 다음과 같은 기능을 제공합니다:</p>
          <ul className="list-disc space-y-spacing-200 pl-spacing-500">
            <li>워크스페이스 생성 및 관리</li>
            <li>관리자 및 학생 계정 등록·관리</li>
            <li>수업 및 시험 관리</li>
            <li>재시험 관리</li>
            <li>클리닉 출석 관리</li>
            <li>문자 발송 서비스 (시험 결과, 재시험 안내 등)</li>
            <li>캘린더 기능</li>
            <li>상담 기록 관리</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제7조 (소유자의 의무)
          </h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>
              소유자는 워크스페이스에 구성원을 등록할 때, 해당 구성원(미성년자의 경우 법정대리인)에게 개인정보 수집 목적
              및 이용 범위를 고지하고 동의를 받아야 합니다.
            </li>
            <li>소유자는 등록한 구성원의 개인정보를 서비스 목적 외로 이용하거나 제3자에게 제공하여서는 안 됩니다.</li>
            <li>소유자는 워크스페이스 내 데이터의 정확성과 적법성에 대한 관리 책임이 있습니다.</li>
            <li>소유자는 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제8조 (이용자의 의무)
          </h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>이용자는 서비스 이용 시 관련 법령 및 본 약관의 규정을 준수하여야 합니다.</li>
            <li>이용자는 타인의 개인정보를 무단으로 수집, 이용하거나 제3자에게 제공하여서는 안 됩니다.</li>
            <li>이용자는 서비스의 안정적 운영을 방해하는 행위를 하여서는 안 됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제9조 (서비스 이용 제한)
          </h2>
          <p>
            서비스 제공자는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스 이용을
            제한할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">
            제10조 (서비스 해지 및 데이터 삭제)
          </h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>
              소유자는 언제든지 워크스페이스를 삭제할 수 있으며, 삭제 시 해당 워크스페이스의 모든 데이터가 영구적으로
              삭제됩니다.
            </li>
            <li>
              소유자가 워크스페이스를 삭제하면 해당 워크스페이스에 등록된 관리자 및 학생의 계정도 함께 삭제됩니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">제11조 (면책조항)</h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>
              서비스 제공자는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수
              없는 경우 책임이 면제됩니다.
            </li>
            <li>서비스 제공자는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
            <li>
              서비스 제공자는 소유자가 구성원의 동의 없이 개인정보를 등록하여 발생하는 문제에 대하여 책임을 지지
              않습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">제12조 (분쟁 해결)</h2>
          <ul className="list-decimal space-y-spacing-200 pl-spacing-500">
            <li>서비스 이용과 관련하여 분쟁이 발생한 경우, 양 당사자는 원만한 해결을 위해 성실히 협의합니다.</li>
            <li>협의가 이루어지지 않을 경우, 관련 법령에 따라 관할권이 있는 법원을 제1심 관할 법원으로 합니다.</li>
            <li>서비스 이용과 관련된 분쟁에 대해 대한민국 법률을 적용합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-spacing-300 font-semibold text-content-standard-primary text-title">부칙</h2>
          <p>본 약관은 2026년 1월 24일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}
