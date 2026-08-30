-- Run this in Supabase Dashboard -> SQL Editor
-- Sets up tables, indexes, and row-level security for the blog

-- USERS (Supabase already has auth.users; this is your public profile table)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now()
);

-- POSTS
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  content_md text not null,
  cover_image text,
  status text default 'draft' check (status in ('draft', 'published')),
  published_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index posts_slug_idx on public.posts (slug);
create index posts_status_idx on public.posts (status, published_at desc);

-- TAGS
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null
);

create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- COMMENTS
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- REACTIONS (likes)
create table public.reactions (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  type text default 'like',
  primary key (post_id, user_id)
);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;

-- Anyone can read published posts; only the author can read/write their drafts
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using (status = 'published' or auth.uid() = author_id);

create policy "Authors can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Authors can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Comments: anyone can read, logged-in users can write
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Logged-in users can comment"
  on public.comments for insert
  with check (auth.uid() = author_id);

-- Reactions: anyone can read, logged-in users can react
create policy "Reactions are viewable by everyone"
  on public.reactions for select
  using (true);

create policy "Logged-in users can react"
  on public.reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own reaction"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- Trigger to create a public profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Full-Text search indexer RPC function with ranking
create or replace function public.search_posts(search_query text)
returns table (
  id uuid,
  title text,
  slug text,
  content_md text,
  published_at timestamp with time zone,
  cover_image text,
  author_username text,
  author_avatar_url text
) as $$
begin
  return query
  select 
    p.id,
    p.title,
    p.slug,
    p.content_md,
    p.published_at,
    p.cover_image,
    pr.username as author_username,
    pr.avatar_url as author_avatar_url
  from public.posts p
  join public.profiles pr on p.author_id = pr.id
  where p.status = 'published'
    and (
      to_tsvector('english', p.title || ' ' || p.content_md) @@ websearch_to_tsquery('english', search_query)
      or p.title ilike '%' || search_query || '%'
      or pr.username ilike '%' || search_query || '%'
    )
  order by ts_rank(to_tsvector('english', p.title || ' ' || p.content_md), websearch_to_tsquery('english', search_query)) desc, p.published_at desc;
end;
$$ language plpgsql security definer;

-- =============================================================================
-- PHASE 4 — Community graph, notifications, view counts, live discussions
-- Safe to run on existing databases (IF NOT EXISTS / exception guards)
-- =============================================================================

alter table public.posts
  add column if not exists view_count integer not null default 0;

drop function if exists public.search_posts(text);
create function public.search_posts(search_query text)
returns table (
  id uuid,
  title text,
  slug text,
  content_md text,
  published_at timestamp with time zone,
  cover_image text,
  view_count integer,
  author_username text,
  author_avatar_url text
) as $$
begin
  return query
  select
    p.id,
    p.title,
    p.slug,
    p.content_md,
    p.published_at,
    p.cover_image,
    coalesce(p.view_count, 0) as view_count,
    pr.username as author_username,
    pr.avatar_url as author_avatar_url
  from public.posts p
  join public.profiles pr on p.author_id = pr.id
  where p.status = 'published'
    and (
      to_tsvector('english', p.title || ' ' || p.content_md) @@ websearch_to_tsquery('english', search_query)
      or p.title ilike '%' || search_query || '%'
      or pr.username ilike '%' || search_query || '%'
    )
  order by ts_rank(to_tsvector('english', p.title || ' ' || p.content_md), websearch_to_tsquery('english', search_query)) desc, p.published_at desc;
end;
$$ language plpgsql security definer;

create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists follows_following_id_idx on public.follows (following_id);
create index if not exists follows_follower_id_idx on public.follows (follower_id);

create table if not exists public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  primary key (user_id, post_id)
);

create index if not exists bookmarks_user_id_idx on public.bookmarks (user_id, created_at desc);

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'reply', 'follow')),
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read boolean not null default false,
  created_at timestamp with time zone default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id, read, created_at desc);

alter table public.follows enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Follows are viewable by everyone" on public.follows;
create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

drop policy if exists "Users can follow others" on public.follows;
create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow" on public.follows;
create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

drop policy if exists "Users can view their own bookmarks" on public.bookmarks;
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can bookmark posts" on public.bookmarks;
create policy "Users can bookmark posts"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove bookmarks" on public.bookmarks;
create policy "Users can remove bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view their notifications" on public.notifications;
create policy "Users can view their notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their notifications" on public.notifications;
create policy "Users can update their notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their notifications" on public.notifications;
create policy "Users can delete their notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create or replace function public.increment_post_views(target_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set view_count = coalesce(view_count, 0) + 1
  where id = target_post_id
    and status = 'published';
end;
$$;

grant execute on function public.increment_post_views(uuid) to anon, authenticated;
grant execute on function public.search_posts(text) to anon, authenticated;

