import type { NotificationRow } from '@/lib/types'

export function notificationCopy(item: NotificationRow): string {
  const actor = item.actor?.username ? `@${item.actor.username}` : 'Someone'
  if (item.type === 'like') return `${actor} liked ${item.post?.title || 'your story'}`
  if (item.type === 'comment') return `${actor} commented on ${item.post?.title || 'your story'}`
  if (item.type === 'reply') return `${actor} replied to your comment`
  return `${actor} started following you`
}
