import { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Award,
  AlertCircle,
  CheckCircle2,
  Filter,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface CategoryPerformanceData {
  category: string;
  shortCode: string;
  avgScore: number;
  passRate: number;
  highestScore: number;
  totalSubmissions: number;
  difficultyRating: 'Easy' | 'Moderate' | 'Hard';
  trend: 'improving' | 'stable' | 'needs_attention';
}

const CATEGORY_DATA: CategoryPerformanceData[] = [
  {
    category: 'Data Structures & Algorithms',
    shortCode: 'DSA',
    avgScore: 86.4,
    passRate: 94.2,
    highestScore: 100,
    totalSubmissions: 48,
    difficultyRating: 'Hard',
    trend: 'improving',
  },
  {
    category: 'Database Management Systems',
    shortCode: 'DBMS',
    avgScore: 82.1,
    passRate: 89.5,
    highestScore: 98,
    totalSubmissions: 38,
    difficultyRating: 'Moderate',
    trend: 'improving',
  },
  {
    category: 'Web & Cloud Architecture',
    shortCode: 'Cloud/Web',
    avgScore: 79.5,
    passRate: 88.0,
    highestScore: 96,
    totalSubmissions: 35,
    difficultyRating: 'Moderate',
    trend: 'stable',
  },
  {
    category: 'Computer Networks & Security',
    shortCode: 'Networks',
    avgScore: 74.2,
    passRate: 81.6,
    highestScore: 92,
    totalSubmissions: 32,
    difficultyRating: 'Moderate',
    trend: 'stable',
  },
  {
    category: 'Operating Systems & Concurrency',
    shortCode: 'OS',
    avgScore: 68.2,
    passRate: 73.8,
    highestScore: 88,
    totalSubmissions: 31,
    difficultyRating: 'Hard',
    trend: 'needs_attention',
  },
];

// Historical trends across test milestones
const HISTORICAL_TRENDS = [
  { term: 'Assessment 1 (Diagnostic)', DSA: 78, DBMS: 72, CloudWeb: 70, OS: 62 },
  { term: 'Assessment 2 (Mid-Term)', DSA: 81, DBMS: 76, CloudWeb: 74, OS: 65 },
  { term: 'Assessment 3 (Lab Tests)', DSA: 84, DBMS: 79, CloudWeb: 77, OS: 66 },
  { term: 'Assessment 4 (Current Exam)', DSA: 86.4, DBMS: 82.1, CloudWeb: 79.5, OS: 68.2 },
];

export function FacultyCategoryPerformanceWidget() {
  const [viewMode, setViewMode] = useState<'comparison' | 'timeline'>('comparison');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CORE' | 'SYSTEMS'>('ALL');

  const filteredCategories = CATEGORY_DATA.filter((item) => {
    if (selectedFilter === 'CORE') return item.shortCode === 'DSA' || item.shortCode === 'DBMS';
    if (selectedFilter === 'SYSTEMS') return item.shortCode === 'OS' || item.shortCode === 'Networks';
    return true;
  });

  const overallAvgScore = (
    CATEGORY_DATA.reduce((acc, c) => acc + c.avgScore, 0) / CATEGORY_DATA.length
  ).toFixed(1);

  const overallPassRate = (
    CATEGORY_DATA.reduce((acc, c) => acc + c.passRate, 0) / CATEGORY_DATA.length
  ).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-5 transition-colors">
      {/* Widget Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-700 dark:text-red-400" />
              Category Performance Analytics
            </h3>
            <span className="px-2 py-0.5 text-2xs font-semibold rounded-full bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
              Cohort Benchmarks
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Student score averages, passing margins, and progress trends across examination categories
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 flex text-xs">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-2.5 py-1 rounded text-2xs font-semibold transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Benchmark Comparison
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded text-2xs font-semibold transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Progress Timeline
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
          <span className="text-2xs font-medium text-slate-500 dark:text-slate-400 block uppercase">
            Mean Cohort Score
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {overallAvgScore}%
          </div>
          <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +4.2% vs last term
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
          <span className="text-2xs font-medium text-slate-500 dark:text-slate-400 block uppercase">
            Cohort Pass Rate
          </span>
          <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
            {overallPassRate}%
          </div>
          <span className="text-2xs text-slate-500 dark:text-slate-400 block mt-0.5">
            Standard 50% cutoff
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
          <span className="text-2xs font-medium text-slate-500 dark:text-slate-400 block uppercase">
            Highest Category
          </span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Algorithms (86.4%)
          </div>
          <span className="text-2xs text-slate-500 dark:text-slate-400 block mt-0.5">
            48 submitted attempts
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
          <span className="text-2xs font-medium text-slate-500 dark:text-slate-400 block uppercase">
            Focus Topic Area
          </span>
          <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5 truncate flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Operating Systems
          </div>
          <span className="text-2xs text-slate-500 dark:text-slate-400 block mt-0.5">
            Review Concurrency topics
          </span>
        </div>
      </div>

      {/* Filter Tabs (when in comparison view) */}
      {viewMode === 'comparison' && (
        <div className="flex items-center gap-2 pt-1 text-2xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Filter Categories:</span>
          {(['ALL', 'CORE', 'SYSTEMS'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                selectedFilter === filter
                  ? 'border-red-700 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {filter === 'ALL' ? 'All Subjects' : filter === 'CORE' ? 'Core CS (DSA/DBMS)' : 'Systems (OS/Networks)'}
            </button>
          ))}
        </div>
      )}

      {/* Recharts Visualization Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {viewMode === 'comparison' ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredCategories}
              margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.25} />
              <XAxis
                dataKey="shortCode"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                domain={[40, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryPerformanceData;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1">
                        <p className="font-bold text-slate-100">{data.category}</p>
                        <div className="pt-1 border-t border-slate-800 space-y-0.5 text-slate-300">
                          <p className="flex justify-between gap-4">
                            <span>Average Score:</span>
                            <span className="font-mono font-bold text-red-400">{data.avgScore}%</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span>Pass Rate:</span>
                            <span className="font-mono font-bold text-emerald-400">{data.passRate}%</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span>Top Score:</span>
                            <span className="font-mono font-bold text-amber-300">{data.highestScore}%</span>
                          </p>
                          <p className="flex justify-between gap-4 text-2xs text-slate-400">
                            <span>Submissions:</span>
                            <span className="font-mono">{data.totalSubmissions}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              <Bar
                name="Average Score (%)"
                dataKey="avgScore"
                fill="#B91C1C"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Line
                name="Pass Rate (%)"
                type="monotone"
                dataKey="passRate"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10B981' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={HISTORICAL_TRENDS}
              margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
            >
              <defs>
                <linearGradient id="colorDsa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDbms" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.25} />
              <XAxis
                dataKey="term"
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                domain={[50, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1">
                        <p className="font-bold text-slate-100">{label}</p>
                        <div className="pt-1 border-t border-slate-800 space-y-0.5">
                          {payload.map((entry, idx) => (
                            <p key={idx} className="flex justify-between gap-4 text-2xs">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-mono font-bold">{entry.value}%</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              <Area
                name="Algorithms (DSA)"
                type="monotone"
                dataKey="DSA"
                stroke="#B91C1C"
                fillOpacity={1}
                fill="url(#colorDsa)"
                strokeWidth={2}
              />
              <Area
                name="Database Systems (DBMS)"
                type="monotone"
                dataKey="DBMS"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorDbms)"
                strokeWidth={2}
              />
              <Area
                name="Operating Systems (OS)"
                type="monotone"
                dataKey="OS"
                stroke="#F59E0B"
                fillOpacity={1}
                fill="url(#colorOs)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Editorial Faculty Recommendation Tip */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-2xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
        <span>
          <strong>Faculty Actionable Insight:</strong> Data Structures score progression remains resilient at 86.4%. Operating Systems synchronization questions exhibited a 14% higher error rate in multi-threading questions. Consider attaching additional practice problems or scheduling a review test for Section A & B.
        </span>
      </div>
    </div>
  );
}
