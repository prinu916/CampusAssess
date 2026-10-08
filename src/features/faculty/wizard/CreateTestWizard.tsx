import React, { useState, useEffect } from 'react';
import { useRouter } from '../../../lib/router';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { testService } from '../../../services/test.service';
import { studentService } from '../../../services/student.service';
import { Test, McqQuestion, CodingProblem, TestCase, CodingExample } from '../../../types/test.types';
import { StudentProfile } from '../../../types/student.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Save,
  Send,
  Users,
  Search,
  Upload,
} from 'lucide-react';
import { BulkUploadCsvModal } from './BulkUploadCsvModal';

export function CreateTestWizard({ editTestId }: { editTestId?: string }) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [students, setStudents] = useState<StudentProfile[]>([]);

  // Test form data
  const [testData, setTestData] = useState<Partial<Test>>({
    title: '',
    subject: '',
    description: '',
    type: 'MCQ',
    duration: 30,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    maxMarks: 50,
    instructions: [
      'Each question carries specified marks. Read questions carefully before selecting.',
      'The assessment will automatically submit when the duration timer concludes.',
      'Strict academic anti-cheat logging is active throughout the test.',
    ],
    questions: [],
    problems: [],
    access: {
      type: 'ALL',
      selectedStudentIds: [],
      department: '',
      branch: '',
      semester: '',
      section: '',
    },
    status: 'available',
  });

  // Load existing test if editing
  useEffect(() => {
    if (editTestId) {
      const existing = testService.getTestById(editTestId);
      if (existing) {
        setTestData(existing);
      }
    }
    studentService.getAllStudents().then(setStudents);
  }, [editTestId]);

  // Sub-modals for Question Builder
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [editingMcqIndex, setEditingMcqIndex] = useState<number | null>(null);
  const [currentMcqForm, setCurrentMcqForm] = useState<McqQuestion>({
    id: '',
    order: 1,
    question: '',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ],
    correctAnswer: 'A',
    marks: 2.5,
  });

  // Coding Builder Modal
  const [showCodingModal, setShowCodingModal] = useState(false);
  const [editingCodingIndex, setEditingCodingIndex] = useState<number | null>(null);
  const [currentCodingForm, setCurrentCodingForm] = useState<CodingProblem>({
    id: '',
    order: 1,
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    allowedLanguages: ['cpp', 'java', 'python', 'javascript'],
    timeLimit: 2,
    memoryLimit: 256,
    testCases: [
      { id: 'tc1', input: '', expectedOutput: '', isHidden: false, marks: 10 },
      { id: 'tc2', input: '', expectedOutput: '', isHidden: true, marks: 15 },
    ],
    starterCode: {
      java: '// Write your Java solution here',
      python: '# Write your Python solution here',
      cpp: '// Write your C++ solution here',
      javascript: '// Write your JS solution here',
    },
  });

  // Bulk CSV Upload Modal state
  const [showBulkCsvModal, setShowBulkCsvModal] = useState(false);

  const handleImportMcqQuestions = (newQuestions: McqQuestion[], mode: 'append' | 'replace') => {
    let finalQuestions: McqQuestion[] = [];
    if (mode === 'replace') {
      finalQuestions = newQuestions;
    } else {
      finalQuestions = [...(testData.questions || []), ...newQuestions];
    }
    finalQuestions = finalQuestions.map((q, idx) => ({ ...q, order: idx + 1 }));

    const totalMarks = finalQuestions.reduce((acc, q) => acc + (q.marks || 0), 0);

    setTestData((prev) => ({
      ...prev,
      questions: finalQuestions,
      maxMarks: totalMarks > 0 ? totalMarks : prev.maxMarks,
    }));

    toast({
      title: 'Bulk Import Successful',
      description: `Imported ${newQuestions.length} questions from CSV.`,
      type: 'success',
    });
  };

  const handleImportCodingProblems = (newProblems: CodingProblem[], mode: 'append' | 'replace') => {
    let finalProblems: CodingProblem[] = [];
    if (mode === 'replace') {
      finalProblems = newProblems;
    } else {
      finalProblems = [...(testData.problems || []), ...newProblems];
    }
    finalProblems = finalProblems.map((p, idx) => ({ ...p, order: idx + 1 }));

    const totalMarks = finalProblems.reduce(
      (acc, p) => acc + (p.testCases ? p.testCases.reduce((s, tc) => s + (tc.marks || 0), 0) : 0),
      0
    );

    setTestData((prev) => ({
      ...prev,
      problems: finalProblems,
      maxMarks: totalMarks > 0 ? totalMarks : prev.maxMarks,
    }));

    toast({
      title: 'Bulk Import Successful',
      description: `Imported ${newProblems.length} coding challenges from CSV.`,
      type: 'success',
    });
  };

  // Search & Batch filters for student access
  const [studentSearch, setStudentSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [secFilter, setSecFilter] = useState('');

  // Step 1 Validation
  const validateStep1 = () => {
    if (!testData.title?.trim()) {
      toast({ title: 'Validation', description: 'Please provide a test title.', type: 'error' });
      return false;
    }
    if (!testData.subject?.trim()) {
      toast({ title: 'Validation', description: 'Please specify the subject/course.', type: 'error' });
      return false;
    }
    if (!testData.duration || testData.duration <= 0) {
      toast({ title: 'Validation', description: 'Duration must be greater than 0 minutes.', type: 'error' });
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (testData.type === 'MCQ' && (!testData.questions || testData.questions.length === 0)) {
      toast({ title: 'Validation', description: 'Please add at least one MCQ question.', type: 'error' });
      return false;
    }
    if (testData.type === 'CODING' && (!testData.problems || testData.problems.length === 0)) {
      toast({ title: 'Validation', description: 'Please add at least one coding problem.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Save MCQ handler
  const handleSaveMcq = () => {
    if (!currentMcqForm.question.trim()) {
      toast({ title: 'Validation', description: 'Question text cannot be blank.', type: 'error' });
      return;
    }
    const currentList = [...(testData.questions || [])];
    if (editingMcqIndex !== null) {
      currentList[editingMcqIndex] = { ...currentMcqForm };
    } else {
      currentList.push({
        ...currentMcqForm,
        id: `q_${Date.now()}`,
        order: currentList.length + 1,
      });
    }
    setTestData({ ...testData, questions: currentList });
    setShowMcqModal(false);
  };

  // Save Coding handler
  const handleSaveCoding = () => {
    if (!currentCodingForm.title.trim()) {
      toast({ title: 'Validation', description: 'Problem title cannot be blank.', type: 'error' });
      return;
    }
    const currentList = [...(testData.problems || [])];
    if (editingCodingIndex !== null) {
      currentList[editingCodingIndex] = { ...currentCodingForm };
    } else {
      currentList.push({
        ...currentCodingForm,
        id: `cp_${Date.now()}`,
        order: currentList.length + 1,
      });
    }
    setTestData({ ...testData, problems: currentList });
    setShowCodingModal(false);
  };

  // Final Publish handler
  const handlePublish = async (isDraft: boolean = false) => {
    try {
      const payload: Partial<Test> = {
        ...testData,
        status: isDraft ? 'draft' : 'available',
        createdByName: user?.name || 'Dr. Aris Thorne',
      };

      if (editTestId) {
        await testService.updateTest(editTestId, payload);
        toast({
          title: isDraft ? 'Draft Saved' : 'Test Published',
          description: `Assessment "${testData.title}" has been ${isDraft ? 'saved as draft' : 'published successfully'}.`,
          type: 'success',
        });
      } else {
        await testService.createTest(payload);
        toast({
          title: isDraft ? 'Draft Saved' : 'Test Published',
          description: `Assessment "${testData.title}" is now ${isDraft ? 'in draft mode' : 'live for enrolled students'}.`,
          type: 'success',
        });
      }
      navigate('/faculty/tests');
    } catch {
      toast({ title: 'Error', description: 'Failed to save assessment.', type: 'error' });
    }
  };

  // Filtered students for Step 3
  const filteredStudents = students.filter((s) => {
    if (deptFilter && !s.department.includes(deptFilter)) return false;
    if (secFilter && s.section !== secFilter) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchRoll = s.rollNumber.toLowerCase().includes(q);
      if (!matchName && !matchRoll) return false;
    }
    return true;
  });

  const selectedStudentIds = testData.access?.selectedStudentIds || [];

  const handleToggleStudent = (id: string) => {
    const isSelected = selectedStudentIds.includes(id);
    const updated = isSelected ? selectedStudentIds.filter((x) => x !== id) : [...selectedStudentIds, id];
    setTestData({
      ...testData,
      access: { ...testData.access!, type: 'SELECTED', selectedStudentIds: updated },
    });
  };

  const handleSelectAllFiltered = () => {
    const ids = Array.from(new Set([...selectedStudentIds, ...filteredStudents.map((s) => s.id)]));
    setTestData({
      ...testData,
      access: { ...testData.access!, type: 'SELECTED', selectedStudentIds: ids },
    });
  };

  const handleClearAllSelected = () => {
    setTestData({
      ...testData,
      access: { ...testData.access!, selectedStudentIds: [] },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {editTestId ? 'Edit Assessment' : 'Create New Assessment'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Step {step} of 5 — {getStepTitle(step)}
          </p>
        </div>

        <button
          onClick={() => navigate('/faculty/tests')}
          className="text-xs text-slate-500 hover:text-slate-800 self-start sm:self-auto font-medium"
        >
          Cancel & Exit
        </button>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2 bg-white border border-slate-200 rounded-lg p-3 text-2xs font-semibold">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`flex items-center justify-center p-2 rounded transition-colors text-center ${
              s === step
                ? 'bg-red-700 text-white'
                : s < step
                ? 'bg-red-50 text-red-700'
                : 'text-slate-400 bg-slate-50'
            }`}
          >
            <span>
              {s}. {getStepShortTitle(s)}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Step 1 — Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Test Title"
              value={testData.title}
              onChange={(e) => setTestData({ ...testData, title: e.target.value })}
              placeholder="e.g. Java Programming End-Term"
              required
            />

            <Input
              label="Subject / Course Code"
              value={testData.subject}
              onChange={(e) => setTestData({ ...testData, subject: e.target.value })}
              placeholder="e.g. Object-Oriented Programming (CS301)"
              required
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Description / Syllabus Scope
              </label>
              <textarea
                value={testData.description}
                onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                rows={3}
                placeholder="Briefly state syllabus coverage, allowed materials, and purpose..."
                className="w-full text-xs p-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <Select
              label="Assessment Format"
              value={testData.type}
              onChange={(e) => setTestData({ ...testData, type: e.target.value as any })}
              required
              options={[
                { value: 'MCQ', label: 'Multiple Choice Questions (MCQ)' },
                { value: 'CODING', label: 'Algorithmic Coding Challenge (IDE)' },
              ]}
            />

            <Input
              label="Duration (in minutes)"
              type="number"
              value={testData.duration}
              onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) || 0 })}
              required
            />

            <Input
              label="Start Date / Time"
              type="datetime-local"
              value={testData.startTime}
              onChange={(e) => setTestData({ ...testData, startTime: e.target.value })}
              required
            />

            <Input
              label="End Date / Time"
              type="datetime-local"
              value={testData.endTime}
              onChange={(e) => setTestData({ ...testData, endTime: e.target.value })}
              required
            />

            <Input
              label="Maximum Marks"
              type="number"
              value={testData.maxMarks}
              onChange={(e) => setTestData({ ...testData, maxMarks: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
        </div>
      )}

      {/* STEP 2: Questions Builder */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Step 2 — {testData.type === 'MCQ' ? 'MCQ Question Bank' : 'Coding Problems Suite'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {testData.type === 'MCQ'
                  ? `${(testData.questions || []).length} questions configured`
                  : `${(testData.problems || []).length} problems configured`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBulkCsvModal(true)}
                className="gap-1.5 text-xs text-red-700 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Bulk Upload CSV</span>
              </Button>

              {testData.type === 'MCQ' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingMcqIndex(null);
                    setCurrentMcqForm({
                      id: '',
                      order: (testData.questions || []).length + 1,
                      question: '',
                      options: [
                        { id: 'A', text: '' },
                        { id: 'B', text: '' },
                        { id: 'C', text: '' },
                        { id: 'D', text: '' },
                      ],
                      correctAnswer: 'A',
                      marks: 2.5,
                    });
                    setShowMcqModal(true);
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingCodingIndex(null);
                    setCurrentCodingForm({
                      id: '',
                      order: (testData.problems || []).length + 1,
                      title: '',
                      description: '',
                      inputFormat: '',
                      outputFormat: '',
                      constraints: '',
                      examples: [{ input: '', output: '', explanation: '' }],
                      allowedLanguages: ['cpp', 'java', 'python', 'javascript'],
                      timeLimit: 2,
                      memoryLimit: 256,
                      testCases: [
                        { id: 'tc1', input: '', expectedOutput: '', isHidden: false, marks: 10 },
                        { id: 'tc2', input: '', expectedOutput: '', isHidden: true, marks: 15 },
                      ],
                      starterCode: {
                        java: '// Starter code',
                        python: '# Starter code',
                        cpp: '// Starter code',
                        javascript: '// Starter code',
                      },
                    });
                    setShowCodingModal(true);
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Coding Problem</span>
                </Button>
              )}
            </div>
          </div>

          {/* List of MCQ Questions */}
          {testData.type === 'MCQ' && (
            <div className="space-y-3">
              {(testData.questions || []).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500">
                  No questions added yet. Click "Add Question" to construct your multiple-choice set.
                </div>
              ) : (
                (testData.questions || []).map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-md border border-slate-200 bg-slate-50 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700">Q{idx + 1}.</span>
                        <span className="font-semibold text-slate-900">{q.question}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-2xs text-slate-600 pl-5">
                        {q.options.map((opt) => (
                          <span
                            key={opt.id}
                            className={opt.id === q.correctAnswer ? 'text-emerald-700 font-semibold' : ''}
                          >
                            {opt.id}) {opt.text} {opt.id === q.correctAnswer && '✓ (Correct)'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-2xs text-slate-500 mr-2">{q.marks} Marks</span>
                      <button
                        onClick={() => {
                          setEditingMcqIndex(idx);
                          setCurrentMcqForm({ ...q });
                          setShowMcqModal(true);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-800"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const updated = (testData.questions || []).filter((_, i) => i !== idx);
                          setTestData({ ...testData, questions: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* List of Coding Problems */}
          {testData.type === 'CODING' && (
            <div className="space-y-3">
              {(testData.problems || []).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500">
                  No coding problems added yet. Click "Add Coding Problem" to configure algorithmic tasks.
                </div>
              ) : (
                (testData.problems || []).map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-md border border-slate-200 bg-slate-50 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-red-700">P{idx + 1}.</span>
                        <span className="font-semibold text-slate-900">{p.title}</span>
                      </div>
                      <p className="text-slate-500 text-2xs line-clamp-1">{p.description}</p>
                      <div className="flex items-center gap-3 text-2xs text-slate-500 pt-1">
                        <span>{p.testCases.length} Test Cases</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.testCases.filter((tc) => tc.isHidden).length} Hidden Tests</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.timeLimit}s Time Limit</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingCodingIndex(idx);
                          setCurrentCodingForm({ ...p });
                          setShowCodingModal(true);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-800"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const updated = (testData.problems || []).filter((_, i) => i !== idx);
                          setTestData({ ...testData, problems: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Access Selection */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <h2 className="text-sm font-semibold text-slate-900">Step 3 — Access & Candidate Eligibility</h2>

          {/* Access Radio */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="accessType"
                checked={testData.access?.type === 'ALL'}
                onChange={() => setTestData({ ...testData, access: { ...testData.access!, type: 'ALL' } })}
                className="text-red-600 focus:ring-red-600"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block">All Registered Students</span>
                <span className="text-slate-500">Open to every student enrolled in the institution.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="accessType"
                checked={testData.access?.type === 'SELECTED'}
                onChange={() => setTestData({ ...testData, access: { ...testData.access!, type: 'SELECTED' } })}
                className="text-red-600 focus:ring-red-600"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block">Selected Batches / Specific Students</span>
                <span className="text-slate-500">Filter and restrict entry to chosen departments, sections, or roll numbers.</span>
              </div>
            </label>
          </div>

          {/* If Selected Students */}
          {testData.access?.type === 'SELECTED' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search candidate by name or roll..."
                    className="w-full h-8 pl-8 pr-3 text-xs rounded border border-slate-300"
                  />
                </div>

                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="h-8 px-2 text-xs rounded border border-slate-300 bg-white"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                </select>

                <select
                  value={secFilter}
                  onChange={(e) => setSecFilter(e.target.value)}
                  className="h-8 px-2 text-xs rounded border border-slate-300 bg-white"
                >
                  <option value="">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleSelectAllFiltered}
                    className="text-xs text-red-700 hover:text-red-800 font-semibold"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={handleClearAllSelected}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Student Selection Table */}
              <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-3xs font-semibold sticky top-0">
                    <tr>
                      <th className="p-2 w-10 text-center">Select</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Roll Number</th>
                      <th className="p-2">Department</th>
                      <th className="p-2">Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => {
                      const isChecked = selectedStudentIds.includes(s.id);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleStudent(s.id)}
                              className="rounded text-red-600 focus:ring-red-600 h-3.5 w-3.5"
                            />
                          </td>
                          <td className="p-2 font-medium text-slate-900">{s.fullName}</td>
                          <td className="p-2 font-mono text-slate-600">{s.rollNumber}</td>
                          <td className="p-2 text-slate-500">{s.department}</td>
                          <td className="p-2 text-slate-600">{s.section}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-2xs text-slate-500">
                {selectedStudentIds.length} candidate(s) currently selected for access.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Preview */}
      {step === 4 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Step 4 — Student Test Preview</h2>
              <p className="text-xs text-slate-500">Exact layout and presentation rendered to candidates.</p>
            </div>
            <span className="text-2xs uppercase tracking-wider font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              PREVIEW MODE
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                {testData.type} ASSESSMENT
              </span>
              <span className="font-mono text-slate-600">{testData.duration} Mins</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{testData.title || 'Untitled Assessment'}</h3>
            <p className="text-slate-600">{testData.description || 'No description provided.'}</p>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500">
              <span>Total Questions/Problems: {testData.type === 'MCQ' ? testData.questions?.length : testData.problems?.length}</span>
              <span>Max Marks: {testData.maxMarks}</span>
            </div>
          </div>

          {/* Sample First Question Preview */}
          {testData.type === 'MCQ' && (testData.questions || [])[0] && (
            <div className="p-4 border border-slate-200 rounded-lg space-y-3 text-xs">
              <span className="font-mono text-2xs text-slate-400">Sample Question Preview:</span>
              <p className="font-semibold text-slate-900">{(testData.questions || [])[0].question}</p>
              <div className="grid grid-cols-2 gap-2">
                {(testData.questions || [])[0].options.map((opt) => (
                  <div key={opt.id} className="p-2 rounded border border-slate-200 bg-white text-slate-700">
                    <span className="font-mono font-bold mr-1">{opt.id})</span> {opt.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Publish Summary */}
      {step === 5 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <h2 className="text-sm font-semibold text-slate-900">Step 5 — Publish & Confirm</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Assessment Format</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{testData.type}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Items</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {testData.type === 'MCQ' ? `${testData.questions?.length || 0} Questions` : `${testData.problems?.length || 0} Problems`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Duration</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">{testData.duration} Mins</span>
            </div>
            <div>
              <span className="text-slate-500 block">Maximum Marks</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">{testData.maxMarks}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Test Title:</span>
              <span>{testData.title}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Subject:</span>
              <span>{testData.subject}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Candidate Access:</span>
              <span>
                {testData.access?.type === 'ALL'
                  ? 'All Registered Students'
                  : `${selectedStudentIds.length} Selected Candidates`}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Exam Window:</span>
              <span>{formatDate(testData.startTime!)} – {formatDate(testData.endTime!)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => handlePublish(true)}>
              <Save className="w-3.5 h-3.5 mr-1" />
              Save Draft
            </Button>

            <Button variant="primary" size="md" onClick={() => handlePublish(false)} className="font-semibold">
              <Send className="w-4 h-4 mr-1.5" />
              Publish Test
            </Button>
          </div>
        </div>
      )}

      {/* WIZARD FOOTER NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-1 text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {step < 5 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            className="gap-1 text-xs font-semibold"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* MCQ QUESTION BUILDER MODAL */}
      <Modal
        isOpen={showMcqModal}
        onClose={() => setShowMcqModal(false)}
        title={editingMcqIndex !== null ? 'Edit MCQ Question' : 'Add MCQ Question'}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Question Text <span className="text-red-600">*</span>
            </label>
            <textarea
              value={currentMcqForm.question}
              onChange={(e) => setCurrentMcqForm({ ...currentMcqForm, question: e.target.value })}
              rows={3}
              placeholder="Enter clear question statement..."
              className="w-full p-2.5 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentMcqForm.options.map((opt, i) => (
              <div key={opt.id} className="space-y-1">
                <label className="block text-2xs font-semibold text-slate-700">
                  Option {opt.id}
                </label>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => {
                    const next = [...currentMcqForm.options];
                    next[i] = { ...next[i], text: e.target.value };
                    setCurrentMcqForm({ ...currentMcqForm, options: next });
                  }}
                  placeholder={`Choice ${opt.id}`}
                  className="w-full h-8 px-2.5 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Select
              label="Correct Answer"
              value={currentMcqForm.correctAnswer}
              onChange={(e) => setCurrentMcqForm({ ...currentMcqForm, correctAnswer: e.target.value as any })}
              options={[
                { value: 'A', label: 'Option A' },
                { value: 'B', label: 'Option B' },
                { value: 'C', label: 'Option C' },
                { value: 'D', label: 'Option D' },
              ]}
            />

            <Input
              label="Marks Allocated"
              type="number"
              step="0.5"
              value={currentMcqForm.marks}
              onChange={(e) => setCurrentMcqForm({ ...currentMcqForm, marks: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowMcqModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveMcq}>
              Save Question
            </Button>
          </div>
        </div>
      </Modal>

      {/* CODING PROBLEM BUILDER MODAL */}
      <Modal
        isOpen={showCodingModal}
        onClose={() => setShowCodingModal(false)}
        title={editingCodingIndex !== null ? 'Edit Coding Problem' : 'Add Coding Problem'}
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Problem Title"
            value={currentCodingForm.title}
            onChange={(e) => setCurrentCodingForm({ ...currentCodingForm, title: e.target.value })}
            placeholder="e.g. Invert Binary Tree"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Description & Task Details
            </label>
            <textarea
              value={currentCodingForm.description}
              onChange={(e) => setCurrentCodingForm({ ...currentCodingForm, description: e.target.value })}
              rows={4}
              placeholder="Detailed algorithmic requirements..."
              className="w-full p-2.5 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none font-mono text-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-semibold text-slate-700 mb-1">Input Format</label>
              <textarea
                value={currentCodingForm.inputFormat}
                onChange={(e) => setCurrentCodingForm({ ...currentCodingForm, inputFormat: e.target.value })}
                rows={2}
                className="w-full p-2 rounded border border-slate-300 text-xs font-mono text-2xs"
              />
            </div>
            <div>
              <label className="block text-2xs font-semibold text-slate-700 mb-1">Output Format</label>
              <textarea
                value={currentCodingForm.outputFormat}
                onChange={(e) => setCurrentCodingForm({ ...currentCodingForm, outputFormat: e.target.value })}
                rows={2}
                className="w-full p-2 rounded border border-slate-300 text-xs font-mono text-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-700 mb-1">Constraints</label>
            <textarea
              value={currentCodingForm.constraints}
              onChange={(e) => setCurrentCodingForm({ ...currentCodingForm, constraints: e.target.value })}
              rows={2}
              placeholder="e.g. 1 <= N <= 10^5"
              className="w-full p-2 rounded border border-slate-300 text-xs font-mono text-2xs"
            />
          </div>

          {/* Test Cases with Hidden Visual Marks */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="font-semibold text-slate-800 block">Evaluation Test Cases:</span>
            {currentCodingForm.testCases.map((tc, idx) => (
              <div key={tc.id} className="p-3 rounded border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xs font-bold text-slate-700">Test Case #{idx + 1}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-2xs font-semibold text-red-700">
                    <input
                      type="checkbox"
                      checked={tc.isHidden}
                      onChange={(e) => {
                        const next = [...currentCodingForm.testCases];
                        next[idx] = { ...next[idx], isHidden: e.target.checked };
                        setCurrentCodingForm({ ...currentCodingForm, testCases: next });
                      }}
                      className="rounded text-red-600 focus:ring-red-600"
                    />
                    <span>Mark as Hidden Evaluation Test</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                  <input
                    type="text"
                    value={tc.input}
                    onChange={(e) => {
                      const next = [...currentCodingForm.testCases];
                      next[idx] = { ...next[idx], input: e.target.value };
                      setCurrentCodingForm({ ...currentCodingForm, testCases: next });
                    }}
                    placeholder="Input string"
                    className="h-8 px-2 rounded border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    value={tc.expectedOutput}
                    onChange={(e) => {
                      const next = [...currentCodingForm.testCases];
                      next[idx] = { ...next[idx], expectedOutput: e.target.value };
                      setCurrentCodingForm({ ...currentCodingForm, testCases: next });
                    }}
                    placeholder="Expected Output"
                    className="h-8 px-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowCodingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCoding}>
              Save Coding Problem
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Upload CSV Modal */}
      <BulkUploadCsvModal
        isOpen={showBulkCsvModal}
        onClose={() => setShowBulkCsvModal(false)}
        testType={testData.type || 'MCQ'}
        existingQuestionsCount={
          testData.type === 'MCQ'
            ? (testData.questions || []).length
            : (testData.problems || []).length
        }
        onImportMcq={handleImportMcqQuestions}
        onImportCoding={handleImportCodingProblems}
      />
    </div>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return 'Basic Information';
    case 2:
      return 'Question Authoring';
    case 3:
      return 'Candidate Eligibility';
    case 4:
      return 'Student Interface Preview';
    case 5:
      return 'Publish & Summary';
    default:
      return '';
  }
}

function getStepShortTitle(step: number): string {
  switch (step) {
    case 1:
      return 'Details';
    case 2:
      return 'Questions';
    case 3:
      return 'Access';
    case 4:
      return 'Preview';
    case 5:
      return 'Publish';
    default:
      return '';
  }
}
