import { useState, useMemo } from 'react';
import { testService } from '../../../services/test.service';
import { exportService, ExportJobResult } from '../../../services/export.service';
import { Button } from '../../../components/ui/Button';
import { FileSpreadsheet, Download, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export function FacultyExportPage() {
  const tests = useMemo(() => testService.getTests('all'), []);
  const [selectedTestId, setSelectedTestId] = useState<string>(tests[0]?.id || 'test_java_mcq');
  const [format, setFormat] = useState<'csv' | 'xlsx'>('xlsx');

  const [isPreparing, setIsPreparing] = useState(false);
  const [exportResult, setExportResult] = useState<ExportJobResult | null>(null);

  const selectedTest = useMemo(() => {
    return tests.find((t) => t.id === selectedTestId);
  }, [tests, selectedTestId]);

  const handleGenerateExport = async () => {
    setIsPreparing(true);
    setExportResult(null);

    const res = await exportService.generateExport(selectedTestId, format);
    setIsPreparing(false);
    setExportResult(res);
  };

  const handleDownload = () => {
    if (!exportResult) return;
    const a = document.createElement('a');
    a.href = exportResult.downloadUrl;
    a.download = exportResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Export Examination Data</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate official assessment reports, mark ledgers, and institutional transcripts.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
        {/* Select Test */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800">
            Select Assessment
          </label>
          <select
            value={selectedTestId}
            onChange={(e) => {
              setSelectedTestId(e.target.value);
              setExportResult(null);
            }}
            className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
          >
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.type}) — {t.subject}
              </option>
            ))}
          </select>
          {selectedTest && (
            <p className="text-2xs text-slate-500">
              Format: {selectedTest.type} · Max Marks: {selectedTest.maxMarks} · Submissions: {selectedTest.submissionsCount || 39}
            </p>
          )}
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-800">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3.5 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                format === 'xlsx'
                  ? 'border-red-600 bg-red-50/50 text-slate-900 font-medium ring-1 ring-red-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="exportFormat"
                value="xlsx"
                checked={format === 'xlsx'}
                onChange={() => {
                  setFormat('xlsx');
                  setExportResult(null);
                }}
                className="text-red-600 focus:ring-red-600"
              />
              <div>
                <span className="block font-semibold">Excel Spreadsheet (.xlsx)</span>
                <span className="text-2xs text-slate-500">Includes formatted mark sheets and formulas</span>
              </div>
            </label>

            <label
              className={`p-3.5 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                format === 'csv'
                  ? 'border-red-600 bg-red-50/50 text-slate-900 font-medium ring-1 ring-red-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="exportFormat"
                value="csv"
                checked={format === 'csv'}
                onChange={() => {
                  setFormat('csv');
                  setExportResult(null);
                }}
                className="text-red-600 focus:ring-red-600"
              />
              <div>
                <span className="block font-semibold">Comma-Separated Values (.csv)</span>
                <span className="text-2xs text-slate-500">Raw UTF-8 delimited ledger file</span>
              </div>
            </label>
          </div>
        </div>

        {/* Security / Sensitive Fields Assurance Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2 text-2xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Data Governance Compliance:</strong> Student passwords, hashes, session auth tokens, and security keys are permanently excluded from all exports.
          </span>
        </div>

        {/* Generate Action */}
        {!isPreparing && !exportResult && (
          <Button
            variant="primary"
            size="md"
            onClick={handleGenerateExport}
            className="w-full font-semibold text-xs h-10"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Generate Export
          </Button>
        )}

        {/* Preparing State */}
        {isPreparing && (
          <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200 space-y-2 animate-pulse">
            <Loader2 className="w-6 h-6 text-red-700 animate-spin mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">Preparing export...</h3>
            <p className="text-2xs text-slate-500">
              Aggregating test cases, computing grade distributions, and generating file payload.
            </p>
          </div>
        )}

        {/* Export Ready State */}
        {exportResult && (
          <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold">Export Ready</h3>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pl-7">
              <p>
                File Name: <strong className="font-mono text-slate-800">{exportResult.fileName}</strong>
              </p>
              <p>
                Total Records: <strong className="font-mono text-slate-800">{exportResult.rowCount} candidates</strong>
              </p>
              <p>
                File Size: <strong className="font-mono text-slate-800">{(exportResult.fileSizeBytes / 1024).toFixed(1)} KB</strong>
              </p>
            </div>

            <div className="pt-2 pl-7 flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownload}
                className="gap-2 font-semibold text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {format.toUpperCase()}</span>
              </Button>

              <button
                onClick={() => setExportResult(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
