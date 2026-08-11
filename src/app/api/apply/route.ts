import { NextRequest, NextResponse } from "next/server";
import { sendApplicationEmail } from "@/lib/mail";
import { siteConfig } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const VALID_TEAMS: readonly string[] = siteConfig.recruitTeams.map(
  (team) => team.label
);

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const user = claims?.claims;
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const name = str(body?.name);
  const phone = str(body?.phone);
  const githubId = str(body?.githubId);
  const motivation = str(body?.motivation);
  const slackJoined = body?.slackJoined === true;
  const teams = Array.isArray(body?.teams)
    ? body.teams.filter(
        (t: unknown): t is string =>
          typeof t === "string" && VALID_TEAMS.includes(t)
      )
    : [];

  if (!name || !phone || !githubId || teams.length === 0 || !motivation) {
    return NextResponse.json(
      { error: "모든 항목을 입력해주세요." },
      { status: 400 }
    );
  }

  if (!slackJoined) {
    return NextResponse.json(
      { error: "Slack 가입 여부를 확인해주세요." },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("birthday")
    .eq("id", user.sub)
    .single();

  const { error: insertError } = await supabase.from("applications").insert({
    user_id: user.sub,
    name,
    phone,
    github_id: githubId,
    teams,
    motivation,
    slack_joined: slackJoined,
  });

  if (insertError) {
    const message =
      insertError.code === "23505"
        ? "이미 지원서를 제출했습니다."
        : "지원서를 저장하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await sendApplicationEmail({
      name,
      email: (user.email as string) ?? "",
      birthday: profile?.birthday ?? "",
      phone,
      githubId,
      teams,
      motivation,
      slackJoined,
    });
  } catch (err) {
    console.error("Failed to send application email:", err);
    // DB에는 이미 저장됐으니 이메일 발송 실패로 사용자에게 에러를 보여주지 않는다.
  }

  return NextResponse.json({ ok: true });
}
