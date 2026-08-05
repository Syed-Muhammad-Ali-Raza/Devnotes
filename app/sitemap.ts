import { MetadataRoute } from 'next'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createServerSupabase()

  // Fetch all published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, published_at')
    .eq('status', 'published')

  const postUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.published_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch all public profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, created_at')

  const profileUrls = (profiles || []).map((profile) => ({
    url: `${baseUrl}/@${profile.username}`,
    lastModified: new Date(profile.created_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  // Fetch all tags
  const { data: tags } = await supabase
    .from('tags')
    .select('slug')

  const tagUrls = (tags || []).map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...postUrls,
    ...profileUrls,
    ...tagUrls,
  ]
}
