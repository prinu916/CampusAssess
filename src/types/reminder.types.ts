export type ReminderChannel = 'EMAIL' | 'IN_APP' | 'SMS';
export type ReminderTrigger = 'START_WINDOW' | 'EXPIRATION_WARNING' | 'FACULTY_BROADCAST' | 'DEADLINE_URGENT';

export interface ExamReminder {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  testId: string;
  testTitle: string;
  channel: ReminderChannel;
  triggerType: ReminderTrigger;
  subject: string;
  body: string;
  sentAt: string;
  isRead: boolean;
  status: 'Delivered' | 'Scheduled' | 'Pending';
  deadlineDate: string;
}

export interface ReminderBroadcastPayload {
  testId: string;
  subject: string;
  message: string;
  targetAudience: 'ALL_ENROLLED' | 'UNSUBMITTED_ONLY';
  channels: ReminderChannel[];
}
