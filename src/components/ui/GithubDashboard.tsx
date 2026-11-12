import React, { useEffect, useState } from 'react';
import { initScrollAnimations } from '../../scripts/scrollAnimations';

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
}

interface UserProfile {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string | null;
}

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
  weekday: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionMonth {
  name: string;
  year: number;
  firstDay: string;
  totalWeeks: number;
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
  months: ContributionMonth[];
}

export default function GithubDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [languages, setLanguages] = useState<{ name: string; count: number; percentage: number }[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [totalForks, setTotalForks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contributions state
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);
  const [contributionsConfigured, setContributionsConfigured] = useState<boolean | null>(null);
  const [contributionsError, setContributionsError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      const cacheKey = 'gh_data_Sanchit0307_v2';
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 1000 * 60 * 15) {
            setProfile(parsed.profile);
            setRepos(parsed.repos);
            setLanguages(parsed.languages);
            setTotalStars(parsed.totalStars);
            setTotalForks(parsed.totalForks);
            setCalendar(parsed.calendar);
            setContributionsConfigured(parsed.contributionsConfigured);
            setLoading(false);
            setTimeout(() => initScrollAnimations(), 60);
            return;
          }
        } catch {
          sessionStorage.removeItem(cacheKey);
        }
      }

      try {
        // Fetch Public GitHub REST data & Server Contributions API in parallel
        const [userRes, reposRes, contribRes] = await Promise.all([
          fetch('https://api.github.com/users/Sanchit0307', {
            headers: { Accept: 'application/vnd.github.v3+json' },
          }),
          fetch('https://api.github.com/users/Sanchit0307/repos?sort=updated&per_page=30', {
            headers: { Accept: 'application/vnd.github.v3+json' },
          }),
          fetch('/api/contributions.json'),
        ]);

        if (userRes.status === 403 || reposRes.status === 403) {
          throw new Error('GitHub API rate limit reached (60 req/hr). Please visit the GitHub profile directly.');
        }

        if (!userRes.ok || !reposRes.ok) {
          throw new Error(`Failed to load GitHub data (HTTP ${userRes.status}/${reposRes.status})`);
        }

        const userData: UserProfile = await userRes.json();
        const reposData: Repo[] = await reposRes.json();

        // Parse contribution response
        let calendarData: ContributionCalendar | null = null;
        let isConfigured = false;
        if (contribRes.ok) {
          const contribJson = await contribRes.json();
          if (contribJson.configured && contribJson.calendar) {
            calendarData = contribJson.calendar;
            isConfigured = true;
          } else if (contribJson.configured === false) {
            isConfigured = false;
          } else if (contribJson.error) {
            setContributionsError(contribJson.error);
          }
        }

        // Calculate language distribution
        const langCounts: Record<string, number> = {};
        let totalLangRepos = 0;
        let stars = 0;
        let forks = 0;

        reposData.forEach((repo) => {
          stars += repo.stargazers_count;
          forks += repo.forks_count;
          if (repo.language) {
            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
            totalLangRepos++;
          }
        });

        const langArray = Object.entries(langCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / (totalLangRepos || 1)) * 100),
          }))
          .sort((a, b) => b.count - a.count);

        setProfile(userData);
        setRepos(reposData);
        setLanguages(langArray);
        setTotalStars(stars);
        setTotalForks(forks);
        setCalendar(calendarData);
        setContributionsConfigured(isConfigured);
        setTimeout(() => initScrollAnimations(), 60);

        // Cache in session storage
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            profile: userData,
            repos: reposData,
            languages: langArray,
            totalStars: stars,
            totalForks: forks,
            calendar: calendarData,
            contributionsConfigured: isConfigured,
          })
        );
      } catch (err: any) {
        setError(err.message || 'Unable to fetch engineering data.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-[#ebedf0] dark:bg-[#161b22] border border-[var(--color-border)]/40';
    if (count <= 2) return 'bg-[#9be9a8] dark:bg-[#0e4429]';
    if (count <= 5) return 'bg-[#40c463] dark:bg-[#006d32]';
    if (count <= 9) return 'bg-[#30a14e] dark:bg-[#26a641]';
    return 'bg-[#216e39] dark:bg-[#39d353]';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]" />
          ))}
        </div>
        <div className="h-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>GitHub API Notice</span>
        </div>
        <p className="text-sm text-[var(--color-secondary)] leading-relaxed">
          {error}
        </p>
        <div className="pt-2">
          <a
            href="https://github.com/Sanchit0307"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs"
          >
            <span>View Profile Directly on GitHub</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in">
      {/* Section A: Overview Metrics */}
      <section className="space-y-4" data-animate="stagger">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div data-animate-item className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs hover:border-[var(--color-primary)]/30 transition-colors">
            <span className="text-xs sm:text-[13px] text-[var(--color-secondary)] font-mono block">Public Repositories</span>
            <span className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-primary)] mt-1.5 block">
              {profile?.public_repos ?? repos.length}
            </span>
          </div>

          <div data-animate-item className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs hover:border-[var(--color-primary)]/30 transition-colors">
            <span className="text-xs sm:text-[13px] text-[var(--color-secondary)] font-mono block">Total Stars</span>
            <span className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-primary)] mt-1.5 block">
              {totalStars}
            </span>
          </div>

          <div data-animate-item className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs hover:border-[var(--color-primary)]/30 transition-colors">
            <span className="text-xs sm:text-[13px] text-[var(--color-secondary)] font-mono block">Total Forks</span>
            <span className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-primary)] mt-1.5 block">
              {totalForks}
            </span>
          </div>

          <div data-animate-item className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs hover:border-[var(--color-primary)]/30 transition-colors">
            <span className="text-xs sm:text-[13px] text-[var(--color-secondary)] font-mono block">Languages Used</span>
            <span className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-primary)] mt-1.5 block">
              {languages.length}
            </span>
          </div>
        </div>
      </section>

      {/* Section B: Genuine GitHub Contribution Heatmap */}
      <section data-animate="fade-up" className="p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-normal tracking-tight text-[var(--color-primary)] flex items-center gap-2">
              <span>Contribution Activity</span>
              {calendar && (
                <span className="chip text-xs font-mono px-2.5 py-0.5">
                  {calendar.totalContributions} contributions in the last 12 months
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-[13px] text-[var(--color-secondary)]">
              Refreshed periodically via official GitHub GraphQL API.
            </p>
          </div>

          <a
            href="https://github.com/Sanchit0307"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs sm:text-sm shrink-0 self-start sm:self-auto"
          >
            <span>GitHub Profile</span>
            <span className="text-xs">↗</span>
          </a>
        </div>

        {contributionsConfigured && calendar ? (
          <div className="space-y-4">
            {/* Heatmap Tooltip readout */}
            <div className="h-5 text-xs font-mono text-[var(--color-secondary)] flex items-center justify-between">
              <span>
                {hoveredDay ? (
                  <strong className="text-[var(--color-primary)]">
                    {hoveredDay.count} contribution{hoveredDay.count === 1 ? '' : 's'} on {formatDate(hoveredDay.date)}
                  </strong>
                ) : (
                  'Hover over any day to inspect contribution counts.'
                )}
              </span>

              {/* Legend */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
                <span>Less</span>
                <span className="w-3 h-3 rounded-[2px] bg-[#ebedf0] dark:bg-[#161b22] border border-[var(--color-border)]/50" />
                <span className="w-3 h-3 rounded-[2px] bg-[#9be9a8] dark:bg-[#0e4429]" />
                <span className="w-3 h-3 rounded-[2px] bg-[#40c463] dark:bg-[#006d32]" />
                <span className="w-3 h-3 rounded-[2px] bg-[#30a14e] dark:bg-[#26a641]" />
                <span className="w-3 h-3 rounded-[2px] bg-[#216e39] dark:bg-[#39d353]" />
                <span>More</span>
              </div>
            </div>

            {/* Scrollable Heatmap Grid */}
            <div className="overflow-x-auto pb-3 pt-1">
              <div className="min-w-[760px] select-none">
                {/* Month labels */}
                <div className="flex text-[11px] font-mono text-[var(--color-secondary)] pl-8 mb-1.5 gap-[12px]">
                  {calendar.months.map((m, idx) => (
                    <span key={idx} style={{ width: `${Math.max(m.totalWeeks * 14, 28)}px` }} className="truncate">
                      {m.name}
                    </span>
                  ))}
                </div>

                {/* Day Grid with Weekday Labels */}
                <div className="flex gap-1 items-start">
                  {/* Weekday indicators (Mon, Wed, Fri) aligned 1:1 with grid rows */}
                  <div className="flex flex-col gap-[3.5px] pr-2 text-[10px] font-mono text-[var(--color-secondary)]/70 text-right w-6 shrink-0 select-none">
                    <span className="w-full h-3 sm:h-3.5 invisible" aria-hidden="true">Sun</span>
                    <span className="w-full h-3 sm:h-3.5 flex items-center justify-end">Mon</span>
                    <span className="w-full h-3 sm:h-3.5 invisible" aria-hidden="true">Tue</span>
                    <span className="w-full h-3 sm:h-3.5 flex items-center justify-end">Wed</span>
                    <span className="w-full h-3 sm:h-3.5 invisible" aria-hidden="true">Thu</span>
                    <span className="w-full h-3 sm:h-3.5 flex items-center justify-end">Fri</span>
                    <span className="w-full h-3 sm:h-3.5 invisible" aria-hidden="true">Sat</span>
                  </div>

                  {/* 53 Columns of Weeks */}
                  <div className="flex gap-[3.5px]">
                    {calendar.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3.5px]">
                        {week.contributionDays.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            onMouseEnter={() => setHoveredDay({ date: day.date, count: day.contributionCount })}
                            onMouseLeave={() => setHoveredDay(null)}
                            title={`${day.contributionCount} contributions on ${formatDate(day.date)}`}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] cursor-pointer transition-transform hover:scale-125 ${getIntensityClass(
                              day.contributionCount
                            )}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Clear Setup Instructions if no token configured */
          <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] space-y-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--color-primary)]">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>GitHub Contribution Graph — Server-Side Setup</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-secondary)] leading-relaxed max-w-3xl">
              To render genuine live contribution calendar data over the last 12 months, the GitHub GraphQL API requires an authenticated server-side token.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-1">
              <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1.5">
                <span className="font-semibold text-[var(--color-primary)] block">Local Development (.env.local)</span>
                <code className="text-[11px] block text-[var(--color-secondary)] select-all">
                  GITHUB_TOKEN=ghp_yourPersonalAccessToken
                </code>
              </div>

              <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1.5">
                <span className="font-semibold text-[var(--color-primary)] block">Production (Vercel)</span>
                <span className="text-[11px] text-[var(--color-secondary)] block">
                  Project Settings &gt; Environment Variables &gt; Add GITHUB_TOKEN
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href="https://github.com/Sanchit0307"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                <span>View Contribution Activity on GitHub</span>
                <span className="text-[10px]">↗</span>
              </a>
              <span className="text-[11px] text-[var(--color-secondary)] font-mono">
                No simulated data substituted
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Section C: Language Distribution */}
      {languages.length > 0 && (
        <section data-animate="fade-up" className="space-y-5 p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-normal tracking-tight text-[var(--color-primary)]">
              Language Distribution
            </h2>
            <span className="text-xs sm:text-[13px] font-mono text-[var(--color-secondary)]">
              Based on active public repositories
            </span>
          </div>

          {/* Stacked Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--color-muted)]">
            {languages.map((l, i) => {
              const colors = ['#3178C6', '#F7DF1E', '#E34F26', '#3572A5', '#61DAFB', '#5FA04E'];
              const color = colors[i % colors.length];
              return (
                <div
                  key={l.name}
                  style={{ width: `${l.percentage}%`, backgroundColor: color }}
                  title={`${l.name}: ${l.percentage}% (${l.count} repos)`}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-5 pt-1 text-xs sm:text-[13px]">
            {languages.map((l, i) => {
              const colors = ['#3178C6', '#F7DF1E', '#E34F26', '#3572A5', '#61DAFB', '#5FA04E'];
              const color = colors[i % colors.length];
              return (
                <div key={l.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[var(--color-primary)] font-medium">{l.name}</span>
                  <span className="text-[var(--color-secondary)] font-mono text-xs">{l.percentage}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section D: Recently Updated Repositories (3 Columns on Desktop) */}
      <section className="space-y-6" data-animate="stagger">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-[var(--color-primary)]">
              Featured Public Repositories
            </h2>
            <p className="text-xs sm:text-[13px] text-[var(--color-secondary)] mt-0.5">
              Live repository metrics synchronized via GitHub API.
            </p>
          </div>
          <a
            href="https://github.com/Sanchit0307?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-1"
          >
            <span>All Repositories</span>
            <span>↗</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {repos.slice(0, 6).map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              data-animate-item
              className="group block p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 transition-all shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base sm:text-[17px] font-medium text-[var(--color-primary)] group-hover:underline truncate">
                    {repo.name}
                  </span>
                  <span className="text-xs sm:text-sm text-[var(--color-secondary)] group-hover:text-[var(--color-primary)] transition-colors shrink-0">
                    ↗
                  </span>
                </div>

                <p className="text-sm sm:text-[15px] text-[var(--color-secondary)] mt-2.5 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {repo.description || 'Public GitHub repository by Sanchit Marwah.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-[13px] text-[var(--color-secondary)] font-mono mt-5 pt-3.5 border-t border-[var(--color-border)]/60">
                <div className="flex items-center gap-3">
                  {repo.language && (
                    <span className="flex items-center gap-1.5 text-[var(--color-primary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                      <span>{repo.language}</span>
                    </span>
                  )}
                  <span>★ {repo.stargazers_count}</span>
                  <span>⑂ {repo.forks_count}</span>
                </div>
                <span>
                  Updated {new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
