"use client";

import Container from "@/shared/components/common/Container";
import Header from "@/shared/components/common/Header";
import { EmptyState } from "@/shared/components/ui/emptyState";

export default function MessagesPage() {
  return (
    <Container>
      <Header
        title="문자 관리"
        subtitle="학생 및 학부모에게 문자를 발송합니다"
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
      />
      <EmptyState message="문자 관리 기능은 준비 중입니다. 기대되죠?" />
    </Container>
  );
}
