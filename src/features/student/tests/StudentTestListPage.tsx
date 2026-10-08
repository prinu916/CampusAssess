import { useState, useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { testService } from '../../../services/test.service';
import { Test, TestStatus } from '../../../types/test.types';
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
} from 'lucide-react';

export function StudentTestListPage() {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'upcoming' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'MCQ' | 'CODING'>('all');

  const allTests = useMemo(() => testService.getTests('all'), []);

  const filteredTests = useMemo(() => {
    return allTests.filter((test) => {
      if (activeTab !== 'all' && test.status !== activeTab) return false;
      if (typeFilter !== 'all' && test.type !== typeFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = test.title.toLowerCase().includes(query);
        const matchSubject = test.subject.toLowerCase().includes(query);
        if (!matchTitle && !matchSubject) return false;
      }
      return true;
    });
  }, [allTests, activeTab, typeFilter, search]);

  const counts = useMemo(() => {
    return {
      all: allTests.length,
      available: allTests.filter((t) => t.status === 'available').length,
      upcoming: allTests.filter((t) => t.status === 'upcoming').length,
      completed: allTests.filter((t) => t.status === 'completed').length,
    };
  }, [allTests]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Assessment Catalog</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Assigned internal assessments, practical coding exams, and semester tests.
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

      {/* Controls: Search and Type Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by test title or subject..."
            className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 w-full sm:w-64"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">All Formats</option>
            <option value="MCQ">MCQ Assessments</option>
            <option value="CODING">Coding Assessments</option>
          </select>
        </div>
      </div>

      {/* Test Cards List */}
      {filteredTests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Tests Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {search || typeFilter !== 'all'
              ? 'No assessments match the selected search or format filter.'
              : 'You do not have any assessments in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => {
            const isCoding = test.type === 'CODING';
            const questionsCount = isCoding
              ? `${test.problems?.length || 3} Problems`
              : `${test.questions?.length || 20} Questions`;

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-red-700 dark:text-red-400 tracking-wide font-mono text-2xs uppercase">
                      {test.type}
                    </span>
                    <StatusBadge status={test.status} />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{test.subject}</p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {test.description}
                  </p>

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
                      className="w-full gap-2 text-xs"
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
      <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
        Available
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="text-2xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
        Upcoming
      </span>
    );
  }
  return (
    <span className="text-2xs text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
      Completed
    </span>
  );
}
