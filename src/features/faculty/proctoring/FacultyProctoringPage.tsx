import React, { useState, useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { testService } from '../../../services/test.service';
import { resultService } from '../../../services/result.service';
import { proctoringService, UnifiedProctoringSession } from '../../../services/proctoring.service';
import { ProctoringEvent } from '../../../types/result.types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatDate, formatTimeLeft } from '../../../lib/utils';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ArrowUpDown,
  Download,
  Eye,
  Check,
  Flag,
  User,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

export function FacultyProctoringPage() {
  const { navigate } = useRouter();

  const allTests = useMemo(() => testService.getTests('all'), []);
  const allResults = useMemo(() => resultService.getAllResults(), []);

  const [selectedTestFilter, setSelectedTestFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'clean'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSession, setActiveSession] = useState<UnifiedProctoringSession | null>(null);

  // Review status mutation state
  const [reviewStatusInput, setReviewStatusInput] = useState<'verified' | 'flagged' | 'dismissed'>('verified');
  const [reviewNotesInput, setReviewNotesInput] = useState<string>('');
  const [reviewSavedMessage, setReviewSavedMessage] = useState<string | null>(null);

  // Refresh trigger on review update
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const sessions: UnifiedProctoringSession[] = useMemo(() => {
    // refreshKey dependency triggers re-fetch of local reviews
    void refreshKey;
    return proctoringService.getAllProctoredSessions(allResults);
  }, [allResults, refreshKey]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    let totalTabSwitches = 0;
    let totalWindowBlurs = 0;
    let totalCopyAttempts = 0;
    let flaggedHighRisk = 0;
    let cleanSessions = 0;

    sessions.forEach((s) => {
      totalTabSwitches += s.tabSwitchCount;
      totalWindowBlurs += s.windowBlurCount;
      totalCopyAttempts += s.copyAttemptCount;
      if (s.riskLevel === 'high') flaggedHighRisk++;
      if (s.riskLevel === 'clean') cleanSessions++;
    });

    const cleanRate = totalSessions > 0 ? Math.round((cleanSessions / totalSessions) * 100) : 100;

    return {
      totalSessions,
      totalTabSwitches,
      totalWindowBlurs,
      totalCopyAttempts,
      flaggedHighRisk,
      cleanSessions,
      cleanRate,
    };
  }, [sessions]);

  // Filtered List
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedTestFilter !== 'all' && s.testId !== selectedTestFilter) return false;
      if (riskFilter !== 'all') {
        if (riskFilter === 'clean' && s.riskLevel !== 'clean') return false;
        if (riskFilter === 'medium' && s.riskLevel !== 'medium') return false;
        if (riskFilter === 'high' && s.riskLevel !== 'high') return false;
      }
      if (typeFilter !== 'all') {
        const hasMatchingType = s.events.some((e) => e.type === typeFilter);
        if (!hasMatchingType) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.studentName.toLowerCase().includes(q);
        const matchesRoll = s.rollNumber.toLowerCase().includes(q);
        const matchesTest = s.testTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesTest) return false;
      }
      return true;
    });
  }, [sessions, selectedTestFilter, riskFilter, typeFilter, searchQuery]);

  const handleOpenAuditModal = (session: UnifiedProctoringSession) => {
    setActiveSession(session);
    setReviewStatusInput(session.reviewStatus === 'pending' ? 'verified' : session.reviewStatus as any);
    setReviewNotesInput(session.facultyNotes || '');
    setReviewSavedMessage(null);
  };

  const handleSaveReview = () => {
    if (!activeSession) return;
    proctoringService.saveReview(activeSession.resultId, reviewStatusInput, reviewNotesInput);
    setReviewSavedMessage('Audit review and status successfully recorded!');
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setActiveSession(null);
      setReviewSavedMessage(null);
    }, 1200);
  };

  // Export proctoring audit log to CSV
  const handleExportProctoringCsv = () => {
    const rows = [
      ['Student Name', 'Roll Number', 'Department', 'Test Title', 'Test Type', 'Submission Time', 'Score', 'Tab Switches', 'Window Blurs', 'Risk Level', 'Review Status', 'Event Timeline Details'],
    ];

    filteredSessions.forEach((s) => {
      const eventDetails = s.events
        .map((e) => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.type} (${e.severity}): ${e.message}`)
        .join(' | ');

      rows.push([
        `"${s.studentName}"`,
        `"${s.rollNumber}"`,
        `"${s.department}"`,
        `"${s.testTitle}"`,
        `"${s.testType}"`,
        `"${s.submissionTime}"`,
        `"${s.score}/${s.maxMarks}"`,
        `"${s.tabSwitchCount}"`,
        `"${s.windowBlurCount}"`,
        `"${s.riskLevel}"`,
        `"${s.reviewStatus}"`,
        `"${eventDetails.replace(/"/g, '""')}"`,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusAssess_Proctoring_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-2xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              INTEGRITY AUDIT LOGS
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Proctored Examination Mode</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Faculty Proctoring & Tab-Switch Review
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time event logging of browser tab switching, window blurs, and unauthorized shortcuts during tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportProctoringCsv}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Incident Report</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/faculty/results')}
            className="gap-1.5 text-xs font-semibold"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>All Results</span>
          </Button>
        </div>
      </div>

      {/* Proctoring Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Monitored Sessions
          </span>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {metrics.totalSessions}
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 mt-1 block">Active candidates audited</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-lg p-4 shadow-xs">
          <span className="text-2xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Tab Switches
          </span>
          <div className="font-mono text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1 tabular-nums">
            {metrics.totalTabSwitches}
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 mt-1 block">External focus transitions</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Window Blurs
          </span>
          <div className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
            {metrics.totalWindowBlurs}
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 mt-1 block">Application minimized/Alt-Tab</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-lg p-4 shadow-xs">
          <span className="text-2xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider block flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            High Risk Flags
          </span>
          <div className="font-mono text-2xl font-bold text-red-700 dark:text-red-400 mt-1 tabular-nums">
            {metrics.flaggedHighRisk}
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 mt-1 block">Requires manual audit</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-lg p-4 shadow-xs">
          <span className="text-2xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Clean Record Rate
          </span>
          <div className="font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
            {metrics.cleanRate}%
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 mt-1 block">Zero infractions observed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Assessment Filter */}
          <div>
            <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Filter by Test
            </label>
            <select
              value={selectedTestFilter}
              onChange={(e) => setSelectedTestFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-red-600"
            >
              <option value="all">All Assessments ({allTests.length})</option>
              {allTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.type})
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Integrity Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="w-full h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-red-600"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk (Multiple Flags)</option>
              <option value="medium">Suspicious (1-2 Incidents)</option>
              <option value="clean">Clean (No Flags)</option>
            </select>
          </div>

          {/* Specific Violation Type */}
          <div>
            <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Violation Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-red-600"
            >
              <option value="all">All Event Types</option>
              <option value="TAB_SWITCH">Tab Switch (Focus Lost)</option>
              <option value="WINDOW_BLUR">Window Blur (Alt-Tab)</option>
              <option value="COPY_ATTEMPT">Clipboard Copy Attempt</option>
              <option value="DEVTOOLS_ATTEMPT">DevTools / F12 Attempt</option>
              <option value="FULLSCREEN_EXIT">Fullscreen Exit</option>
            </select>
          </div>

          {/* Student Search */}
          <div>
            <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Search Student / Roll No
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Name or Roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100 font-mono">{filteredSessions.length}</strong> candidate audit logs
          </span>

          {(selectedTestFilter !== 'all' || riskFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedTestFilter('all');
                setRiskFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
              className="text-red-700 dark:text-red-400 hover:underline font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Proctoring Event Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-2xs">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Assessment</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Tab Switches</th>
                <th className="py-3 px-4 text-center">Window Blurs</th>
                <th className="py-3 px-4 text-center">Total Incidents</th>
                <th className="py-3 px-4 text-center">Risk Level</th>
                <th className="py-3 px-4 text-center">Faculty Review</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No proctored exam sessions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session.resultId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.studentName}</span>
                      </div>
                      <div className="text-2xs font-mono text-slate-500 dark:text-slate-400">
                        {session.rollNumber} · {session.department.replace('Department of ', '')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {session.testTitle}
                      </div>
                      <div className="text-2xs text-slate-400">
                        {formatDate(session.submissionTime)} · {session.testType}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-medium tabular-nums">
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{session.score}</span>
                      <span className="text-slate-400 text-2xs">/{session.maxMarks}</span>
                      <span className="text-2xs text-emerald-700 dark:text-emerald-400 block font-semibold">
                        {session.percentage}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          session.tabSwitchCount > 0
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {session.tabSwitchCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          session.windowBlurCount > 0
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {session.windowBlurCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          session.totalViolations > 0
                            ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
                            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {session.totalViolations}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {session.riskLevel === 'high' && (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          High Risk
                        </span>
                      )}
                      {session.riskLevel === 'medium' && (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Suspicious
                        </span>
                      )}
                      {session.riskLevel === 'clean' && (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Clean Record
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-2xs font-semibold px-2 py-0.5 rounded capitalize ${
                          session.reviewStatus === 'verified'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : session.reviewStatus === 'flagged'
                            ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                            : session.reviewStatus === 'dismissed'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200'
                        }`}
                      >
                        {session.reviewStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAuditModal(session)}
                        className="gap-1 text-2xs font-semibold"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Audit Log</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED PROCTORING INCIDENT AUDIT MODAL */}
      <Modal
        isOpen={!!activeSession}
        onClose={() => setActiveSession(null)}
        title="Proctored Assessment Incident Review"
        maxWidth="lg"
      >
        {activeSession && (
          <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
            {/* Candidate & Exam Metadata Banner */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="font-mono text-2xs text-slate-400 uppercase">Candidate Profile</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {activeSession.studentName}
                </h3>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Roll No: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeSession.rollNumber}</span> · {activeSession.department} (Sec {activeSession.section})
                </p>
              </div>

              <div className="sm:text-right">
                <span className="font-mono text-2xs text-slate-400 uppercase">Assessment Details</span>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {activeSession.testTitle}
                </p>
                <p className="text-2xs text-slate-500 dark:text-slate-400 font-mono">
                  Score: {activeSession.score}/{activeSession.maxMarks} ({activeSession.percentage}%)
                </p>
              </div>
            </div>

            {/* Incident Summary Badges */}
            <div className="grid grid-cols-3 gap-2 text-2xs text-center">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded">
                <span className="text-amber-800 dark:text-amber-300 font-semibold block">Tab Switches</span>
                <span className="font-mono text-base font-bold text-amber-900 dark:text-amber-200">
                  {activeSession.tabSwitchCount}
                </span>
              </div>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                <span className="text-slate-600 dark:text-slate-400 font-semibold block">Window Blurs</span>
                <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                  {activeSession.windowBlurCount}
                </span>
              </div>
              <div className="p-2.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded">
                <span className="text-red-800 dark:text-red-300 font-semibold block">Total Infractions</span>
                <span className="font-mono text-base font-bold text-red-900 dark:text-red-200">
                  {activeSession.totalViolations}
                </span>
              </div>
            </div>

            {/* Chronological Incident Timeline */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Chronological Event Audit Trail</span>
                <span className="text-2xs font-normal text-slate-400">
                  {activeSession.events.length} logged incident(s)
                </span>
              </h4>

              {activeSession.events.length === 0 ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>
                    Clean assessment session! The student remained focused inside the active exam window throughout the entire test.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {activeSession.events.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3 bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-md text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-red-900 dark:text-red-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          <span className="font-mono uppercase">{evt.type}</span>
                          <span
                            className={`text-3xs px-1.5 py-0.2 rounded font-semibold uppercase ${
                              evt.severity === 'high'
                                ? 'bg-red-200 text-red-900'
                                : evt.severity === 'medium'
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {evt.severity} severity
                          </span>
                        </div>

                        <span className="font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 text-3xs">
                          <Clock className="w-3 h-3" />
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-slate-800 dark:text-slate-200 leading-snug pl-5 font-medium">
                        {evt.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Faculty Action & Verification Section */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-red-600" />
                <span>Faculty Review & Adjudication</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Adjudication Status
                  </label>
                  <select
                    value={reviewStatusInput}
                    onChange={(e) => setReviewStatusInput(e.target.value as any)}
                    className="w-full h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  >
                    <option value="verified">Verified (No Malpractice Penalty)</option>
                    <option value="flagged">Flagged for Academic Disciplinary Review</option>
                    <option value="dismissed">Dismissed (Inadvertent / Minor Incident)</option>
                  </select>
                </div>

                <div>
                  <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Faculty Remarks / Audit Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Enter review explanation..."
                    value={reviewNotesInput}
                    onChange={(e) => setReviewNotesInput(e.target.value)}
                    className="w-full h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
              </div>

              {reviewSavedMessage && (
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-200 rounded text-2xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{reviewSavedMessage}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSession(null)}
              >
                Close Audit
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveReview}
                className="gap-1.5 font-semibold text-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Adjudication</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
