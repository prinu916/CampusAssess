import React, { useState, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { McqQuestion, CodingProblem } from '../../../types/test.types';
import {
  Download,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface BulkUploadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  testType: 'MCQ' | 'CODING';
  existingQuestionsCount: number;
  onImportMcq: (questions: McqQuestion[], mode: 'append' | 'replace') => void;
  onImportCoding: (problems: CodingProblem[], mode: 'append' | 'replace') => void;
}

interface ParsedRow {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  data: any;
}

const SAMPLE_MCQ_CSV = `question,optionA,optionB,optionC,optionD,correctAnswer,marks
"What is the average time complexity of Binary Search in a sorted array?","O(n)","O(log n)","O(n log n)","O(1)","B","2.5"
"Which data structure operates on a First-In-First-Out (FIFO) principle?","Stack","Queue","Binary Heap","Graph","B","2.5"
"What is the primary purpose of Virtual Memory in operating systems?","Speed up CPU cache","Simulate additional RAM using disk storage","Directly execute machine code","Compress disk files","B","2.5"
"In relational databases, which SQL clause is used to filter aggregated group records?","WHERE","HAVING","GROUP BY","FILTER","B","2.5"
"Which OOP principle allows a subclass to provide a specific implementation of a parent method?","Encapsulation","Polymorphism (Method Overriding)","Abstraction","Coupling","B","2.5"`;

const SAMPLE_CODING_CSV = `title,description,difficulty,marks,timeLimit,memoryLimit,inputFormat,outputFormat,sampleInput,sampleOutput
"Two Sum Problem","Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.","EASY","10","2","256","Array nums followed by target integer","Space-separated indices of the two numbers","4\n2 7 11 15\n9","0 1"
"Valid Palindrome String","Given a string s, determine if it is a palindrome considering only alphanumeric characters and ignoring cases.","MEDIUM","15","2","256","Single line string s","true or false","A man, a plan, a canal: Panama","true"
"Reverse Linked List","Given the head of a singly linked list, reverse the list and return the reversed list.","EASY","10","1","128","Space-separated integers representing nodes","Space-separated integers of reversed list","1 2 3 4 5","5 4 3 2 1"`;

export function BulkUploadCsvModal({
  isOpen,
  onClose,
  testType,
  existingQuestionsCount,
  onImportMcq,
  onImportCoding,
}: BulkUploadCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to split CSV line while respecting quoted strings
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const processCsvText = (text: string) => {
    setParseError(null);
    setIsParsing(true);
    setCsvRawText(text);

    try {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        setParseError('The CSV file appears empty or is missing header rows.');
        setParsedRows([]);
        setIsParsing(false);
        return;
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_]/g, ''));
      const parsed: ParsedRow[] = [];

      if (testType === 'MCQ') {
        // Required headers for MCQ: question, optionA, optionB, optionC, optionD, correctAnswer, marks
        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          const errors: string[] = [];

          const rowData: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowData[h] = values[idx] || '';
          });

          const questionText = rowData['question'] || values[0] || '';
          const optA = rowData['optiona'] || values[1] || '';
          const optB = rowData['optionb'] || values[2] || '';
          const optC = rowData['optionc'] || values[3] || '';
          const optD = rowData['optiond'] || values[4] || '';
          const rawAnswer = (rowData['correctanswer'] || values[5] || '').toUpperCase();
          const marks = parseFloat(rowData['marks'] || values[6] || '2.5') || 2.5;

          if (!questionText) errors.push('Missing question text');
          if (!optA) errors.push('Option A is missing');
          if (!optB) errors.push('Option B is missing');
          if (!optC) errors.push('Option C is missing');
          if (!optD) errors.push('Option D is missing');
          if (!['A', 'B', 'C', 'D'].includes(rawAnswer)) {
            errors.push(`Correct answer must be A, B, C, or D (got "${rawAnswer}")`);
          }

          parsed.push({
            rowNumber: i + 1,
            isValid: errors.length === 0,
            errors,
            data: {
              question: questionText,
              options: [
                { id: 'A', text: optA },
                { id: 'B', text: optB },
                { id: 'C', text: optC },
                { id: 'D', text: optD },
              ],
              correctAnswer: rawAnswer as 'A' | 'B' | 'C' | 'D',
              marks,
            },
          });
        }
      } else {
        // Coding challenge format
        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          const errors: string[] = [];

          const rowData: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowData[h] = values[idx] || '';
          });

          const title = rowData['title'] || values[0] || '';
          const description = rowData['description'] || values[1] || '';
          const difficulty = (rowData['difficulty'] || values[2] || 'MEDIUM').toUpperCase();
          const marks = parseFloat(rowData['marks'] || values[3] || '10') || 10;
          const timeLimit = parseFloat(rowData['timelimit'] || values[4] || '2') || 2;
          const memoryLimit = parseInt(rowData['memorylimit'] || values[5] || '256') || 256;
          const inputFormat = rowData['inputformat'] || values[6] || 'Standard input format';
          const outputFormat = rowData['outputformat'] || values[7] || 'Standard output format';
          const sampleInput = rowData['sampleinput'] || values[8] || '';
          const sampleOutput = rowData['sampleoutput'] || values[9] || '';

          if (!title) errors.push('Missing problem title');
          if (!description) errors.push('Missing problem description');

          parsed.push({
            rowNumber: i + 1,
            isValid: errors.length === 0,
            errors,
            data: {
              title,
              description,
              difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(difficulty) ? difficulty : 'MEDIUM',
              marks,
              timeLimit,
              memoryLimit,
              inputFormat,
              outputFormat,
              sampleInput,
              sampleOutput,
            },
          });
        }
      }

      setParsedRows(parsed);
    } catch {
      setParseError('Failed to parse CSV file. Please verify delimiter format.');
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processCsvText(text);
      }
    };
    reader.readAsText(uploaded);
  };

  const handleLoadSample = () => {
    const sample = testType === 'MCQ' ? SAMPLE_MCQ_CSV : SAMPLE_CODING_CSV;
    setFile(null);
    processCsvText(sample);
  };

  const handleDownloadTemplate = () => {
    const csvContent = testType === 'MCQ' ? SAMPLE_MCQ_CSV : SAMPLE_CODING_CSV;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      testType === 'MCQ' ? 'campustest_mcq_template.csv' : 'campustest_coding_template.csv'
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleExecuteImport = () => {
    if (validRows.length === 0) return;

    if (testType === 'MCQ') {
      const questionsToImport: McqQuestion[] = validRows.map((r, idx) => ({
        id: `q_bulk_${Date.now()}_${idx}`,
        order:
          importMode === 'append'
            ? existingQuestionsCount + idx + 1
            : idx + 1,
        question: r.data.question,
        options: r.data.options,
        correctAnswer: r.data.correctAnswer,
        marks: r.data.marks,
      }));
      onImportMcq(questionsToImport, importMode);
    } else {
      const problemsToImport: CodingProblem[] = validRows.map((r, idx) => ({
        id: `prob_bulk_${Date.now()}_${idx}`,
        order:
          importMode === 'append'
            ? existingQuestionsCount + idx + 1
            : idx + 1,
        title: r.data.title,
        description: r.data.description,
        difficulty: r.data.difficulty as any,
        timeLimit: r.data.timeLimit,
        memoryLimit: r.data.memoryLimit,
        inputFormat: r.data.inputFormat,
        outputFormat: r.data.outputFormat,
        constraints: '1 <= N <= 10^5',
        examples: [
          {
            input: r.data.sampleInput || 'Sample input',
            output: r.data.sampleOutput || 'Sample output',
            explanation: 'Standard evaluation test case',
          },
        ],
        allowedLanguages: ['cpp', 'java', 'python', 'javascript'],
        starterCode: {
          java: '// Java Solution\nclass Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
          python: '# Python 3 Solution\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()',
          cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
          javascript: '// JavaScript Solution\nfunction solve() {\n    // Your code here\n}\nsolve();',
        },
        testCases: [
          {
            id: `tc_${Date.now()}_1`,
            input: r.data.sampleInput || 'Sample input 1',
            expectedOutput: r.data.sampleOutput || 'Sample output 1',
            isHidden: false,
            marks: Math.round(r.data.marks * 0.4),
          },
          {
            id: `tc_${Date.now()}_2`,
            input: 'Hidden test case 2',
            expectedOutput: 'Hidden evaluation output',
            isHidden: true,
            marks: Math.round(r.data.marks * 0.6),
          },
        ],
      }));
      onImportCoding(problemsToImport, importMode);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk Upload ${testType === 'MCQ' ? 'MCQ Questions' : 'Coding Problems'} (CSV)`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Template Instructions & Quick Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-red-700 dark:text-red-400" />
              Standardized CampusTest CSV Format
            </h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 max-w-md">
              {testType === 'MCQ'
                ? 'Columns: question, optionA, optionB, optionC, optionD, correctAnswer (A/B/C/D), marks'
                : 'Columns: title, description, difficulty, marks, timeLimit, memoryLimit, inputFormat, outputFormat'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-2xs h-8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleLoadSample}
              className="text-2xs h-8 gap-1.5 bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-900"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Data</span>
            </Button>
          </div>
        </div>

        {/* Drag & Drop File Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 rounded-lg p-6 text-center cursor-pointer bg-white dark:bg-slate-950 transition-colors group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {file ? file.name : 'Click or drag & drop CSV file to upload'}
          </h3>
          <p className="text-2xs text-slate-500 dark:text-slate-400">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB · Click to choose a different CSV file`
              : 'Supports standard CSV format with comma separation and UTF-8 encoding'}
          </p>
        </div>

        {/* Parse Error Alert */}
        {parseError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-md flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Validation Summary Cards */}
        {parsedRows.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <span className="text-2xs text-slate-500 dark:text-slate-400 block font-medium">Total Rows</span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {parsedRows.length}
                </span>
              </div>

              <div className="p-3 rounded border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40">
                <span className="text-2xs text-emerald-700 dark:text-emerald-400 block font-medium">Valid Questions</span>
                <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300 tabular-nums">
                  {validRows.length}
                </span>
              </div>

              <div className="p-3 rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40">
                <span className="text-2xs text-red-700 dark:text-red-400 block font-medium">Validation Issues</span>
                <span className="text-lg font-bold text-red-800 dark:text-red-300 tabular-nums">
                  {invalidRows.length}
                </span>
              </div>
            </div>

            {/* Validation Table Preview */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-2xs font-semibold text-slate-700 dark:text-slate-300">
                <span>CSV Questions Live Preview ({validRows.length} valid / {parsedRows.length} total)</span>
                {invalidRows.length > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-normal">
                    {invalidRows.length} rows will be skipped due to syntax errors
                  </span>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {parsedRows.map((row) => (
                  <div
                    key={row.rowNumber}
                    className={cn(
                      'p-3 flex items-start gap-3 transition-colors',
                      row.isValid
                        ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        : 'bg-red-50/50 dark:bg-red-950/30'
                    )}
                  >
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center font-bold text-2xs shrink-0 mt-0.5',
                        row.isValid
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                      )}
                    >
                      {row.isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </span>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-2xs text-slate-400">Row #{row.rowNumber}</span>
                        {testType === 'MCQ' && (
                          <div className="flex items-center gap-2">
                            <span className="text-2xs px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold font-mono">
                              Key: {row.data.correctAnswer}
                            </span>
                            <span className="text-2xs font-mono text-slate-500">{row.data.marks} pts</span>
                          </div>
                        )}
                        {testType === 'CODING' && (
                          <div className="flex items-center gap-2">
                            <span className="text-2xs px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded font-mono font-semibold">
                              {row.data.difficulty}
                            </span>
                            <span className="text-2xs font-mono text-slate-500">{row.data.marks} pts</span>
                          </div>
                        )}
                      </div>

                      <p className="font-medium text-slate-900 dark:text-slate-100 text-xs truncate">
                        {testType === 'MCQ' ? row.data.question : row.data.title}
                      </p>

                      {testType === 'MCQ' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs text-slate-500 dark:text-slate-400">
                          {row.data.options.map((opt: any) => (
                            <div
                              key={opt.id}
                              className={cn(
                                'truncate px-1.5 py-0.5 rounded',
                                opt.id === row.data.correctAnswer
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-slate-50 dark:bg-slate-800'
                              )}
                            >
                              <span className="font-bold">{opt.id}:</span> {opt.text}
                            </div>
                          ))}
                        </div>
                      )}

                      {!row.isValid && (
                        <p className="text-2xs text-red-600 dark:text-red-400 font-medium">
                          Errors: {row.errors.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Mode Selector */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Import Destination Mode:
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-red-600 focus:ring-red-600"
                  />
                  <span>
                    Append to existing ({existingQuestionsCount} questions currently in test)
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-red-600 focus:ring-red-600"
                  />
                  <span>Replace all current questions</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleExecuteImport}
            disabled={validRows.length === 0}
            className="gap-1.5 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Import {validRows.length} {testType === 'MCQ' ? 'Questions' : 'Problems'}
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
