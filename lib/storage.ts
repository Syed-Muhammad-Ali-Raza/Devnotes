const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function isCoverMime(mime: string): boolean {
  return (ALLOWED_COVER_TYPES as readonly string[]).includes(mime)
}

export function isAvatarMime(mime: string): boolean {
  return (ALLOWED_AVATAR_TYPES as readonly string[]).includes(mime)
}

function extensionFor(mime: string): string {
  return EXT_BY_MIME[mime] ?? 'png'
}

// Covers: {author_id}/{post_id}-cover.{ext}
export function coverPath(authorId: string, postId: string, mime: string): string {
  return `${authorId}/${postId}-cover.${extensionFor(mime)}`
}

// Avatars: {user_id}/avatar.{ext} — fixed name so uploads overwrite in place
export function avatarPath(userId: string, mime: string): string {
  return `${userId}/avatar.${extensionFor(mime)}`
}

export function objectMime(file: File): string {
  return file.type || 'application/octet-stream'
}
