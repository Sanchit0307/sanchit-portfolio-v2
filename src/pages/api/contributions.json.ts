import type { APIRoute } from 'astro';

interface CachedData {
  timestamp: number;
  data: any;
}

let inMemoryCache: CachedData | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const USERNAME = 'Sanchit0307';

async function fetchFromGraphQL(token: string) {
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

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'SanchitPortfolioV2',
    },
    body: JSON.stringify({
      query,
      variables: { username: USERNAME },
    }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}`);
  }

  const json = await res.json();
  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error(json.errors?.[0]?.message || 'No calendar in GraphQL payload');
  }

  return calendar;
}

async function fetchFromPublicProfile() {
  const url = `https://github.com/users/${USERNAME}/contributions`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!res.ok) {
    throw new Error(`Public profile HTTP ${res.status}`);
  }

  const html = await res.text();

  // Parse total contributions from heading e.g. "173 contributions in the last year"
  const h2Match = html.match(/<h2[^>]*class="[^"]*f4[^"]*"[^>]*>([\s\S]*?)<\/h2>/);
  let totalContributions = 0;
  if (h2Match) {
    const countMatch = h2Match[1].replace(/\s+/g, ' ').match(/([\d,]+)\s+contribution/i);
    if (countMatch) {
      totalContributions = parseInt(countMatch[1].replace(/,/g, ''), 10);
    }
  }

  // Parse tooltips for exact count
  const tooltips: Record<string, number> = {};
  const tooltipMatches = [...html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)];
  for (const match of tooltipMatches) {
    const id = match[1];
    const text = match[2].trim();
    if (text.startsWith('No contribution')) {
      tooltips[id] = 0;
    } else {
      const m = text.match(/^([\d,]+)\s+contribution/i);
      tooltips[id] = m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
    }
  }

  // Map each day
  const tdElements = [...html.matchAll(/<td\s+([^>]+)>/g)];
  const daysMap = new Map<
    string,
    { date: string; contributionCount: number; color: string; weekday: number }
  >();
  const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

  for (const m of tdElements) {
    const attrs = m[1];
    const dateMatch = attrs.match(/data-date="([^"]+)"/);
    const idMatch = attrs.match(/id="([^"]+)"/);
    const levelMatch = attrs.match(/data-level="([^"]+)"/);

    if (dateMatch && idMatch) {
      const date = dateMatch[1];
      const id = idMatch[1];
      const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;
      const count = tooltips[id] !== undefined ? tooltips[id] : 0;

      const d = new Date(date + 'T00:00:00Z');
      const weekday = d.getUTCDay(); // 0 is Sunday, 6 is Saturday

      daysMap.set(date, {
        date,
        contributionCount: count,
        color: colors[Math.min(level, 4)] || '#ebedf0',
        weekday,
      });
    }
  }

  if (daysMap.size === 0) {
    throw new Error('No contribution cells parsed from GitHub public profile');
  }

  // Group into Sunday-starting weeks
  const sortedDates = Array.from(daysMap.keys()).sort();
  const weeks: { contributionDays: any[] }[] = [];
  let currentWeek: any[] = [];

  for (const date of sortedDates) {
    const day = daysMap.get(date)!;
    if (day.weekday === 0 && currentWeek.length > 0) {
      weeks.push({ contributionDays: currentWeek });
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) {
    weeks.push({ contributionDays: currentWeek });
  }

  // Parse months from thead
  const months: { name: string; year: number; firstDay: string; totalWeeks: number }[] = [];
  const thead = html.match(/<thead[^>]*>([\s\S]*?)<\/thead>/);
  if (thead) {
    const colHeaders = [...thead[1].matchAll(/<td[^>]*colspan="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g)];
    colHeaders.forEach((ch) => {
      const colspan = parseInt(ch[1], 10);
      const labelMatch = ch[2].match(/<span[^>]*aria-hidden="true"[^>]*>([^<]+)<\/span>/);
      const name = labelMatch ? labelMatch[1].trim() : '';
      months.push({
        name,
        year: new Date().getFullYear(),
        firstDay: '',
        totalWeeks: colspan,
      });
    });
  }

  // Fallback recalculation of total contributions
  if (totalContributions === 0) {
    for (const day of daysMap.values()) {
      totalContributions += day.contributionCount;
    }
  }

  return {
    totalContributions,
    weeks,
    months,
  };
}

export const GET: APIRoute = async () => {
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

  const token =
    (typeof process !== 'undefined' && process.env?.GITHUB_TOKEN) ||
    import.meta.env?.GITHUB_TOKEN;

  let calendar: any = null;
  let method = 'none';

  // 1. Try GraphQL if token exists
  if (token) {
    try {
      calendar = await fetchFromGraphQL(token);
      method = 'graphql';
    } catch (err: any) {
      console.warn('GitHub GraphQL fetch failed, attempting public fallback:', err.message);
    }
  }

  // 2. Try Public GitHub contributions endpoint if GraphQL was not used or failed
  if (!calendar) {
    try {
      calendar = await fetchFromPublicProfile();
      method = 'public-calendar';
    } catch (err: any) {
      console.warn('GitHub public profile fetch failed:', err.message);
    }
  }

  if (calendar) {
    const payload = {
      configured: true,
      calendar,
      source: method,
      refreshedAt: new Date().toISOString(),
      username: USERNAME,
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
  }

  // If neither method could obtain data (e.g. offline/network issue)
  return new Response(
    JSON.stringify({
      configured: false,
      error: 'Unable to reach GitHub. Please verify network connectivity or configure GITHUB_TOKEN.',
      username: USERNAME,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    }
  );
};
