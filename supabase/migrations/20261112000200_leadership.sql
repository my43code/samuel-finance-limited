begin;

create table if not exists public.cms_leadership (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  role text not null check (char_length(trim(role)) between 2 and 120),
  bio text not null default '' check (char_length(bio) <= 1200),
  media_id uuid references public.cms_media(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0 check (sort_order between 0 and 999),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists cms_leadership_public
  on public.cms_leadership(status, sort_order, created_at)
  where status = 'published';
create index if not exists cms_leadership_media on public.cms_leadership(media_id);

alter table public.cms_leadership enable row level security;
revoke all on public.cms_leadership from anon, authenticated;
grant select on public.cms_leadership to anon, authenticated;
grant insert, update, delete on public.cms_leadership to authenticated;

create policy "Public can read published leadership"
  on public.cms_leadership for select to anon, authenticated
  using (status = 'published' or public.cms_is_admin());
create policy "Only administrators can create leadership"
  on public.cms_leadership for insert to authenticated
  with check (public.cms_is_admin());
create policy "Only administrators can edit leadership"
  on public.cms_leadership for update to authenticated
  using (public.cms_is_admin()) with check (public.cms_is_admin());
create policy "Only administrators can remove leadership"
  on public.cms_leadership for delete to authenticated
  using (public.cms_is_admin());

create or replace function public.cms_stamp_leadership() returns trigger
language plpgsql set search_path = '' as $$
declare file_type text;
begin
  if new.media_id is not null then
    select mime into file_type from public.cms_media where id = new.media_id;
    if file_type is null or file_type not like 'image/%' then
      raise exception 'Leadership profiles require an image';
    end if;
  end if;
  new.name := trim(new.name);
  new.role := trim(new.role);
  new.bio := trim(new.bio);
  if tg_op = 'UPDATE' then
    new.revision := old.revision + 1;
    new.created_at := old.created_at;
    new.published_at := case when new.status = 'published' then coalesce(old.published_at, now()) else null end;
  else
    new.revision := 1;
    new.created_at := now();
    new.published_at := case when new.status = 'published' then now() else null end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger cms_leadership_stamp
  before insert or update on public.cms_leadership
  for each row execute function public.cms_stamp_leadership();

create trigger cms_leadership_activity
  after insert or update or delete on public.cms_leadership
  for each row execute function public.cms_record_activity();

create policy "Public can read media attached to published leadership"
  on public.cms_media for select to anon, authenticated
  using (
    public.cms_is_admin() or exists(
      select 1 from public.cms_leadership l
      where l.media_id = cms_media.id and l.status = 'published'
    )
  );

drop policy if exists "Company files are readable only when published or by administrators" on storage.objects;
create policy "Company files are readable only when published or by administrators"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'company-media' and (
    public.cms_is_admin() or exists(
      select 1 from public.cms_media m
      where m.path = storage.objects.name and (
        exists(select 1 from public.cms_entries e where e.media_id = m.id and e.status = 'published')
        or exists(select 1 from public.cms_leadership l where l.media_id = m.id and l.status = 'published')
      )
    )
  ));

drop policy if exists "Company file read boundary" on storage.objects;
create policy "Company file read boundary"
  on storage.objects as restrictive for select to anon, authenticated
  using (bucket_id <> 'company-media' or public.cms_is_admin() or exists(
    select 1 from public.cms_media m
    where m.path = storage.objects.name and (
      exists(select 1 from public.cms_entries e where e.media_id = m.id and e.status = 'published')
      or exists(select 1 from public.cms_leadership l where l.media_id = m.id and l.status = 'published')
    )
  ));

drop policy if exists "Company file deletion boundary" on storage.objects;
create policy "Company file deletion boundary"
  on storage.objects as restrictive for delete to anon, authenticated
  using (bucket_id <> 'company-media' or (
    public.cms_is_admin() and not exists(
      select 1 from public.cms_media m
      where m.path = storage.objects.name and (
        exists(select 1 from public.cms_entries e where e.media_id = m.id)
        or exists(select 1 from public.cms_leadership l where l.media_id = m.id)
      )
    )
  ));

commit;
