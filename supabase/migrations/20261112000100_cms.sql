begin;

create table if not exists public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'editor' check (role in ('owner','editor')),
  created_at timestamptz not null default now()
);
alter table public.cms_admins enable row level security;
revoke all on public.cms_admins from anon, authenticated;
grant select on public.cms_admins to authenticated;
create policy "Administrators can read their own membership" on public.cms_admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.cms_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.cms_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.cms_is_admin() from public;
grant execute on function public.cms_is_admin() to anon, authenticated;

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 160),
  path text unique not null,
  mime text not null check (mime in ('image/jpeg','image/png','image/webp','video/mp4','video/webm','application/pdf')),
  size bigint not null check (size > 0 and size <= 52428800),
  alt_text text not null check (char_length(alt_text) between 3 and 300),
  created_at timestamptz not null default now()
);
create table if not exists public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('update','media','document','vacancy')),
  title text not null check (char_length(title) between 3 and 160),
  summary text not null default '' check (char_length(summary) <= 600),
  body text not null default '' check (char_length(body) <= 16000),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  media_id uuid references public.cms_media(id) on delete restrict,
  location text not null default '',
  employment_type text not null default '',
  closing_date date,
  apply_email text not null default '',
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  check (status <> 'published' or kind not in ('media','document') or media_id is not null),
  check (status <> 'published' or kind <> 'vacancy' or (apply_email <> '' and body <> '' and location <> ''))
);
create index cms_entries_public on public.cms_entries(kind, published_at desc) where status = 'published';
create index cms_entries_media on public.cms_entries(media_id);
create table if not exists public.cms_company (
  id text primary key check (id in ('draft','published')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);
insert into public.cms_company(id) values ('draft'),('published') on conflict do nothing;
create table if not exists public.cms_activity (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  target text not null,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.cms_entries enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_company enable row level security;
alter table public.cms_activity enable row level security;
revoke all on public.cms_entries, public.cms_media, public.cms_company, public.cms_activity from anon, authenticated;
grant select on public.cms_entries, public.cms_media, public.cms_company to anon, authenticated;
grant insert, update, delete on public.cms_entries, public.cms_media to authenticated;
grant update on public.cms_company to authenticated;
grant select on public.cms_activity to authenticated;

create policy "Public can read published content" on public.cms_entries for select to anon, authenticated using (status = 'published' or public.cms_is_admin());
create policy "Only administrators can create content" on public.cms_entries for insert to authenticated with check (public.cms_is_admin());
create policy "Only administrators can edit content" on public.cms_entries for update to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());
create policy "Only administrators can remove content" on public.cms_entries for delete to authenticated using (public.cms_is_admin());
create policy "Public can read published company profile" on public.cms_company for select to anon, authenticated using (id = 'published' or public.cms_is_admin());
create policy "Only administrators can edit company profile" on public.cms_company for update to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());
create policy "Public can read media attached to published content" on public.cms_media for select to anon, authenticated using (
  public.cms_is_admin() or exists(select 1 from public.cms_entries where media_id = cms_media.id and status = 'published')
);
create policy "Only administrators can upload media" on public.cms_media for insert to authenticated with check (public.cms_is_admin());
create policy "Only administrators can edit media" on public.cms_media for update to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());
create policy "Only administrators can remove media" on public.cms_media for delete to authenticated using (public.cms_is_admin());
create policy "Only administrators can read activity" on public.cms_activity for select to authenticated using (public.cms_is_admin());

create or replace function public.cms_stamp_entry() returns trigger
language plpgsql set search_path = '' as $$
declare file_type text;
begin
  if new.media_id is not null then
    select mime into file_type from public.cms_media where id = new.media_id;
    if new.kind = 'document' and file_type <> 'application/pdf' then raise exception 'PDF required'; end if;
    if new.kind in ('media','update') and file_type not like 'image/%' and file_type not like 'video/%' then raise exception 'Image or video required'; end if;
  end if;
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.revision := old.revision + 1;
    new.created_at := old.created_at;
    new.published_at := case when new.status = 'published' then coalesce(old.published_at, now()) else null end;
  else
    new.revision := 1;
    new.created_at := now();
    new.published_at := case when new.status = 'published' then now() else null end;
  end if;
  return new;
