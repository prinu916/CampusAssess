import { ExamReminder, ReminderBroadcastPayload } from '../types/reminder.types';
import { studentService } from './student.service';
import { testService } from './test.service';
import { resultService } from './result.service';

const REMINDERS_STORAGE_KEY = 'campusassess_reminders_store';

export const INITIAL_REMINDERS: ExamReminder[] = [
  {
    id: 'rem_01',
    studentId: 'usr_student_01',
    studentName: 'Priyanshu Kumar',
    studentEmail: 'priyanshu.k@college.edu',
    rollNumber: '21BCSE104',
    testId: 'test_os_upcoming',
    testTitle: 'Operating Systems Internal Assessment',
    channel: 'EMAIL',
    triggerType: 'START_WINDOW',
    subject: '[Upcoming Exam Alert] Operating Systems Internal Assessment scheduled for Oct 12',
    body: 'Dear Priyanshu Kumar,\n\nThis is an automated academic notification that your upcoming assessment "Operating Systems Internal Assessment" opens on Oct 12, 2026 at 10:00 AM IST.\n\nDuration: 45 Minutes · Total Marks: 60.\nPlease ensure you have installed a compatible browser and possess steady internet connectivity.\n\nExamination Cell, IIT & Engineering',
    sentAt: '2026-10-07T08:00:00Z',
    isRead: false,
    status: 'Delivered',
    deadlineDate: '2026-10-12T11:30:00Z',
  },
  {
    id: 'rem_02',
    studentId: 'usr_student_01',
    studentName: 'Priyanshu Kumar',
    studentEmail: 'priyanshu.k@college.edu',
    rollNumber: '21BCSE104',
    testId: 'test_java_mcq',
    testTitle: 'Java Programming',
    channel: 'IN_APP',
    triggerType: 'DEADLINE_URGENT',
    subject: '[Pending Assessment Deadline] Java Programming test window active',
    body: 'Dear Priyanshu,\n\nYour assigned examination "Java Programming" is currently live. The submission deadline approaches on Oct 15, 2026 at 23:59 IST.\n\nEnsure submission before the portal closes.',
    sentAt: '2026-10-08T06:00:00Z',
    isRead: false,
    status: 'Delivered',
    deadlineDate: '2026-10-15T23:59:59Z',
  },
  {
    id: 'rem_03',
    studentId: 'usr_student_03',
    studentName: 'Rohan Verma',
    studentEmail: 'rohan.v@college.edu',
    rollNumber: '21BCSE108',
    testId: 'test_dsa_coding',
    testTitle: 'DSA Coding Challenge',
    channel: 'EMAIL',
    triggerType: 'FACULTY_BROADCAST',
    subject: '[Faculty Reminder] DSA Coding Challenge participation pending',
    body: 'Automated broadcast reminder from Dr. Aris Thorne: Complete your coding assessment before the weekend evaluation cycle concludes.',
    sentAt: '2026-10-08T07:30:00Z',
    isRead: true,
    status: 'Delivered',
    deadlineDate: '2026-10-18T23:59:59Z',
  },
];

export const reminderService = {
  getAllReminders(): ExamReminder[] {
    try {
      const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(INITIAL_REMINDERS));
      return INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  },

  getStudentReminders(studentId: string = 'usr_student_01'): ExamReminder[] {
    const all = this.getAllReminders();
    return all.filter((r) => r.studentId === studentId);
  },

  getUnreadCount(studentId: string = 'usr_student_01'): number {
    return this.getStudentReminders(studentId).filter((r) => !r.isRead).length;
  },

  markAsRead(reminderId: string): void {
    const all = this.getAllReminders();
    const updated = all.map((r) => (r.id === reminderId ? { ...r, isRead: true } : r));
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));
  },

  markAllAsRead(studentId: string = 'usr_student_01'): void {
    const all = this.getAllReminders();
    const updated = all.map((r) => (r.studentId === studentId ? { ...r, isRead: true } : r));
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));
  },

  getParticipationStats(testId: string) {
    const test = testService.getTestById(testId);
    const results = resultService.getFacultyTestResults(testId);
    const allBatchStudents = studentService.getProfile(); // sample student
    const totalEnrolled = test?.participantsCount || 48;
    const submittedCount = results.length || 39;
    const pendingCount = Math.max(0, totalEnrolled - submittedCount);
    const participationRate = Math.round((submittedCount / totalEnrolled) * 100);

    return {
      totalEnrolled,
      submittedCount,
      pendingCount,
      participationRate,
    };
  },

  broadcastReminders(payload: ReminderBroadcastPayload): Promise<{ deliveredCount: number; recipients: string[] }> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const test = testService.getTestById(payload.testId);
        const allStudents = await studentService.getAllStudents();
        const results = resultService.getFacultyTestResults(payload.testId);
        const submittedStudentRolls = new Set(results.map((r) => r.rollNumber));

        // Filter target candidates
        const targets = payload.targetAudience === 'UNSUBMITTED_ONLY'
          ? allStudents.filter((s) => !submittedStudentRolls.has(s.rollNumber))
          : allStudents;

        const all = this.getAllReminders();
        const newReminders: ExamReminder[] = targets.map((s) => ({
          id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          studentId: s.userId || 'usr_student_01',
          studentName: s.fullName,
          studentEmail: s.collegeEmail,
          rollNumber: s.rollNumber,
          testId: payload.testId,
          testTitle: test?.title || 'Examination',
          channel: payload.channels[0] || 'EMAIL',
          triggerType: 'FACULTY_BROADCAST',
          subject: payload.subject,
          body: payload.message.replace('{studentName}', s.fullName).replace('{testTitle}', test?.title || 'Test'),
          sentAt: new Date().toISOString(),
          isRead: false,
          status: 'Delivered',
          deadlineDate: test?.endTime || new Date().toISOString(),
        }));

        const updated = [...newReminders, ...all];
        localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));

        resolve({
          deliveredCount: targets.length,
          recipients: targets.map((t) => t.collegeEmail),
        });
      }, 700);
    });
  },
};
