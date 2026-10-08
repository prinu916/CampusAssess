import { useState, useEffect } from 'react';
import { useRouter } from '../../../lib/router';
import { useAuth } from '../../../hooks/useAuth';
import { testService } from '../../../services/test.service';
import { resultService } from '../../../services/result.service';
import { reminderService } from '../../../services/reminder.service';
import { Test } from '../../../types/test.types';
import { TestResult } from '../../../types/result.types';
import { ExamReminder } from '../../../types/reminder.types';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../lib/utils';
import {
  FileText,
  Code,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Bell,
  Mail,
  AlertCircle,
} from 'lucide-react';

export function StudentDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [reminders, setReminders] = useState<ExamReminder[]>([]);

  useEffect(() => {
    const all = testService.getTests('all');
    setAvailableTests(all.filter((t) => t.status === 'available'));
    setUpcomingTests(all.filter((t) => t.status === 'upcoming'));
    setRecentResults(resultService.getStudentResults(user?.id || 'usr_student_01'));
    setReminders(reminderService.getStudentReminders(user?.id || 'usr_student_01'));
  }, [user]);

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const unreadReminders = reminders.filter((r) => !r.isRead);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            B.Tech Computer Science & Engineering · Semester 6 · Section A
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/tests')}
          >
            Browse All Tests
          </Button>
        </div>
      </div>

      {/* Automated Deadline & Upcoming Test Reminder Banner */}
      {unreadReminders.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/60 rounded text-red-700 dark:text-red-300 shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-red-950 dark:text-red-200 uppercase tracking-wider font-mono">
                  Automated Academic Reminder
                </span>
                <span className="font-mono text-3xs bg-red-200/80 dark:bg-red-900/80 text-red-900 dark:text-red-200 px-1.5 py-0.2 rounded font-bold">
                  {unreadReminders.length} Pending
                </span>
              </div>
              <p className="text-xs text-red-900 dark:text-red-300 leading-snug">
                {unreadReminders[0].subject}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                reminderService.markAsRead(unreadReminders[0].id);
                navigate(`/student/tests/${unreadReminders[0].testId}`);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white transition-colors whitespace-nowrap"
            >
              Take Assessment
            </button>
          </div>
        </div>
      )}

      {/* Available Tests Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Available Tests</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Exams currently active and open for submission</p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {availableTests.length} Active
          </span>
        </div>

        {availableTests.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Tests Available</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You don't currently have any active assessments assigned to you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTests.map((test) => {
              const isCoding = test.type === 'CODING';
              const questionsCount = isCoding
                ? `${test.problems?.length || 3} Problems`
                : `${test.questions?.length || 20} Questions`;

              return (
                <div
                  key={test.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-red-700 dark:text-red-400 tracking-wide font-mono text-2xs uppercase">
                        {test.type}
                      </span>
                      <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        Available Now
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{test.subject}</p>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>{questionsCount}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{test.duration} Minutes</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{test.maxMarks} Marks</span>
                    </div>
                  </div>

                  <div className="pt-5 mt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full gap-2 text-xs"
                      onClick={() => navigate(`/student/tests/${test.id}`)}
                    >
                      {isCoding ? (
                        <>
                          <Code className="w-3.5 h-3.5" />
                          <span>Start Coding</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Start Test</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming & Recent Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Tests */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Upcoming Tests</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {upcomingTests.length} Scheduled
            </span>
          </div>

          {upcomingTests.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming exams scheduled at this time.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-2xs font-semibold text-slate-700 dark:text-slate-300">{test.type}</span>
                      <span aria-hidden="true">·</span>
                      <span>{test.subject}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{test.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(test.startTime)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{test.duration} mins</span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-center shrink-0">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Results */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Results</h2>
            <button
              onClick={() => navigate('/student/results')}
              className="text-xs text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentResults.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <Award className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No examination results evaluated yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentResults.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  onClick={() => navigate(`/student/results/${res.id}`)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-2xs font-semibold text-slate-700 dark:text-slate-300">{res.testType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(res.submissionTime)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                      {res.testTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{res.subject}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {res.score}/{res.maxMarks}
                    </div>
                    <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      {res.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
