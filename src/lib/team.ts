export type TeamProfile = {
  user_id: string;
  slug: string;
  display_name: string;
  role_ko: string;
  role_en: string;
  teams: string[];
  bio_ko: string;
  bio_en: string;
  skills: string[];
  avatar_url: string | null;
  contact_email: string | null;
  orcid: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  is_public: boolean;
  sort_order: number;
};

export const teamProfileSelect = "user_id, slug, display_name, role_ko, role_en, teams, bio_ko, bio_en, skills, avatar_url, contact_email, orcid, linkedin_url, github_url, website_url, is_public, sort_order";

export function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}
