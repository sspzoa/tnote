import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 - Tnote",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-spacing-600 px-spacing-600 py-spacing-800">
      <h1 className="font-bold text-content-standard-primary text-display">개인정보처리방침</h1>

      <div className="flex flex-col gap-spacing-600 text-body text-content-standard-secondary">
        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">
            제1조 (개인정보의 수집 항목 및 수집 방법)
          </h2>
          <p>서비스는 다음과 같은 개인정보를 수집합니다:</p>

          <h3 className="font-medium text-body text-content-standard-primary">1. 소유자 (직접 회원가입)</h3>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>필수 항목: 이름, 전화번호, 비밀번호, 워크스페이스 이름</li>
            <li>자동 수집 항목: 접속 로그, IP 주소, 서비스 이용 기록, 쿠키, 브라우저 정보(User-Agent)</li>
          </ul>

          <h3 className="font-medium text-body text-content-standard-primary">2. 관리자 (소유자가 등록)</h3>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>필수 항목: 이름, 전화번호, 비밀번호</li>
          </ul>

          <h3 className="font-medium text-body text-content-standard-primary">3. 학생 (소유자 또는 관리자가 등록)</h3>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>필수 항목: 이름, 전화번호</li>
            <li>선택 항목: 학부모 전화번호, 학교, 분원, 출생연도</li>
          </ul>

          <h3 className="font-medium text-body text-content-standard-primary">4. 서비스 이용 과정에서 생성되는 정보</h3>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>시험 성적 및 재시험 이력 (일정, 상태 변경, 출결 기록)</li>
            <li>상담 기록 (제목, 내용, 작성일)</li>
            <li>클리닉 출석 기록</li>
            <li>문자 발송 이력 (수신자 정보, 발송 내용, 발송 결과)</li>
          </ul>

          <p className="rounded-radius-300 bg-components-fill-standard-secondary p-spacing-400 text-content-standard-tertiary text-footnote">
            ※ 관리자 및 학생의 개인정보는 소유자가 직접 등록합니다. 소유자는 등록 전에 해당 구성원(미성년자의 경우
            법정대리인)으로부터 개인정보 수집·이용에 대한 동의를 받아야 합니다.
          </p>
          <p className="rounded-radius-300 bg-components-fill-standard-secondary p-spacing-400 text-content-standard-tertiary text-footnote">
            ※ 학생 계정의 초기 비밀번호는 등록된 전화번호로 자동 설정되며, 암호화하여 저장됩니다. 학생은 로그인 후
            비밀번호를 변경할 수 있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">
            제2조 (개인정보의 수집 및 이용 목적)
          </h2>
          <p>수집된 개인정보는 다음의 목적을 위해 이용됩니다:</p>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>서비스 제공 및 운영: 학생 관리, 수업/시험 관리, 재시험 관리, 출석 관리, 상담 기록</li>
            <li>문자 발송: 시험 결과, 재시험 안내 등 학사 관련 알림 (학생 및 학부모 전화번호 이용)</li>
            <li>서비스 개선: 이용 통계 분석, 서비스 품질 향상</li>
            <li>본인 확인 및 인증: 로그인, 비밀번호 변경</li>
            <li>서비스 안정성 확보: API 요청 로깅, 오류 추적, 보안 모니터링</li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">
            제3조 (개인정보의 보유 및 이용 기간)
          </h2>
          <ul className="flex list-decimal flex-col gap-spacing-200 pl-spacing-500">
            <li>이용자의 개인정보는 워크스페이스가 유지되는 동안 보유 및 이용됩니다.</li>
            <li>소유자가 워크스페이스를 삭제하면 해당 워크스페이스의 모든 구성원 정보가 즉시 파기됩니다.</li>
            <li>소유자 또는 관리자가 개별 학생/관리자를 삭제하면 해당 정보는 즉시 파기됩니다.</li>
            <li>문자 발송 이력은 발송일로부터 1년간 보관 후 파기합니다.</li>
            <li>서비스 이용 로그(API 요청 기록)는 수집일로부터 90일간 보관 후 자동 삭제됩니다.</li>
            <li>
              단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다:
              <ul className="flex list-disc flex-col gap-spacing-100 pl-spacing-500">
                <li>전자상거래 등에서의 소비자 보호에 관한 법률에 따른 계약 또는 청약철회 기록: 5년</li>
                <li>전자상거래 등에서의 소비자 보호에 관한 법률에 따른 소비자 불만 또는 분쟁처리 기록: 3년</li>
                <li>통신비밀보호법에 따른 로그인 기록: 3개월</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">제4조 (개인정보의 제3자 제공)</h2>
          <p>
            서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
          </p>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">제5조 (개인정보 처리의 위탁)</h2>
          <p>서비스는 원활한 운영을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-line-divider text-footnote">
              <thead>
                <tr className="bg-components-fill-standard-secondary">
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">수탁업체</th>
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">위탁 업무</th>
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Supabase (한국 리전)</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">데이터베이스 호스팅</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">위탁 계약 종료 시까지</td>
                </tr>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Solapi</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">문자 메시지 발송</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">발송 완료 시까지</td>
                </tr>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Vercel</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">웹 서비스 호스팅</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">위탁 계약 종료 시까지</td>
                </tr>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Axiom</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">
                    서비스 로그 저장 및 모니터링
                  </td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">수집일로부터 90일</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">제6조 (개인정보의 국외 이전)</h2>
          <p>서비스는 원활한 운영을 위해 다음과 같이 개인정보를 국외로 이전하고 있습니다:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-line-divider text-footnote">
              <thead>
                <tr className="bg-components-fill-standard-secondary">
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">이전받는 자</th>
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">이전 국가</th>
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">이전 항목</th>
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">이전 목적</th>
                  <th className="border border-line-divider px-spacing-400 py-spacing-200 text-left">보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Vercel, Inc.</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">미국</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">접속 로그, IP 주소, 쿠키</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">웹 서비스 호스팅</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">서비스 이용 종료 시까지</td>
                </tr>
                <tr>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">Axiom, Inc.</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">미국</td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">
                    이용자 식별정보(ID, 이름, 역할), IP 주소, 브라우저 정보, API 요청 기록
                  </td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">
                    서비스 로그 저장 및 모니터링
                  </td>
                  <td className="border border-line-divider px-spacing-400 py-spacing-200">수집일로부터 90일</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-content-standard-tertiary text-footnote">
            이전 방법: 서비스 이용 과정에서 네트워크를 통한 전송
          </p>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">
            제7조 (개인정보의 파기 절차 및 방법)
          </h2>
          <ul className="flex list-decimal flex-col gap-spacing-200 pl-spacing-500">
            <li>파기 절차: 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 즉시 파기합니다.</li>
            <li>파기 방법: 전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제합니다.</li>
            <li>워크스페이스 삭제 시 해당 워크스페이스에 속한 모든 구성원의 개인정보가 일괄 파기됩니다.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">제8조 (쿠키의 사용)</h2>
          <ul className="flex list-decimal flex-col gap-spacing-200 pl-spacing-500">
            <li>
              서비스는 이용자 인증 및 세션 유지를 위해 쿠키를 사용합니다. 쿠키는 로그인 상태 유지 및 보안 목적으로만
              사용됩니다.
            </li>
            <li>
              이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 다만, 쿠키를 거부할 경우 로그인이 필요한
              서비스 이용에 제한이 있을 수 있습니다.
            </li>
            <li>
              쿠키 설정 변경 방법: 브라우저 상단의 설정 &gt; 개인정보 &gt; 쿠키 설정에서 쿠키 허용 여부를 선택할 수
              있습니다.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">
            제9조 (문자 메시지 발송 및 수신 동의)
          </h2>
          <ul className="flex list-decimal flex-col gap-spacing-200 pl-spacing-500">
            <li>
              서비스는 시험 결과, 재시험 안내 등 학사 관련 정보를 학생 및 학부모에게 문자 메시지로 발송할 수 있습니다.
            </li>
            <li>
              소유자는 문자 발송 전 수신자(학생, 학부모)로부터 정보성 문자 수신에 대한 동의를 받아야 할 책임이 있습니다.
            </li>
            <li>수신자는 소유자에게 문자 수신 거부를 요청할 수 있으며, 소유자는 이를 즉시 반영하여야 합니다.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">제10조 (이용자의 권리와 행사 방법)</h2>
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ul>
          <p>
            학생 및 관리자는 소유자에게 자신의 정보 열람, 정정, 삭제를 요청할 수 있으며, 소유자는 정당한 사유 없이 이를
            거부할 수 없습니다.
          </p>
          <div className="rounded-radius-300 bg-components-fill-standard-secondary p-spacing-400">
            <p className="font-medium text-content-standard-primary text-footnote">권리 행사 방법 및 접수처</p>
            <ul className="flex list-disc flex-col gap-spacing-100 pl-spacing-500 text-footnote">
              <li>이메일: me@sspzoa.io</li>
              <li>요청 후 10일 이내에 처리 결과를 통지합니다.</li>
              <li>정당한 사유로 처리가 지연될 경우 사유와 처리 예정일을 별도 안내합니다.</li>
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">
            제11조 (소유자의 개인정보 관리 책임)
          </h2>
          <ul className="flex list-decimal flex-col gap-spacing-200 pl-spacing-500">
            <li>소유자는 워크스페이스에 등록하는 구성원의 개인정보에 대한 관리 책임이 있습니다.</li>
            <li>
              소유자는 학생 등록 시 해당 학생(미성년자의 경우 법정대리인)에게 개인정보 수집·이용 목적, 항목, 보유 기간을
              고지하고 동의를 받아야 합니다.
            </li>
            <li>소유자는 구성원의 개인정보를 서비스 목적 외로 활용하거나 제3자에게 무단 제공하여서는 안 됩니다.</li>
            <li>소유자가 본 조의 의무를 위반하여 발생하는 법적 책임은 소유자에게 있습니다.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">
            제12조 (개인정보의 안전성 확보 조치)
          </h2>
          <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>비밀번호의 암호화 저장 (bcrypt)</li>
            <li>SSL/TLS를 통한 데이터 전송 암호화</li>
            <li>인증 토큰의 httpOnly 쿠키 저장 (JavaScript 접근 차단)</li>
            <li>접근 권한 관리 (역할 기반 접근 제어: 소유자, 관리자, 학생)</li>
            <li>워크스페이스 간 데이터 격리</li>
            <li>접속 로그의 보관 및 위변조 방지</li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">제13조 (개인정보 보호책임자)</h2>
          <p>
            서비스는 개인정보 처리에 관한 업무를 총괄하고, 이용자의 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보
            보호책임자를 지정하고 있습니다:
          </p>
          <div className="rounded-radius-300 bg-components-fill-standard-secondary p-spacing-400">
            <ul className="flex list-disc flex-col gap-spacing-100 pl-spacing-500 text-footnote">
              <li>성명: 서승표</li>
              <li>직위: 운영자</li>
              <li>이메일: me@sspzoa.io</li>
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">제14조 (권익침해 구제 방법)</h2>
          <p>
            이용자는 개인정보 침해로 인한 구제를 받기 위하여 아래의 기관에 분쟁 해결이나 상담 등을 신청할 수 있습니다:
          </p>
          <ul className="flex list-disc flex-col gap-spacing-200 pl-spacing-500">
            <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
            <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
            <li>대검찰청 사이버수사과: (국번없이) 1301 (www.spo.go.kr)</li>
            <li>경찰청 사이버수사국: (국번없이) 182 (ecrm.police.go.kr)</li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">제15조 (개인정보처리방침의 변경)</h2>
          <ul className="flex list-decimal flex-col gap-spacing-200 pl-spacing-500">
            <li>
              본 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있습니다.
            </li>
            <li>변경 사항은 시행일자 7일 전부터 서비스 내에 공지합니다.</li>
            <li>이용자에게 불리한 변경의 경우 시행일자 30일 전부터 공지합니다.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-spacing-300">
          <h2 className="font-semibold text-content-standard-primary text-title">부칙</h2>
          <p>본 개인정보처리방침은 2026년 1월 24일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}
