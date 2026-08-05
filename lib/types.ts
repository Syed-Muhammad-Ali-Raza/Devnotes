export type ProfileSummary = {
  username: string
  avatar_url: string | null
}

export type PostTagLink = {
  tags: { name: string; slug: string } | null
}

export type PostCardData = {
  slug: string
  title: string
  content_md: string
  published_at: string
  view_count?: number | null
  profiles: ProfileSummary | null
  post_tags?: PostTagLink[] | null
}

export type NotificationType = 'like' | 'comment' | 'reply' | 'follow'

export type NotificationRow = {
  id: string
  user_id: string
  actor_id: string | null
  type: NotificationType
  post_id: string | null
  comment_id: string | null
  read: boolean
  created_at: string
  actor: ProfileSummary | null
  post: { title: string; slug: string } | null
}
