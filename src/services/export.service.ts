import { resultService } from './result.service';
import { testService } from './test.service';

export interface ExportJobResult {
  fileName: string;
  rowCount: number;
  fileSizeBytes: number;
  downloadUrl: string;
}

export const exportService = {
  generateExport(testId: string, format: 'csv' | 'xlsx'): Promise<ExportJobResult> {
    return new Promise((resolve) => {
      // Simulate real file generation delay
      setTimeout(() => {
        const test = testService.getTestById(testId);
        const testResults = resultService.getFacultyTestResults(testId);
        const testTitle = test ? test.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Test_Results';

        const headers = [
          'Result_ID',
          'Student_Name',
          'Roll_Number',
          'Department',
          'Section',
          'Score',
          'Max_Marks',
          'Percentage',
          'Time_Taken_Seconds',
          'Submission_Time',
          'Evaluation_Status',
        ];

        const rows = testResults.map((r) => [
          r.id,
          `"${r.studentName}"`,
          r.rollNumber,
          `"${r.department}"`,
          r.section,
          r.score,
          r.maxMarks,
          `${r.percentage}%`,
          r.timeTakenSeconds,
          `"${r.submissionTime}"`,
          r.status,
        ]);

        const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const ext = format === 'csv' ? 'csv' : 'xlsx';
        const fileName = `${testTitle}_Report_${Date.now()}.${ext}`;

        resolve({
          fileName,
          rowCount: testResults.length,
          fileSizeBytes: blob.size,
          downloadUrl,
        });
      }, 1200);
    });
  },
};
