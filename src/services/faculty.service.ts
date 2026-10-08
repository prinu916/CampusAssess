import { FacultyProfile } from '../types/faculty.types';

const FACULTY_PROFILE_KEY = 'campusassess_faculty_profile';

export const INITIAL_FACULTY_PROFILE: FacultyProfile = {
  id: 'fp_01',
  userId: 'usr_faculty_01',
  fullName: 'Dr. Aris Thorne',
  collegeEmail: 'a.thorne@college.edu',
  employeeId: 'FAC-CSE-042',
  department: 'Department of Computer Science & Engineering',
  branch: 'Computer Science',
  designation: 'Associate Professor & Academic Exam Lead',
  phoneNumber: '+91 98765 99887',
  createdAt: '2023-01-10T09:00:00Z',
  updatedAt: '2025-01-05T12:00:00Z',
};

export const facultyService = {
  getProfile(): FacultyProfile {
    try {
      const stored = localStorage.getItem(FACULTY_PROFILE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    localStorage.setItem(FACULTY_PROFILE_KEY, JSON.stringify(INITIAL_FACULTY_PROFILE));
    return INITIAL_FACULTY_PROFILE;
  },

  updateProfile(profile: Partial<FacultyProfile>): Promise<FacultyProfile> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.getProfile();
        const updated: FacultyProfile = {
          ...current,
          ...profile,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(FACULTY_PROFILE_KEY, JSON.stringify(updated));
        resolve(updated);
      }, 350);
    });
  },

  getDashboardStats() {
    return {
      totalTests: 6,
      activeTests: 2,
      totalParticipants: 148,
      completedTests: 3,
    };
  }
};
