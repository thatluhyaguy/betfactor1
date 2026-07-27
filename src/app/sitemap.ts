import { MetadataRoute } from 'next';
import matches from '@/data/matches.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://betfactor.co.ke';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${base}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const matchPages: MetadataRoute.Sitemap = matches.map((match) => ({
    url: `${base}/odds/${match.slug}`,
    lastModified: new Date(match.lastUpdated),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...matchPages];
}
