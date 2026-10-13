import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { initials, safeExternalUrl, teamProfileSelect, type TeamProfile } from "@/lib/team";

export async function TeamProfileView({ slug, locale = "ko" }: { slug: string; locale?: "ko" | "en" }) {
  const en = locale === "en";
  const supabase = await createClient();
  const { data } = await supabase.from("team_profiles").select(teamProfileSelect).eq("slug", slug).eq("is_public", true).maybeSingle();
  if (!data) notFound();
  const member = data as unknown as TeamProfile;
  const links = [
    { label: member.contact_email ?? "", href: member.contact_email ? `mailto:${member.contact_email}` : null, icon: ExternalLink },
    { label: "GitHub", href: safeExternalUrl(member.github_url), icon: ExternalLink },
    { label: "LinkedIn", href: safeExternalUrl(member.linkedin_url), icon: ExternalLink },
    { label: en ? "Website" : "웹사이트", href: safeExternalUrl(member.website_url), icon: ExternalLink },
    { label: "ORCID", href: member.orcid && /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(member.orcid) ? `https://orcid.org/${member.orcid}` : null, icon: ExternalLink },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href));

  return (
    <article className="bg-[#f5f7f6] pb-24">
      <section className="relative min-h-[70svh] overflow-hidden bg-[#14201b] text-white">
        {member.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element -- 사용자 업로드 이미지의 호스트가 런타임에 결정된다.
          <img src={member.avatar_url} alt={member.display_name} className="absolute inset-0 h-full w-full object-cover opacity-55" />
        )}
        {!member.avatar_url && <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_60%_40%,#39775f,#111713_65%)] text-[28vw] font-black text-white/10">{initials(member.display_name)}</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111713] via-black/15 to-black/25" />
        <div className="relative mx-auto flex min-h-[70svh] max-w-7xl flex-col justify-end px-6 pb-14 md:px-10 md:pb-20">
          <Link href={en ? "/en#team" : "/#team"} className="absolute left-6 top-8 inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white md:left-10"><ArrowLeft className="h-4 w-4" />{en ? "Back to team" : "팀으로 돌아가기"}</Link>
          <p className="text-sm font-extrabold tracking-[.2em] text-[#7ce0b7]">{member.teams.join(" · ") || "DELIBOT LAB"}</p>
          <h1 className="mt-4 text-[clamp(4rem,10vw,9rem)] font-extrabold leading-[.86] tracking-[-.065em]">{member.display_name}</h1>
          <p className="mt-6 text-lg font-semibold text-white/72 md:text-2xl">{en ? member.role_en || member.role_ko : member.role_ko || member.role_en}</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1fr_2fr] md:px-10 md:py-28">
        <aside>
          <p className="text-xs font-extrabold tracking-[.18em] text-[#31ac7e]">PROFILE</p>
          <div className="mt-5 flex flex-wrap gap-2">{member.skills.map((skill) => <span key={skill} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#334139] shadow-sm">{skill}</span>)}</div>
          <div className="mt-8 flex flex-col items-start gap-3">{links.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#29332e] hover:text-[#1e9d70]"><Icon className="h-4 w-4" />{label}<ExternalLink className="h-3 w-3 opacity-50" /></a>)}</div>
        </aside>
        <section>
          <h2 className={`max-w-3xl text-3xl font-extrabold leading-tight tracking-[-.045em] text-[#1c2420] md:text-5xl ${en ? "" : "[word-break:keep-all]"}`}>{en ? "What I build, and why." : "제가 만들고 있는 것과, 만드는 이유."}</h2>
          <p className={`mt-8 whitespace-pre-line text-lg font-medium leading-[1.9] text-[#56625c] md:text-xl ${en ? "" : "[word-break:keep-all]"}`}>{(en ? member.bio_en || member.bio_ko : member.bio_ko || member.bio_en) || (en ? "This member is preparing their story." : "팀원이 소개를 준비하고 있습니다.")}</p>
        </section>
      </div>
    </article>
  );
}
