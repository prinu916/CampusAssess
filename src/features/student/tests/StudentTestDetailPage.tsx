import { useState, useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { testService } from '../../../services/test.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../lib/utils';
import {
  ShieldAlert,
  Clock,
  Award,
  AlertTriangle,
  Wifi,
  FileText,
  Code,
  ArrowLeft,
  Info,
} from 'lucide-react';

export function StudentTestDetailPage({ testId }: { testId: string }) {
  const { navigate } = useRouter();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const test = useMemo(() => {
    return testService.getTestById(testId);
  }, [testId]);

  if (!test) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-lg max-w-lg mx-auto">
        <h2 className="text-base font-semibold text-slate-900">Test Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The specified assessment does not exist or has been removed.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/student/tests')}>
          Return to Test Catalog
        </Button>
      </div>
    );
  }

  const isCoding = test.type === 'CODING';
  const itemCount = isCoding ? `${test.problems?.length || 3} Problems` : `${test.questions?.length || 20} Questions`;

  const handleStartExam = () => {
    setShowInstructionsModal(false);
    if (isCoding) {
      navigate(`/student/tests/${test.id}/coding`);
    } else {
      navigate(`/student/tests/${test.id}/exam`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/tests')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Assessments</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-2 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
              {test.type} ASSESSMENT
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{test.subject}</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {test.title}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {test.description}
          </p>
        </div>

        {/* Core Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Assessment Format</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block flex items-center gap-1">
              {isCoding ? <Code className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> : <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />}
              {test.type}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Duration</span>
            <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold mt-0.5 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              {test.duration} Minutes
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Total Items</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block">
              {itemCount}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Maximum Marks</span>
            <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold mt-0.5 block flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              {test.maxMarks} Marks
            </span>
          </div>
        </div>

        {/* Schedule window */}
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Test Window Open:</span>
            <span>{formatDate(test.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Test Window Closes:</span>
            <span>{formatDate(test.endTime)}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            General Instructions
          </h2>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
            {test.instructions.map((inst, i) => (
              <li key={i} className="leading-relaxed">
                {inst}
              </li>
            ))}
          </ul>
        </div>

        {/* Secure Exam Requirements Notice */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs space-y-2 text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Secure Academic Proctoring Notice</span>
          </div>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
            By beginning this test, you consent to strict exam monitoring. Window tab switching, clipboard copying, and opening secondary developer tools are logged. The examination will automatically submit when the duration timer elapses.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Clicking Start Exam begins your timer countdown immediately.
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowInstructionsModal(true)}
            className="font-semibold text-sm px-6"
          >
            Start Test
          </Button>
        </div>
      </div>

      {/* Instructions Modal Before Starting */}
      <Modal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        title="Official Examination Instructions"
        description={test.title}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded text-center">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Duration</p>
              <p className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">{test.duration} Mins</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Total Items</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{itemCount}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Max Score</p>
              <p className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">{test.maxMarks} Marks</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Mandatory Rules & Procedures:</p>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li>You may navigate between questions using the question selector.</li>
              <li>Responses are automatically saved in real time on every selection.</li>
              <li>A timer warning will trigger when 5 minutes remain.</li>
              <li>At 00:00, any saved answers will be automatically finalized and submitted.</li>
              <li>Do not refresh or close your browser tab during an active session.</li>
            </ul>
          </div>

          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded flex items-start gap-2 text-red-900 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
            <span>
              <strong>Secure Browser Warning:</strong> Navigating away from the active tab or attempting to inspect source code may register an integrity infraction.
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Wifi className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>Ensure you have reliable power and steady network access throughout the exam.</span>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructionsModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartExam}
              className="font-semibold"
            >
              I Understand — Start Exam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
