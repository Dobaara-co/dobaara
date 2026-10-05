import type { IncomingMessage, ServerResponse } from 'http'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://www.dobaara.co'

const STATIC_PAGES = [
  { loc: '/',                  priority: '1.0', changefreq: 'daily'   },
  { loc: '/browse',            priority: '0.9', changefreq: 'hourly'  },
  { loc: '/how-it-works',      priority: '0.7', changefreq: 'monthly' },
  { loc: '/dobaara-verified',  priority: '0.7', changefreq: 'monthly' },
  { loc: '/size-guide',        priority: '0.6', changefreq: 'monthly' },
  { loc: '/selling-guide',     priority: '0.6', changefreq: 'monthly' },
  { loc: '/about',             priority: '0.6', changefreq: 'monthly' },
  { loc: '/faq',               priority: '0.5', changefreq: 'monthly' },
  { loc: '/contact',           priority: '0.5', changefreq: 'monthly' },
  { loc: '/returns',           priority: '0.4', changefreq: 'yearly'  },
  { loc: '/delivery',          priority: '0.4', changefreq: 'yearly'  },
  { loc: '/terms',             priority: '0.3', changefreq: 'yearly'  },
  { loc: '/privacy',           priority: '0.3', changefreq: 'yearly'  },
]

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function toDate(iso: string) {
  return iso.slice(0, 10)
}

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('is_active', true)
    .eq('is_sold', false)
    .order('updated_at', { ascending: false })

  const staticUrls = STATIC_PAGES.map(
    ({ loc, priority, changefreq }) => `
  <url>
    <loc>${esc(BASE_URL + loc)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join('')

  const listingUrls = (listings ?? []).map(
    ({ id, updated_at }: { id: string; updated_at: string }) => `
  <url>
    <loc>${esc(`${BASE_URL}/listing/${id}`)}</loc>
    <lastmod>${toDate(updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  ).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${listingUrls}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
  res.statusCode = 200
  res.end(xml)
}
