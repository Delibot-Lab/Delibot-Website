import { type TeamProfile } from "@/lib/team";
import { apiFetch } from "@/lib/api-server";

export async function getPublicTeamProfiles(): Promise<TeamProfile[]> {
  try {
    const response = await apiFetch("/api/v1/team");
    return response.ok ? (await response.json()) as TeamProfile[] : [];
  } catch {
    return [];
  }
}
