import { createServerSupabase } from '@/lib/supabaseServer'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createServerSupabase()

  const { data: posts } = await supabase
    .from('posts')
    .select('title, slug, content_md, published_at, profiles(username)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  const itemsXml = (posts || [])
    .map((post) => {
      const cleanDesc = post.content_md
        .replace(/[#*`_\[\]]/g, '')
        .slice(0, 200) + '...'
      const postUrl = `${baseUrl}/posts/${post.slug}`
      const author = (post.profiles as any)?.username || 'unknown'

      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${postUrl}</link>
          <guid>${postUrl}</guid>
          <pubDate>${new Date(post.published_at || Date.now()).toUTCString()}</pubDate>
          <description><![CDATA[${cleanDesc}]]></description>
          <dc:creator><![CDATA[@${author}]]></dc:creator>
        </item>
      `
    })
    .join('')

  const feedXml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <channel>
        <title>Devnotes</title>
        <link>${baseUrl}</link>
        <description>A curated collection of developer experiences and stories.</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${itemsXml}
      </channel>
    </rss>
  `

  return new Response(feedXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