create or replace function public.notify_on_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
begin
  select author_id into post_author from public.posts where id = new.post_id;
  if post_author is not null and post_author <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (post_author, new.user_id, 'like', new.post_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_reaction_created on public.reactions;
create trigger on_reaction_created
  after insert on public.reactions
  for each row execute procedure public.notify_on_like();

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
  parent_author uuid;
begin
  select author_id into post_author from public.posts where id = new.post_id;

  if new.parent_id is not null then
    select author_id into parent_author from public.comments where id = new.parent_id;
    if parent_author is not null and parent_author <> new.author_id then
      insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
      values (parent_author, new.author_id, 'reply', new.post_id, new.id);
    end if;
  end if;

  if post_author is not null
     and post_author <> new.author_id
     and post_author is distinct from parent_author then
    insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
    values (post_author, new.author_id, 'comment', new.post_id, new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_comment_created on public.comments;
create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.notify_on_comment();

create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$$;

drop trigger if exists on_follow_created on public.follows;
create trigger on_follow_created
  after insert on public.follows
  for each row execute procedure public.notify_on_follow();

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.comments;
exception
  when duplicate_object then null;
end $$;

-- =============================================================================
-- PHASE 5 — Media Desk: Supabase Storage covers & avatars
-- Safe to run on existing databases
-- =============================================================================

-- Public buckets only: `covers` and `avatars`. No generic `uploads` bucket.
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true),
       ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Cover objects live at {author_id}/{post_id}-cover.{ext}
create or replace function public.check_cover_upload()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Enforce path shape {author_id}/{post_id}-cover.{ext} and mime allow-list
  if new.bucket_id = 'covers' then
    if new.path_tokens is null
       or array_length(new.path_tokens, 1) <> 2
       or not (new.path_tokens[2] ~ '^[0-9a-f-]+-cover\.(jpe?g|png|webp)$')
       or lower(coalesce(new.mimetype, '')) not in ('image/jpeg', 'image/png', 'image/webp') then
      raise exception 'Invalid cover upload. Use {author_id}/{post_id}-cover.{jpg|png|webp}';
    end if;
  end if;
  return new;
end;
$$;

-- Avatar objects live at {user_id}/avatar.{ext} and overwrite in place
create or replace function public.check_avatar_upload()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.bucket_id = 'avatars' then
    if new.path_tokens is null
       or array_length(new.path_tokens, 1) <> 2
       or not (new.path_tokens[2] ~ '^avatar\.(jpe?g|png|webp)$')
       or lower(coalesce(new.mimetype, '')) not in ('image/jpeg', 'image/png', 'image/webp') then
      raise exception 'Invalid avatar upload. Use {user_id}/avatar.{jpg|png|webp}';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_cover_upload on storage.objects;
create trigger on_cover_upload
  before insert or update on storage.objects
  for each row execute procedure public.check_cover_upload();

drop trigger if exists on_avatar_upload on storage.objects;
create trigger on_avatar_upload
  before insert or update on storage.objects
  for each row execute procedure public.check_avatar_upload();

-- RLS on storage.objects for the two buckets.
-- The public/anonymous role may only read; authenticated users write to paths
-- whose first token is their own user id.

drop policy if exists "ST covers are viewable" on storage.objects;
create policy "ST covers are viewable"
  on storage.objects for select
  using (bucket_id = 'covers');

drop policy if exists "ST users upload their own covers" on storage.objects;
create policy "ST users upload their own covers"
  on storage.objects for insert
  with check (
    bucket_id = 'covers'
    and auth.uid()::text = coalesce(new.path_tokens[1], '')
  );

drop policy if exists "ST users update their own covers" on storage.objects;
create policy "ST users update their own covers"
  on storage.objects for update
  using (
    bucket_id = 'covers'
    and auth.uid()::text = coalesce((storage.foldername(name))[1], '')
  )
  with check (
    bucket_id = 'covers'
    and auth.uid()::text = coalesce(new.path_tokens[1], '')
  );

drop policy if exists "ST users delete their own covers" on storage.objects;
create policy "ST users delete their own covers"
  on storage.objects for delete
  using (
    bucket_id = 'covers'
    and auth.uid()::text = coalesce((storage.foldername(name))[1], '')
  );

drop policy if exists "ST avatars are viewable" on storage.objects;
create policy "ST avatars are viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "ST users upload their own avatars" on storage.objects;
create policy "ST users upload their own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = coalesce(new.path_tokens[1], '')
  );

drop policy if exists "ST users update their own avatars" on storage.objects;
create policy "ST users update their own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = coalesce((storage.foldername(name))[1], '')
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = coalesce(new.path_tokens[1], '')
  );

drop policy if exists "ST users delete their own avatars" on storage.objects;
create policy "ST users delete their own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = coalesce((storage.foldername(name))[1], '')
  );


