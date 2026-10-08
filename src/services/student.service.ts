import { StudentProfile } from '../types/student.types';

const STUDENT_PROFILE_KEY = 'campusassess_student_profile';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'sp_01',
  userId: 'usr_student_01',
  fullName: 'Priyanshu Kumar',
  collegeEmail: 'priyanshu.k@college.edu',
  rollNumber: '21BCSE104',
  branch: 'Computer Science and Engineering',
  course: 'B.Tech',
  department: 'Department of Computer Science',
  section: 'A',
  semester: '6th Semester',
  phoneNumber: '+91 98765 43210',
  profilePhoto: '',
  createdAt: '2024-08-15T10:00:00Z',
  updatedAt: '2025-01-10T14:30:00Z',
};

export const MOCK_BATCH_STUDENTS: StudentProfile[] = [
  INITIAL_STUDENT_PROFILE,
  {
    id: 'sp_02',
    userId: 'usr_student_02',
    fullName: 'Ananya Sharma',
    collegeEmail: 'ananya.s@college.edu',
    rollNumber: '21BCSE105',
    branch: 'Computer Science and Engineering',
    course: 'B.Tech',
    department: 'Department of Computer Science',
    section: 'A',
    semester: '6th Semester',
    phoneNumber: '+91 98765 11223',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
  },
  {
    id: 'sp_03',
    userId: 'usr_student_03',
    fullName: 'Rohan Verma',
    collegeEmail: 'rohan.v@college.edu',
    rollNumber: '21BCSE108',
    branch: 'Computer Science and Engineering',
    course: 'B.Tech',
    department: 'Department of Computer Science',
    section: 'B',
    semester: '6th Semester',
    phoneNumber: '+91 98765 22334',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
  },
  {
    id: 'sp_04',
    userId: 'usr_student_04',
    fullName: 'Sneha Patel',
    collegeEmail: 'sneha.p@college.edu',
    rollNumber: '21BCSE112',
    branch: 'Information Technology',
    course: 'B.Tech',
    department: 'Department of Computer Science',
    section: 'A',
    semester: '6th Semester',
    phoneNumber: '+91 98765 33445',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
  },
  {
    id: 'sp_05',
    userId: 'usr_student_05',
    fullName: 'Vikramaditya Nair',
    collegeEmail: 'vikram.n@college.edu',
    rollNumber: '21BCSE119',
    branch: 'Computer Science and Engineering',
    course: 'B.Tech',
    department: 'Department of Computer Science',
    section: 'A',
    semester: '6th Semester',
    phoneNumber: '+91 98765 44556',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
  },
  {
    id: 'sp_06',
    userId: 'usr_student_06',
    fullName: 'Tanvi Deshmukh',
    collegeEmail: 'tanvi.d@college.edu',
    rollNumber: '21BCSE124',
    branch: 'Computer Science and Engineering',
    course: 'B.Tech',
    department: 'Department of Computer Science',
    section: 'B',
    semester: '6th Semester',
    phoneNumber: '+91 98765 55667',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
  },
  {
    id: 'sp_07',
    userId: 'usr_student_07',
    fullName: 'Aditya Gupta',
    collegeEmail: 'aditya.g@college.edu',
    rollNumber: '21BCSE131',
    branch: 'Electronics & Communication',
    course: 'B.Tech',
    department: 'Department of Electronics',
    section: 'A',
    semester: '6th Semester',
    phoneNumber: '+91 98765 66778',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
  },
];

export const studentService = {
  getProfile(): StudentProfile {
    try {
      const stored = localStorage.getItem(STUDENT_PROFILE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(INITIAL_STUDENT_PROFILE));
    return INITIAL_STUDENT_PROFILE;
  },

  updateProfile(profile: Partial<StudentProfile>): Promise<StudentProfile> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.getProfile();
        const updated: StudentProfile = {
          ...current,
          ...profile,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(updated));
        resolve(updated);
      }, 350);
    });
  },

  getAllStudents(): Promise<StudentProfile[]> {
    return Promise.resolve(MOCK_BATCH_STUDENTS);
  }
};
