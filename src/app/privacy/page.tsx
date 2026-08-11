import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보 안내",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-navy">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <section className="bg-bg py-16 md:py-24">
      <Container className="max-w-2xl">
        <h1 className="text-2xl font-bold text-navy">개인정보 안내</h1>
        <p className="mt-3 text-sm text-muted">
          {siteConfig.labName}은 학교 동아리가 운영하는 비영리 사이트예요. 정식 법률 문서가
          아니라, 이 사이트가 실제로 어떤 개인정보를 다루는지 있는 그대로 설명하는
          페이지입니다.
        </p>

        <Section title="회원가입 시 수집하는 정보">
          <p>학교 이메일, 비밀번호(암호화되어 저장되며 운영진도 볼 수 없어요), 이름, 생년월일.</p>
          <p>
            생년월일은 학번 대신 회원을 구분하는 용도로 사용해요 (학번은 졸업하면 사라지기
            때문이에요).
          </p>
        </Section>

        <Section title="동아리 지원 시 수집하는 정보">
          <p>연락처(전화번호), GitHub 아이디, 지원 분야, 자기소개(지원 동기).</p>
          <p>
            지원서 내용은 저장과 동시에 운영진 이메일({siteConfig.contactEmail})로도
            전달돼요.
          </p>
        </Section>

        <Section title="선택적으로 제공하는 정보">
          <p>프로필 사진 — 메신저에서 서로 알아보기 쉽도록 원하는 회원만 등록할 수 있어요.</p>
          <p>채팅 메시지와 첨부파일 — 같은 채널의 회원에게만 보여요.</p>
        </Section>

        <Section title="자동으로 삭제되는 경우">
          <p>
            가입 후 5시간 안에 동아리 지원서를 제출하지 않으면 계정과 입력한 정보가 자동으로
            삭제돼요.
          </p>
        </Section>

        <Section title="누가 볼 수 있나요">
          <p>일반 회원은 본인의 정보만 볼 수 있어요.</p>
          <p>
            관리자(운영진)는 회원 목록과 지원서 내용을 관리 목적으로 볼 수 있고, 필요하면
            계정을 삭제할 수 있어요.
          </p>
        </Section>

        <Section title="문의">
          <p>
            내 정보를 삭제하거나 궁금한 점이 있으면{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-medium text-mint-strong hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
            로 연락해주세요.
          </p>
        </Section>
      </Container>
    </section>
  );
}
