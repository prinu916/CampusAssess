import { useState, useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { testService } from '../../../services/test.service';
import { Test, TestStatus, TestDifficulty } from '../../../types/test.types';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';
import { formatDate } from '../../../lib/utils';
import {
  FileText,
  Code,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  Tag,
  Sliders,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

export function StudentTestListPage() {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'upcoming' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'MCQ' | 'CODING'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | TestDifficulty>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTests = useMemo(() => testService.getTests('all'), []);

  // Compute all available tags and their occurrences
  const allTagsWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    allTests.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        map.set(tag, (map.get(tag) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [allTests]);

  const filteredTests = useMemo(() => {
    return allTests.filter((test) => {
      if (activeTab !== 'all' && test.status !== activeTab) return false;
      if (typeFilter !== 'all' && test.type !== typeFilter) return false;
      if (difficultyFilter !== 'all' && (test.difficulty || 'Intermediate') !== difficultyFilter) return false;

      if (selectedTag) {
        const hasTag = (test.tags || []).some(
          (t) => t.toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = test.title.toLowerCase().includes(query);
        const matchSubject = test.subject.toLowerCase().includes(query);
        const matchDesc = test.description.toLowerCase().includes(query);
        const matchTags = (test.tags || []).some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchSubject && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [allTests, activeTab, typeFilter, difficultyFilter, selectedTag, search]);

  const counts = useMemo(() => {
    return {
      all: allTests.length,
      available: allTests.filter((t) => t.status === 'available').length,
      upcoming: allTests.filter((t) => t.status === 'upcoming').length,
      completed: allTests.filter((t) => t.status === 'completed').length,
    };
  }, [allTests]);

  const isFilteringActive =
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    difficultyFilter !== 'all' ||
    selectedTag !== null;

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setDifficultyFilter('all');
    setSelectedTag(null);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Assessment Catalog</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore and filter assigned evaluations by subject tags, format, and difficulty tier.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        items={[
          { id: 'all', label: 'All Tests', count: counts.all },
          { id: 'available', label: 'Available', count: counts.available },
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'completed', label: 'Completed', count: counts.completed },
        ]}
      />

      {/* Controls: Search, Type Filter, Difficulty Filter, and Tag Dropdown */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, subject, or #tags..."
              className="w-full h-9 pl-3 pr-8 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full h-7 text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="MCQ">MCQ Assessments</option>
              <option value="CODING">Coding Challenges</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              className="w-full h-7 text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">🟢 Beginner</option>
              <option value="Intermediate">🔵 Intermediate</option>
              <option value="Advanced">🟣 Advanced</option>
              <option value="Expert">🔴 Expert</option>
            </select>
          </div>

          {/* Subject / Tag Quick Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedTag || 'all'}
              onChange={(e) => setSelectedTag(e.target.value === 'all' ? null : e.target.value)}
              className="w-full h-7 text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Filter by Tag ({allTagsWithCounts.length} available)</option>
              {allTagsWithCounts.map((tag) => (
                <option key={tag.name} value={tag.name}>
                  #{tag.name} ({tag.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Horizontal Quick-Filter Tag Pill Bar */}
        {allTagsWithCounts.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
            <span className="text-3xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              Tags:
            </span>

            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`text-2xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedTag === null
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Topics
            </button>

            {allTagsWithCounts.map((t) => {
              const isActive = selectedTag?.toLowerCase() === t.name.toLowerCase();
              return (
                <button
                  type="button"
                  key={t.name}
                  onClick={() => setSelectedTag(isActive ? null : t.name)}
                  className={`text-2xs px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white dark:bg-red-700 shadow-2xs ring-2 ring-red-400/40'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  <span>#{t.name}</span>
                  <span
                    className={`text-3xs px-1 rounded-full ${
                      isActive
                        ? 'bg-red-700 text-red-100'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}

            {isFilteringActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto text-2xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer pl-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filter Summary Pill */}
      {selectedTag && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Filtering by tag:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-xs bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900">
            <Tag className="w-3 h-3 text-red-600" />
            #{selectedTag}
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="hover:text-red-900 dark:hover:text-red-100 ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
          <span className="text-slate-400">({filteredTests.length} matches)</span>
        </div>
      )}

      {/* Test Cards Grid */}
      {filteredTests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
          <Calendar className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Assessments Match Your Filters</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {isFilteringActive
              ? 'No tests match your current search query, subject tags, format, or difficulty level.'
              : 'You do not have any assessments assigned in this view.'}
          </p>
          {isFilteringActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="gap-1.5 text-xs mx-auto mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Active Filters</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => {
            const isCoding = test.type === 'CODING';
            const questionsCount = isCoding
              ? `${test.problems?.length || 3} Problems`
              : `${test.questions?.length || 20} Questions`;
            const testDifficulty = test.difficulty || 'Intermediate';
            const testTags = test.tags && test.tags.length > 0 ? test.tags : [test.subject?.split(' ')[0] || 'General'];

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top Badges: Format, Difficulty Tier, and Status */}
                  <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-red-700 dark:text-red-400 tracking-wide font-mono text-2xs uppercase">
                        {test.type}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <DifficultyBadge difficulty={testDifficulty} />
                    </div>
                    <StatusBadge status={test.status} />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{test.subject}</p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {test.description}
                  </p>

                  {/* DISPLAY TAGS SYSTEM ON THE TEST CARD */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {testTags.map((t) => {
                      const isTagActive = selectedTag?.toLowerCase() === t.toLowerCase();
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setSelectedTag(isTagActive ? null : t)}
                          title={`Filter by tag #${t}`}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-3xs font-medium transition-colors cursor-pointer ${
                            isTagActive
                              ? 'bg-red-600 text-white dark:bg-red-700 shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-700 dark:hover:text-red-300 border border-slate-200 dark:border-slate-750'
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5 opacity-70" />
                          <span>#{t}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Questions / Problems:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{questionsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duration:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">{test.duration} Minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Maximum Marks:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">{test.maxMarks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Window Closes:</span>
                      <span className="text-2xs text-slate-700 dark:text-slate-300">{formatDate(test.endTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4">
                  {test.status === 'available' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full gap-2 text-xs font-semibold"
                      onClick={() => navigate(`/student/tests/${test.id}`)}
                    >
                      {isCoding ? <Code className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>View Test Details</span>
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </Button>
                  )}

                  {test.status === 'upcoming' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs cursor-not-allowed opacity-80"
                      disabled
                    >
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Starts {formatDate(test.startTime)}
                    </Button>
                  )}

                  {test.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => navigate('/student/results')}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                      <span>View Result</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: TestStatus }) {
  if (status === 'available') {
    return (
      <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/50">
        Available
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="text-2xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/50">
        Upcoming
      </span>
    );
  }
  return (
    <span className="text-2xs text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
      Completed
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: TestDifficulty }) {
  switch (difficulty) {
    case 'Beginner':
      return (
        <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          🟢 Beginner
        </span>
      );
    case 'Advanced':
      return (
        <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          🟣 Advanced
        </span>
      );
    case 'Expert':
      return (
        <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          🔴 Expert
        </span>
      );
    case 'Intermediate':
    default:
      return (
        <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
          🔵 Intermediate
        </span>
      );
  }
}
