create table if not exists public.team_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  role_ko text not null default '',
  role_en text not null default '',
  teams text[] not null default '{}',
  bio_ko text not null default '',
  bio_en text not null default '',
  skills text[] not null default '{}',
  avatar_url text,
  contact_email text,
  orcid text,
  linkedin_url text,
  github_url text,
  website_url text,
  is_public boolean not null default false,
  sort_order integer not null default 100,
  updated_at timestamptz not null default now(),
  constraint team_profiles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint team_profiles_slug_length check (char_length(slug) between 3 and 48),
  constraint team_profiles_display_name_length check (char_length(display_name) between 1 and 80),
  constraint team_profiles_bio_ko_length check (char_length(bio_ko) <= 1200),
  constraint team_profiles_bio_en_length check (char_length(bio_en) <= 1200)
);

-- 이전 버전의 초안을 먼저 실행했더라도 복수 팀 필드를 추가한다.
alter table public.team_profiles add column if not exists teams text[] not null default '{}';
alter table public.team_profiles add column if not exists contact_email text;

alter table public.team_profiles enable row level security;

grant select on public.team_profiles to anon, authenticated;
grant insert, update, delete on public.team_profiles to authenticated;

drop policy if exists "Public team profiles are readable" on public.team_profiles;
create policy "Public team profiles are readable"
on public.team_profiles for select
to anon, authenticated
using (is_public = true or (select auth.uid()) = user_id);

drop policy if exists "Members can create their own team profile" on public.team_profiles;
create policy "Members can create their own team profile"
on public.team_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Members can update their own team profile" on public.team_profiles;
create policy "Members can update their own team profile"
on public.team_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Members can delete their own team profile" on public.team_profiles;
create policy "Members can delete their own team profile"
on public.team_profiles for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists team_profiles_public_order_idx
on public.team_profiles (is_public, sort_order, display_name);

-- 기존 회원은 이름·사진·지원 팀을 가져와 기본 공개 프로필을 만든다.
insert into public.team_profiles (user_id, slug, display_name, teams, avatar_url, is_public)
select
  p.id,
  'member-' || left(replace(p.id::text, '-', ''), 12),
  p.name,
  coalesce(a.teams, '{}'),
  p.avatar_url,
  true
from public.profiles p
left join public.applications a on a.user_id = p.id
on conflict (user_id) do update set
  display_name = excluded.display_name,
  teams = case when cardinality(public.team_profiles.teams) = 0 then excluded.teams else public.team_profiles.teams end,
  avatar_url = coalesce(public.team_profiles.avatar_url, excluded.avatar_url);

-- 신규 가입 시 기본 팀 프로필을 자동 생성한다.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.create_team_profile_for_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.team_profiles (user_id, slug, display_name, avatar_url, is_public)
  values (
    new.id,
    'member-' || left(replace(new.id::text, '-', ''), 12),
    new.name,
    new.avatar_url,
    true
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.create_team_profile_for_member() from public, anon, authenticated;

drop trigger if exists create_team_profile_after_profile_insert on public.profiles;
create trigger create_team_profile_after_profile_insert
after insert on public.profiles
for each row execute function private.create_team_profile_for_member();

-- 지원 분야를 제출하거나 바꾸면 공개 프로필의 소속 팀도 동기화한다.
create or replace function private.sync_team_profile_teams()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.team_profiles
  set teams = coalesce(new.teams, '{}'), updated_at = now()
  where user_id = new.user_id;
  return new;
end;
$$;

revoke all on function private.sync_team_profile_teams() from public, anon, authenticated;

drop trigger if exists sync_team_profile_after_application_change on public.applications;
create trigger sync_team_profile_after_application_change
after insert or update of teams on public.applications
for each row execute function private.sync_team_profile_teams();
