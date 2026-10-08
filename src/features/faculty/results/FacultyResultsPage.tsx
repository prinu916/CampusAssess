import { useState, useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { testService } from '../../../services/test.service';
import { resultService } from '../../../services/result.service';
import { proctoringService } from '../../../services/proctoring.service';
import { TestResult, ProctoringEvent } from '../../../types/result.types';
import { PerformanceVisualizer } from './PerformanceVisualizer';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatDate, formatTimeLeft } from '../../../lib/utils';
import {
  Download,
  Search,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  FileSpreadsheet,
  BarChart3,
  ListFilter,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export function FacultyResultsPage({ testId }: { testId?: string }) {
  const { navigate } = useRouter();

  const allTests = useMemo(() => testService.getTests('all'), []);
  const [selectedTestId, setSelectedTestId] = useState<string>(
    testId || allTests[0]?.id || 'test_java_mcq'
  );

  // Active view tab: 'table' vs 'analytics'
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table');

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [secFilter, setSecFilter] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'time' | 'flags'>('score');
  const [sortDesc, setSortDesc] = useState(true);

  // Selected student result for details modal
  const [activeModalResult, setActiveModalResult] = useState<TestResult | null>(null);

  const currentTest = useMemo(() => {
    return allTests.find((t) => t.id === selectedTestId) || allTests[0];
  }, [allTests, selectedTestId]);

  const rawResults = useMemo(() => {
    return resultService.getFacultyTestResults(selectedTestId);
  }, [selectedTestId]);

  const filteredResults = useMemo(() => {
    let list = rawResults.filter((r) => {
      if (deptFilter && !r.department.includes(deptFilter)) return false;
      if (secFilter && r.section !== secFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = r.studentName.toLowerCase().includes(q);
        const mRoll = r.rollNumber.toLowerCase().includes(q);
        if (!mName && !mRoll) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'score') {
        return sortDesc ? b.score - a.score : a.score - b.score;
      }
      if (sortBy === 'name') {
        return sortDesc ? b.studentName.localeCompare(a.studentName) : a.studentName.localeCompare(b.studentName);
      }
      if (sortBy === 'time') {
        return sortDesc ? b.timeTakenSeconds - a.timeTakenSeconds : a.timeTakenSeconds - b.timeTakenSeconds;
      }
      if (sortBy === 'flags') {
        const aFlags = a.suspiciousActivityCount || (a.proctoringEvents?.length || 0);
        const bFlags = b.suspiciousActivityCount || (b.proctoringEvents?.length || 0);
        return sortDesc ? bFlags - aFlags : aFlags - bFlags;
      }
      return 0;
    });

    return list;
  }, [rawResults, deptFilter, secFilter, search, sortBy, sortDesc]);

  // Retrieve full proctoring events for modal
  const activeProctoringLogs: ProctoringEvent[] = useMemo(() => {
    if (!activeModalResult) return [];
    if (activeModalResult.proctoringEvents && activeModalResult.proctoringEvents.length > 0) {
      return activeModalResult.proctoringEvents;
    }
    return proctoringService.getLogsByResultId(activeModalResult.id);
  }, [activeModalResult]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Student Performance & Evaluation Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exam scores, individual time records, and item-level response audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/faculty/export')}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to Excel/CSV</span>
          </Button>
        </div>
      </div>

      {/* Test Selector Dropdown */}
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
            {allTests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.type})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>Max Marks: <strong className="font-mono text-slate-900 dark:text-slate-100">{currentTest?.maxMarks}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Total Submissions: <strong className="font-mono text-slate-900 dark:text-slate-100">{rawResults.length}</strong></span>
        </div>
      </div>

      {/* Mode View Tabs (Table View vs Performance Visualizer) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Candidates Ledger ({filteredResults.length})</span>
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'analytics'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Performance & Difficulty Visualizations</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PERFORMANCE VISUALIZATIONS (RECHARTS) */}
      {viewMode === 'analytics' && (
        <PerformanceVisualizer test={currentTest} results={rawResults} />
      )}

      {/* VIEW 2: CANDIDATES LEDGER TABLE */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student or roll..."
                className="w-full h-8 pl-8 pr-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
              </select>

              <select
                value={secFilter}
                onChange={(e) => setSecFilter(e.target.value)}
                className="h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>

              <button
                onClick={() => {
                  setSortBy('score');
                  setSortDesc(!sortDesc);
                }}
                className="h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1 font-medium"
              >
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <span>Score ({sortDesc ? 'High' : 'Low'})</span>
              </button>

              <button
                onClick={() => {
                  setSortBy('flags');
                  setSortDesc(!sortDesc);
                }}
                className="h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1 font-medium"
              >
                <ShieldAlert className="w-3 h-3 text-red-500" />
                <span>Flags</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Submissions Recorded</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                No students have submitted responses matching this filter.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-2xs">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Section</th>
                      <th className="py-3 px-4 text-right">Score</th>
                      <th className="py-3 px-4 text-right">Percentage</th>
                      <th className="py-3 px-4 text-right">Time Taken</th>
                      <th className="py-3 px-4 text-center">Proctoring Flags</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredResults.map((r) => {
                      const flagCount = r.suspiciousActivityCount || (r.proctoringEvents?.length || 0);

                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                          onClick={() => setActiveModalResult(r)}
                        >
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-700 dark:group-hover:text-red-400">
                            {r.studentName}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{r.rollNumber}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{r.department}</td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{r.section}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                            {r.score} / {r.maxMarks}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {r.percentage}%
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            {formatTimeLeft(r.timeTakenSeconds)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {flagCount > 0 ? (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-2xs px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                                <ShieldAlert className="w-3 h-3 text-red-600 dark:text-red-400" />
                                {flagCount} Flags
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-2xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-medium">
                                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                Clean
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-2xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModalResult(r);
                              }}
                              className="text-xs text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-semibold"
                            >
                              Audit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT RESULT DETAILS & PROCTORING AUDIT MODAL */}
      <Modal
        isOpen={!!activeModalResult}
        onClose={() => setActiveModalResult(null)}
        title={`Candidate Submission: ${activeModalResult?.studentName}`}
        description={`Roll Number: ${activeModalResult?.rollNumber} · ${activeModalResult?.department}`}
        maxWidth="xl"
      >
        {activeModalResult && (
          <div className="space-y-4 text-xs">
            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 rounded text-center">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Marks Secured</span>
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100 text-base mt-0.5">
                  {activeModalResult.score} / {activeModalResult.maxMarks}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Percentage</span>
                <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-base mt-0.5">
                  {activeModalResult.percentage}%
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Duration Spent</span>
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100 text-base mt-0.5">
                  {formatTimeLeft(activeModalResult.timeTakenSeconds)}
                </p>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Performance Breakdown:</span>
              {activeModalResult.testType === 'MCQ' ? (
                <div className="grid grid-cols-2 gap-2 text-2xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-750">
                    <span className="text-slate-500 dark:text-slate-400">Total Questions:</span>
                    <strong className="ml-1 text-slate-800 dark:text-slate-200">{activeModalResult.totalQuestions || 20}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-750">
                    <span className="text-slate-500 dark:text-slate-400">Attempted:</span>
                    <strong className="ml-1 text-slate-800 dark:text-slate-200">{activeModalResult.attemptedQuestions || 20}</strong>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
                    <span>Correct:</span>
                    <strong className="ml-1">{activeModalResult.correctAnswers || 18}</strong>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-950/60 rounded border border-red-200 dark:border-red-800 text-red-900 dark:text-red-300">
                    <span>Incorrect:</span>
                    <strong className="ml-1">{activeModalResult.incorrectAnswers || 2}</strong>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-2xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-750">
                    <span className="text-slate-500 dark:text-slate-400">Problems Solved:</span>
                    <strong className="ml-1 text-slate-800 dark:text-slate-200">{activeModalResult.problemsSolved || 3} / 3</strong>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
                    <span>Accepted Submissions:</span>
                    <strong className="ml-1">{activeModalResult.acceptedSubmissions || 3}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* DEDICATED PROCTORING & ACADEMIC INTEGRITY AUDIT SECTION */}
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Proctoring Assistant Integrity Audit Log
                </span>
                <span
                  className={`font-mono text-2xs px-2 py-0.5 rounded font-bold ${
                    activeProctoringLogs.length > 0
                      ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {activeProctoringLogs.length} Incident(s) Recorded
                </span>
              </div>

              {activeProctoringLogs.length === 0 ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-2 text-emerald-900 dark:text-emerald-300 text-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Clean assessment record. No tab switches, window blurs, or unauthorized clipboard shortcuts were intercepted.
                  </span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeProctoringLogs.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded text-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-3xs">
                        <div className="flex items-center gap-1.5 font-semibold text-red-800 dark:text-red-300">
                          <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          <span className="font-mono uppercase">{evt.type}</span>
                        </div>
                        <span className="font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-snug font-medium pl-4">
                        {evt.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveModalResult(null)}
              >
                Close Audit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
