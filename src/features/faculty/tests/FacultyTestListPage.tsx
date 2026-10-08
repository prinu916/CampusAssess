import { useState, useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { testService } from '../../../services/test.service';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../lib/utils';
import {
  PlusCircle,
  Eye,
  Edit,
  GraduationCap,
  Download,
  Search,
  Filter,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export function FacultyTestListPage() {
  const { navigate } = useRouter();
  const { toast } = useToast();

  const [tests, setTests] = useState(() => testService.getTests('all'));
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'MCQ' | 'CODING'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'upcoming' | 'completed' | 'draft'>('all');

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject) return false;
      }
      return true;
    });
  }, [tests, typeFilter, statusFilter, search]);

  const handleDeleteTest = async (testId: string, testTitle: string) => {
    if (confirm(`Are you sure you want to delete "${testTitle}"?`)) {
      await testService.deleteTest(testId);
      setTests(testService.getTests('all'));
      toast({
        title: 'Test Deleted',
        description: `Assessment "${testTitle}" has been removed.`,
        type: 'info',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assessment Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage question banks, schedules, access rules, and student evaluations.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/faculty/tests/create')}
          className="gap-2 self-start sm:self-auto font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create Test</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests by title or subject..."
            className="w-full h-9 pl-8 pr-3 text-xs rounded-md border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Format:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-8 px-2 text-xs rounded border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Formats</option>
              <option value="MCQ">MCQ</option>
              <option value="CODING">Coding</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 px-2 text-xs rounded border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-red-700 hover:text-red-800 font-medium ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tests Table */}
      {filteredTests.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">
            {search || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No matching tests found'
              : 'No tests created yet'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try modifying your search keywords or clearing active filters.'
              : 'Create your first assessment to assign to student batches.'}
          </p>
          {!search && typeFilter === 'all' && statusFilter === 'all' && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/faculty/tests/create')}
            >
              + Create Test
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-2xs">
                  <th className="py-3 px-4">Test Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Marks</th>
                  <th className="py-3 px-4">Start Window</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{test.title}</span>
                      <span className="text-3xs text-slate-400 font-mono">ID: {test.id}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{test.subject}</td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-2xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {test.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      {test.duration}m
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      {test.maxMarks}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-2xs">
                      {formatDate(test.startTime)}
                    </td>

                    <td className="py-3 px-4 text-center">
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

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/faculty/tests/${test.id}/preview`)}
                          title="Preview Test as Student"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/tests/${test.id}/edit`)}
                          title="Edit Test Configuration"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/tests/${test.id}/results`)}
                          title="View Enrolled Results"
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
                        <button
                          onClick={() => handleDeleteTest(test.id, test.title)}
                          title="Delete Assessment"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
