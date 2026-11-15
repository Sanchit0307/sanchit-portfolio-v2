import type { APIRoute } from 'astro';
import fallbackCalendar from '../../data/contributions-fallback.json';

export const prerender = false;

interface CachedData {
  timestamp: number;
  data: any;
}

let inMemoryCache: CachedData | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes in-process cache

const USERNAME = 'Sanchit0307';

function getKolkataDateStrings() {
  const now = new Date();
  const kolkataFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayStr = kolkataFormatter.format(now); // e.g. "2026-11-16"

  // End of today in IST (UTC+05:30) as ISO-8601 for GraphQL $to
  const toDate = new Date(`${todayStr}T23:59:59.999+05:30`);
  const toIso = toDate.toISOString();

  // 364 days back so GraphQL does not exceed the maximum allowed 1-year window
  const fromDate = new Date(toDate.getTime() - 364 * 24 * 60 * 60 * 1000);
  const fromIso = fromDate.toISOString();

  return { todayStr, toIso, fromIso };
}

function padWeeks(weeks: { contributionDays: any[] }[]) {
  if (!weeks || weeks.length === 0) return weeks;

  // Pad first week if it starts after Sunday (weekday 0)
  if (weeks[0].contributionDays.length > 0) {
    const firstDay = weeks[0].contributionDays[0];
    if (firstDay.weekday > 0) {
      const placeholders = Array.from({ length: firstDay.weekday }, (_, i) => ({
        date: '',
        contributionCount: 0,
        color: '#ebedf0',
        weekday: i,
      }));
      weeks[0].contributionDays = [...placeholders, ...weeks[0].contributionDays];
    }
  }

  // Pad last week if it ends before Saturday (weekday 6)
  const lastWeek = weeks[weeks.length - 1];
  if (lastWeek && lastWeek.contributionDays.length > 0) {
    const lastDay = lastWeek.contributionDays[lastWeek.contributionDays.length - 1];
    if (lastDay.weekday < 6) {
      const placeholders = Array.from({ length: 6 - lastDay.weekday }, (_, i) => ({
        date: '',
        contributionCount: 0,
        color: '#ebedf0',
        weekday: lastDay.weekday + 1 + i,
      }));
      lastWeek.contributionDays = [...lastWeek.contributionDays, ...placeholders];
    }
  }

  return weeks;
}

async function fetchFromGraphQL(token: string, fromIso: string, toIso: string) {
  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
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
      variables: {
        username: USERNAME,
        from: fromIso,
        to: toIso,
      },
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

  calendar.weeks = padWeeks(calendar.weeks);

  return calendar;
}

async function fetchFromPublicProfile(todayStr: string) {
  const url = `https://github.com/users/${USERNAME}/contributions?to=${todayStr}`;
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

  // Parse total contributions from heading e.g. "210 contributions in 2026"
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

  // Pad first and last weeks for Sunday–Saturday 7-row alignment
  padWeeks(weeks);

  // Parse months from thead
  const months: { name: string; year: number; firstDay: string; totalWeeks: number }[] = [];
  const thead = html.match(/<thead[^>]*>([\s\S]*?)<\/thead>/);
  if (thead) {
    const colHeaders = [...thead[1].matchAll(/<td[^>]*colspan="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g)];
    const currentYear = parseInt(todayStr.split('-')[0], 10);
    colHeaders.forEach((ch) => {
      const colspan = parseInt(ch[1], 10);
      const labelMatch = ch[2].match(/<span[^>]*aria-hidden="true"[^>]*>([^<]+)<\/span>/);
      const name = labelMatch ? labelMatch[1].trim() : '';
      months.push({
        name,
        year: currentYear,
        firstDay: '',
        totalWeeks: colspan,
      });
    });
  }

  // Recalculate total if heading wasn't parsed
  let totalSum = 0;
  for (const w of weeks) {
    for (const d of w.contributionDays) {
      totalSum += d.contributionCount;
    }
  }
  if (totalContributions === 0) {
    totalContributions = totalSum;
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
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800, stale-if-error=86400',
        },
      }
    );
  }

  // Securely retrieve token only from process.env on server
  const token = typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : undefined;

  const { todayStr, toIso, fromIso } = getKolkataDateStrings();

  let calendar: any = null;
  let method = 'none';

  // 1. Try GraphQL if token exists with explicit Asia/Kolkata date range
  if (token) {
    try {
      calendar = await fetchFromGraphQL(token, fromIso, toIso);
      method = 'graphql';
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      console.warn('GitHub GraphQL fetch failed, attempting public fallback:', errMsg);
    }
  }

  // 2. Try Public GitHub contributions endpoint with explicit local 'to' date
  if (!calendar) {
    try {
      calendar = await fetchFromPublicProfile(todayStr);
      method = 'public-calendar';
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      console.warn('GitHub public profile fetch failed:', errMsg);
    }
  }

  // 3. Return fresh calendar if retrieved
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
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800, stale-if-error=86400',
      },
    });
  }

  // 4. If remote fetches failed, fall back to in-memory cache if available (stale)
  if (inMemoryCache) {
    return new Response(
      JSON.stringify({
        ...inMemoryCache.data,
        cached: true,
        stale: true,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300, stale-if-error=86400',
        },
      }
    );
  }

  // 5. If no in-memory cache exists (e.g. cold start during GitHub downtime),
  // fall back to bundled snapshot so users never get an empty contribution calendar
  if (fallbackCalendar && fallbackCalendar.totalContributions > 0) {
    const fallbackPayload = {
      configured: true,
      calendar: fallbackCalendar,
      source: 'bundled-fallback',
      refreshedAt: new Date().toISOString(),
      username: USERNAME,
      stale: true,
    };

    return new Response(JSON.stringify(fallbackPayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300, stale-if-error=86400',
      },
    });
  }

  // 6. Absolute catastrophic fallback (e.g. invalid build): Return 503 so CDN does NOT cache empty data
  return new Response(
    JSON.stringify({
      configured: false,
      error: 'Unable to reach GitHub. Please verify network connectivity or configure GITHUB_TOKEN.',
      username: USERNAME,
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
};
