import { NextRequest, NextResponse } from "next/server";
import { sendApplicationEmail } from "@/lib/mail";
import { siteConfig } from "@/lib/site";

const VALID_TEAMS: readonly string[] = siteConfig.recruitTeams.map(
  (team) => team.label
);

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const name = str(body?.name);
  const studentId = str(body?.studentId);
  const phone = str(body?.phone);
  const motivation = str(body?.motivation);
  const teams = Array.isArray(body?.teams)
    ? body.teams.filter(
        (t: unknown): t is string =>
          typeof t === "string" && VALID_TEAMS.includes(t)
      )
    : [];

  if (!name || !studentId || !phone || teams.length === 0 || !motivation) {
    return NextResponse.json(
      { error: "모든 항목을 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    await sendApplicationEmail({ name, studentId, phone, teams, motivation });
  } catch (err) {
    console.error("Failed to send application email:", err);
    return NextResponse.json(
      { error: "지원서 전송에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
