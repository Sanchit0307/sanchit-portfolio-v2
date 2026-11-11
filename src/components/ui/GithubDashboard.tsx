import React, { useEffect, useState } from 'react';

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

export default function GithubDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [languages, setLanguages] = useState<{ name: string; count: number; percentage: number }[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [totalForks, setTotalForks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGithubData() {
      const cacheKey = 'gh_data_Sanchit0307_v1';
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 1000 * 60 * 10) {
            setProfile(parsed.profile);
            setRepos(parsed.repos);
            setLanguages(parsed.languages);
            setTotalStars(parsed.totalStars);
            setTotalForks(parsed.totalForks);
            setLoading(false);
            return;
          }
        } catch {
          sessionStorage.removeItem(cacheKey);
        }
      }

      try {
        const [userRes, reposRes] = await Promise.all([
          fetch('https://api.github.com/users/Sanchit0307', {
            headers: { Accept: 'application/vnd.github.v3+json' },
          }),
          fetch('https://api.github.com/users/Sanchit0307/repos?sort=updated&per_page=30', {
            headers: { Accept: 'application/vnd.github.v3+json' },
          }),
        ]);

        if (userRes.status === 403 || reposRes.status === 403) {
          throw new Error('GitHub API rate limit reached (60 req/hr). Please visit the GitHub profile directly.');
        }

        if (!userRes.ok || !reposRes.ok) {
          throw new Error(`Failed to load GitHub data (HTTP ${userRes.status}/${reposRes.status})`);
        }

        const userData: UserProfile = await userRes.json();
        const reposData: Repo[] = await reposRes.json();

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

        // Cache response in session storage
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            profile: userData,
            repos: reposData,
            languages: langArray,
            totalStars: stars,
            totalForks: forks,
          })
        );
      } catch (err: any) {
        setError(err.message || 'Unable to fetch GitHub information.');
      } finally {
        setLoading(false);
      }
    }

    fetchGithubData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]" />
          ))}
        </div>
        <div className="h-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]" />
        <div className="space-y-4">
          <div className="h-6 w-48 rounded bg-[var(--color-muted)]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>GitHub API Notice</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--color-secondary)] leading-relaxed">
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
    <div className="space-y-12 animate-fade-in">
      {/* Section A: Overview Stats */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
            <span className="text-xs text-[var(--color-secondary)] font-mono block">Public Repos</span>
            <span className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-primary)] mt-1 block">
              {profile?.public_repos || repos.length}
            </span>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
            <span className="text-xs text-[var(--color-secondary)] font-mono block">Total Stars</span>
            <span className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-primary)] mt-1 block">
              {totalStars}
            </span>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
            <span className="text-xs text-[var(--color-secondary)] font-mono block">Total Forks</span>
            <span className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-primary)] mt-1 block">
              {totalForks}
            </span>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
            <span className="text-xs text-[var(--color-secondary)] font-mono block">Languages</span>
            <span className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-primary)] mt-1 block">
              {languages.length}
            </span>
          </div>
        </div>
      </section>

      {/* Section C: Language Distribution */}
      {languages.length > 0 && (
        <section className="space-y-4 p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--color-primary)]">
              Language Distribution
            </h2>
            <span className="text-xs font-mono text-[var(--color-secondary)]">
              Based on active public repositories
            </span>
          </div>

          {/* Stacked Bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-[var(--color-muted)]">
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
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            {languages.map((l, i) => {
              const colors = ['#3178C6', '#F7DF1E', '#E34F26', '#3572A5', '#61DAFB', '#5FA04E'];
              const color = colors[i % colors.length];
              return (
                <div key={l.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[var(--color-primary)] font-medium">{l.name}</span>
                  <span className="text-[var(--color-secondary)] font-mono text-[11px]">{l.percentage}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section B: Recently Updated Repositories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-base font-medium text-[var(--color-primary)]">
            Recently Updated Repositories
          </h2>
          <a
            href="https://github.com/Sanchit0307?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-1"
          >
            <span>All Repositories</span>
            <span>↗</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.slice(0, 6).map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-[var(--color-primary)] group-hover:underline truncate">
                  {repo.name}
                </span>
                <span className="text-xs text-[var(--color-secondary)] group-hover:text-[var(--color-primary)] transition-colors shrink-0">
                  ↗
                </span>
              </div>

              <p className="text-xs text-[var(--color-secondary)] mt-2 line-clamp-2 min-h-[2rem] leading-relaxed">
                {repo.description || 'Public GitHub repository by Sanchit Marwah.'}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[var(--color-secondary)] font-mono mt-4 pt-3 border-t border-[var(--color-border)]/60">
                <div className="flex items-center gap-3">
                  {repo.language && (
                    <span className="flex items-center gap-1 text-[var(--color-primary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                      <span>{repo.language}</span>
                    </span>
                  )}
                  <span>★ {repo.stargazers_count}</span>
                  <span>⑂ {repo.forks_count}</span>
                </div>
                <span>
                  Updated {new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Section D: Contribution Activity */}
      <section className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-[var(--color-primary)]">
              Contribution Activity
            </h2>
            <p className="text-xs text-[var(--color-secondary)] mt-0.5">
              Track real-time commits, pull requests, and code contributions on GitHub.
            </p>
          </div>
          <a
            href="https://github.com/Sanchit0307"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs shrink-0 self-start sm:self-auto"
          >
            <span>View Complete Graph on GitHub</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>

        <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] flex items-center justify-between text-xs text-[var(--color-secondary)]">
          <span className="font-mono">Profile: @Sanchit0307</span>
          <span className="text-[11px]">Direct public verification via GitHub REST API</span>
        </div>
      </section>
    </div>
  );
}
