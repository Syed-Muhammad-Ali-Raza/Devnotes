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


