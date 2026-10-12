import { useState, useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { useAuth } from '../../../hooks/useAuth';
import { testService } from '../../../services/test.service';
import { facultyService } from '../../../services/faculty.service';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../lib/utils';
import {
  PlusCircle,
  Eye,
  Edit,
  GraduationCap,
  Download,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { FacultyCategoryPerformanceWidget } from './FacultyCategoryPerformanceWidget';

export function FacultyDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [tests] = useState(() => testService.getTests('all'));
  const stats = useMemo(() => facultyService.getDashboardStats(), []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, {user?.name || 'Faculty'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of Computer Science & Engineering · Academic Assessment Management
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/faculty/tests/create')}
          className="gap-2 self-start sm:self-auto font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Test</span>
        </Button>
      </div>

      {/* Stats Summary Grid (Useful stats only, anti-slop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Tests
          </span>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {stats.totalTests}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">Course modules authored</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Tests
          </span>
          <div className="font-mono text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {stats.activeTests}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">Currently accepting submissions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Participants
          </span>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {stats.totalParticipants}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">Enrolled student attempts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
            Completed Tests
          </span>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {stats.completedTests}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">Evaluated and finalized</span>
        </div>
      </div>

      {/* Cohort Category Performance Analytics (Recharts Widget) */}
      <FacultyCategoryPerformanceWidget />

      {/* Proctoring & Tab-Switching Security Monitor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Proctoring & Tab-Switching Integrity Monitor
              </h3>
              <span className="font-mono text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Active Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated surveillance logged browser tab switching, focus loss (Alt+Tab), and clipboard interception during active exam sessions.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/faculty/proctoring')}
          className="gap-1.5 text-xs font-semibold shrink-0"
        >
          <span>Review Incident Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Your Tests Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Your Tests</h2>
            <p className="text-xs text-slate-500">Scheduled and active assessment pipelines</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/faculty/tests')}
          >
            View All Tests
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-2xs">
                  <th className="py-3 px-4">Test</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date Window</th>
                  <th className="py-3 px-4 text-center">Participants</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{test.title}</div>
                      <div className="text-2xs text-slate-500">{test.subject}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-2xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {test.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(test.startTime)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-800 tabular-nums">
                      {test.participantsCount}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-2xs font-medium px-2 py-0.5 rounded capitalize ${
                          test.status === 'available'
                            ? 'text-emerald-700 bg-emerald-50'
                            : test.status === 'upcoming'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-slate-600 bg-slate-100'
                        }`}
                      >
                        {test.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/faculty/tests/${test.id}/preview`)}
                          title="Preview Test"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/tests/${test.id}/edit`)}
                          title="Edit Test"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/tests/${test.id}/results`)}
                          title="View Student Results"
                          className="p-1.5 text-red-700 hover:text-red-900 hover:bg-red-50 rounded"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/export`)}
                          title="Export Test Report"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