end;
$$;
create trigger cms_entry_stamp before insert or update on public.cms_entries for each row execute function public.cms_stamp_entry();

create or replace function public.cms_record_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
declare row_data jsonb;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  insert into public.cms_activity(actor, action, target, title)
    values (auth.uid(), lower(tg_op), tg_table_name, coalesce(row_data->>'title', row_data->>'name', 'Company profile · ' || (row_data->>'id')));
  return null;
end;
$$;
revoke all on function public.cms_record_activity() from public, anon, authenticated;
create trigger cms_entries_activity after insert or update or delete on public.cms_entries for each row execute function public.cms_record_activity();
create trigger cms_media_activity after insert or update or delete on public.cms_media for each row execute function public.cms_record_activity();
create trigger cms_company_activity after update on public.cms_company for each row execute function public.cms_record_activity();

create or replace function public.cms_save_company(expected_revision integer, content jsonb, publish_now boolean)
returns void language plpgsql security invoker set search_path = '' as $$
declare current_revision integer;
begin
  if not public.cms_is_admin() then raise exception 'Administrator access required'; end if;
  select revision into current_revision from public.cms_company where id = 'draft' for update;
  if current_revision is distinct from expected_revision then raise exception 'revision_conflict'; end if;
  update public.cms_company set content = cms_save_company.content, revision = revision + 1, updated_at = now() where id = 'draft';
  if publish_now then
    update public.cms_company set content = cms_save_company.content, revision = revision + 1, updated_at = now() where id = 'published';
  end if;
end;
$$;
revoke all on function public.cms_save_company(integer,jsonb,boolean) from public;
grant execute on function public.cms_save_company(integer,jsonb,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('company-media','company-media',false,52428800,array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm'])
on conflict(id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "Administrators can upload company files" on storage.objects for insert to authenticated
  with check(bucket_id = 'company-media' and public.cms_is_admin() and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Company files are readable only when published or by administrators" on storage.objects for select to anon, authenticated
  using(bucket_id = 'company-media' and (public.cms_is_admin() or exists(
    select 1 from public.cms_media m join public.cms_entries e on e.media_id = m.id
    where m.path = storage.objects.name and e.status = 'published'
  )));
create policy "Administrators can remove unused company files" on storage.objects for delete to authenticated
  using(bucket_id = 'company-media' and public.cms_is_admin() and not exists(
    select 1 from public.cms_media m join public.cms_entries e on e.media_id = m.id where m.path = storage.objects.name
  ));

-- Boundaries also apply if this project already has broad permissive Storage
-- policies for another application. Other buckets retain their own policies.
create policy "Company file read boundary" on storage.objects as restrictive for select to anon, authenticated
  using(bucket_id <> 'company-media' or public.cms_is_admin() or exists(
    select 1 from public.cms_media m join public.cms_entries e on e.media_id = m.id
    where m.path = storage.objects.name and e.status = 'published'
  ));
create policy "Company file upload boundary" on storage.objects as restrictive for insert to anon, authenticated
  with check(bucket_id <> 'company-media' or (
    public.cms_is_admin() and (storage.foldername(name))[1] = (select auth.uid())::text
  ));
create policy "Company files are immutable" on storage.objects as restrictive for update to anon, authenticated
  using(bucket_id <> 'company-media') with check(bucket_id <> 'company-media');
create policy "Company file deletion boundary" on storage.objects as restrictive for delete to anon, authenticated
  using(bucket_id <> 'company-media' or (public.cms_is_admin() and not exists(
    select 1 from public.cms_media m join public.cms_entries e on e.media_id = m.id where m.path = storage.objects.name
  )));

commit;
