import { useState, useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { useAuth } from '../../../hooks/useAuth';
import { testService } from '../../../services/test.service';
import { leaderboardService, LeaderboardEntry } from '../../../services/leaderboard.service';
import { Button } from '../../../components/ui/Button';
import { formatTimeLeft } from '../../../lib/utils';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  TrendingUp,
  Clock,
  UserCheck,
  Crown,
  ChevronRight,
} from 'lucide-react';

export function StudentLeaderboardPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const tests = useMemo(() => {
    // Show tests that have completed or available status
    return testService.getTests('all').filter((t) => t.status !== 'upcoming');
  }, []);

  const [selectedTestId, setSelectedTestId] = useState<string>(
    tests[0]?.id || 'test_java_mcq'
  );
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const stats = useMemo(() => {
    return leaderboardService.getLeaderboardForTest(
      selectedTestId,
      user?.id || 'usr_student_01',
      sectionFilter
    );
  }, [selectedTestId, user?.id, sectionFilter]);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return stats.entries;
    const q = search.toLowerCase();
    return stats.entries.filter(
      (e) => e.studentName.toLowerCase().includes(q) || e.rollNumber.toLowerCase().includes(q)
    );
  }, [stats.entries, search]);

  const topThree = stats.entries.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Assessment Leaderboards & Batch Standing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparative peer rankings, percentile benchmarks, and score distributions for completed exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/results')}
            className="text-xs"
          >
            My Transcripts
          </Button>
        </div>
      </div>

      {/* Test & Filter Selection Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Selected Assessment:
          </label>
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="h-9 px-3 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 max-w-sm"
          >
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.type}) — {t.subject}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Section:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="h-8 px-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personal Standing Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs relative overflow-hidden">
          <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Your Placement
          </span>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums flex items-baseline gap-1">
            {stats.currentUserRank ? (
              <>
                <span className="text-red-700 dark:text-red-500">#{stats.currentUserRank}</span>
                <span className="text-xs font-normal text-slate-500">of {stats.totalParticipants}</span>
              </>
            ) : (
              <span className="text-sm font-normal text-slate-400">Not Attempted</span>
            )}
          </div>
          {stats.currentUserPercentile && (
            <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 block">
              Top {100 - stats.currentUserPercentile}% ({stats.currentUserPercentile}th Percentile)
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Your Marks vs Average
          </span>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {stats.currentUserScore !== null ? stats.currentUserScore : '—'}
            <span className="text-xs font-normal text-slate-500"> vs {stats.averageScore}</span>
          </div>
          <span className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">
            {stats.currentUserScore !== null && stats.currentUserScore >= stats.averageScore ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                +{(stats.currentUserScore - stats.averageScore).toFixed(1)} Above Mean
              </span>
            ) : stats.currentUserScore !== null ? (
              <span className="text-amber-600 dark:text-amber-400">
                {(stats.currentUserScore - stats.averageScore).toFixed(1)} Below Mean
              </span>
            ) : (
              'Batch Mean: ' + stats.averageScore
            )}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Top Batch Score
          </span>
          <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {stats.highestScore}
          </div>
          <span className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 block">
            Held by {topThree[0]?.studentName.split(' ')[0] || 'Top Student'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Evaluated Candidates
          </span>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {stats.totalParticipants}
          </div>
          <span className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">
            {stats.averagePercentage}% Batch Pass Mean
          </span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* #2 Rank Silver */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between order-2 md:order-1 border-t-4 border-t-slate-400">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Medal className="w-3.5 h-3.5 text-slate-400" />
                  RANK #2 (SILVER)
                </span>
                <span className="font-mono text-2xs text-slate-400">
                  {formatTimeLeft(topThree[1].timeTakenSeconds)}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {topThree[1].studentName}
                  {topThree[1].isCurrentUser && (
                    <span className="ml-2 text-2xs bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 px-1.5 py-0.2 rounded font-bold">
                      YOU
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Roll: {topThree[1].rollNumber} · Sec {topThree[1].section}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {topThree[1].score} <span className="text-xs font-normal text-slate-500">/ {topThree[1].maxMarks}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {topThree[1].percentage}% Marks
              </span>
            </div>
          </div>

          {/* #1 Rank Gold (Elevated Center Card) */}
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-500/80 rounded-lg p-5 shadow-sm flex flex-col justify-between order-1 md:order-2 relative bg-amber-50/20 dark:bg-amber-950/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  RANK #1 (GOLD)
                </span>
                <span className="font-mono text-2xs text-slate-500 dark:text-slate-400">
                  {formatTimeLeft(topThree[0].timeTakenSeconds)}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {topThree[0].studentName}
                  {topThree[0].isCurrentUser && (
                    <span className="ml-2 text-2xs bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 px-1.5 py-0.2 rounded font-bold">
                      YOU
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Roll: {topThree[0].rollNumber} · Sec {topThree[0].section}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between font-mono">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {topThree[0].score} <span className="text-xs font-normal text-slate-500">/ {topThree[0].maxMarks}</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {topThree[0].percentage}% Marks
              </span>
            </div>
          </div>

          {/* #3 Rank Bronze */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between order-3 md:order-3 border-t-4 border-t-amber-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-400 flex items-center gap-1">
                  <Medal className="w-3.5 h-3.5 text-amber-700" />
                  RANK #3 (BRONZE)
                </span>
                <span className="font-mono text-2xs text-slate-400">
                  {formatTimeLeft(topThree[2].timeTakenSeconds)}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {topThree[2].studentName}
                  {topThree[2].isCurrentUser && (
                    <span className="ml-2 text-2xs bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 px-1.5 py-0.2 rounded font-bold">
                      YOU
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Roll: {topThree[2].rollNumber} · Sec {topThree[2].section}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {topThree[2].score} <span className="text-xs font-normal text-slate-500">/ {topThree[2].maxMarks}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {topThree[2].percentage}% Marks
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Complete Rankings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by name or roll..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Displaying {filteredEntries.length} Candidates
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-2xs">
                <th className="py-3 px-4 text-center w-16">Rank</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4 text-center">Section</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-right">Completion Time</th>
                <th className="py-3 px-4 text-right">Percentile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredEntries.map((e) => (
                <tr
                  key={e.studentId}
                  className={`transition-colors ${
                    e.isCurrentUser
                      ? 'bg-red-50/70 dark:bg-red-950/30 border-l-4 border-l-red-600 font-medium'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                    {e.rank === 1 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 inline-flex items-center justify-center text-xs">
                        1
                      </span>
                    ) : e.rank === 2 ? (
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 inline-flex items-center justify-center text-xs">
                        2
                      </span>
                    ) : e.rank === 3 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-400 inline-flex items-center justify-center text-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">#{e.rank}</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{e.studentName}</span>
                    {e.isCurrentUser && (
                      <span className="text-3xs font-bold bg-red-700 text-white px-1.5 py-0.2 rounded uppercase">
                        YOU
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{e.rollNumber}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-slate-300">{e.section}</td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {e.score} <span className="text-2xs font-normal text-slate-400">/ {e.maxMarks}</span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {e.percentage}%
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {formatTimeLeft(e.timeTakenSeconds)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums font-semibold">
                    {e.percentile}th %ile
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
