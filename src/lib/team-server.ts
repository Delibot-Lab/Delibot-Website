import { createClient } from "@/lib/supabase/server";
import { teamProfileSelect, type TeamProfile } from "@/lib/team";

export async function getPublicTeamProfiles(): Promise<TeamProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("team_profiles").select(teamProfileSelect).eq("is_public", true).order("sort_order").order("display_name");
  return (data ?? []) as unknown as TeamProfile[];
}
