import type { APIRoute } from 'astro';

interface CachedData {
  timestamp: number;
  data: any;
}

let inMemoryCache: CachedData | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const GET: APIRoute = async () => {
  const token =
    (typeof process !== 'undefined' && process.env?.GITHUB_TOKEN) ||
    import.meta.env?.GITHUB_TOKEN;

  if (!token) {
    return new Response(
      JSON.stringify({
        configured: false,
        message: 'No GITHUB_TOKEN environment variable configured.',
        username: 'Sanchit0307',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  }

  // Check in-memory cache
  if (inMemoryCache && Date.now() - inMemoryCache.timestamp < CACHE_TTL_MS) {
    return new Response(
      JSON.stringify({
        ...inMemoryCache.data,
        cached: true,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
        },
      }
    );
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
                weekday
              }
            }
            months {
              name
              year
              firstDay
              totalWeeks
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'SanchitPortfolioV2',
      },
      body: JSON.stringify({
        query,
        variables: { username: 'Sanchit0307' },
      }),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          configured: true,
          error: `GitHub GraphQL API returned HTTP ${res.status}`,
          username: 'Sanchit0307',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const json = await res.json();
    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      return new Response(
        JSON.stringify({
          configured: true,
          error: json.errors?.[0]?.message || 'Failed to retrieve contribution calendar data.',
          username: 'Sanchit0307',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const payload = {
      configured: true,
      calendar,
      refreshedAt: new Date().toISOString(),
      username: 'Sanchit0307',
    };

    inMemoryCache = {
      timestamp: Date.now(),
      data: payload,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        configured: true,
        error: err.message || 'Network exception while connecting to GitHub GraphQL.',
        username: 'Sanchit0307',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
