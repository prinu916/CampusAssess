import { User, UserRole } from '../types/auth.types';

const AUTH_STORAGE_KEY = 'campusassess_auth_user';
const USERS_REGISTRY_KEY = 'campusassess_users_registry';

// Demo student user - by default verified & complete for seamless dashboard navigation
export const DEFAULT_STUDENT_USER: User = {
  id: 'usr_student_01',
  email: 'priyanshu.k@college.edu',
  name: 'Priyanshu Kumar',
  role: 'student',
  isProfileComplete: true,
  isVerified: true,
  verifiedAt: '2026-01-15T10:00:00Z',
  phone: '+91 98765 43210',
  rollNumber: '21BCSE104',
  department: 'Department of Computer Science',
};

// Demo faculty user - by default verified & complete
export const DEFAULT_FACULTY_USER: User = {
  id: 'usr_faculty_01',
  email: 'a.thorne@college.edu',
  name: 'Dr. Aris Thorne',
  role: 'faculty',
  isProfileComplete: true,
  isVerified: true,
  verifiedAt: '2025-08-10T10:00:00Z',
  phone: '+91 98765 99887',
  department: 'Department of Computer Science & Engineering',
};

// Fresh demo users for testing the first-time onboarding & verification requirement
export const FRESH_DEMO_STUDENT_USER: User = {
  id: 'usr_student_fresh',
  email: 'new.student@college.edu',
  name: 'Aarav Sharma',
  role: 'student',
  isProfileComplete: false,
  isVerified: false,
};

export const FRESH_DEMO_FACULTY_USER: User = {
  id: 'usr_faculty_fresh',
  email: 'new.faculty@college.edu',
  name: 'Dr. Neha Kapoor',
  role: 'faculty',
  isProfileComplete: false,
  isVerified: false,
};

// Canonical initial users registry
const INITIAL_REGISTRY: Record<string, User> = {
  'priyanshu.k@college.edu': { ...DEFAULT_STUDENT_USER },
  'a.thorne@college.edu': { ...DEFAULT_FACULTY_USER },
  'new.student@college.edu': { ...FRESH_DEMO_STUDENT_USER },
  'new.faculty@college.edu': { ...FRESH_DEMO_FACULTY_USER },
};

function cleanLegacyStorageKeys() {
  try {
    const legacyPrefix = 'campustest_';
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(legacyPrefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

// Clean old keys on module load
cleanLegacyStorageKeys();

export const authService = {
  getUsersRegistry(): Record<string, User> {
    try {
      const stored = localStorage.getItem(USERS_REGISTRY_KEY);
      if (stored) {
        return { ...INITIAL_REGISTRY, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(INITIAL_REGISTRY));
    return { ...INITIAL_REGISTRY };
  },

  saveUserToRegistry(user: User) {
    try {
      const registry = this.getUsersRegistry();
      const normalizedEmail = user.email.toLowerCase().trim();
      registry[normalizedEmail] = user;
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
    } catch {
      // Ignore
    }
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    // Default to verified demo student user
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_STUDENT_USER));
    return DEFAULT_STUDENT_USER;
  },

  login(email: string, _password: string, role: UserRole): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalized = (email || '').toLowerCase().trim();
        const registry = this.getUsersRegistry();
        const existing = registry[normalized];

        let user: User;

        if (existing) {
          // If the user was already verified & completed previously, PRESERVE IT!
          // They will go straight to the dashboard without filling details again!
          user = {
            ...existing,
            role, // allow role switch if logging into that portal
          };
        } else {
          // First time this email has ever signed in:
          // Must fill all details and verify before entering dashboard
          user = {
            id: `usr_${role}_${Date.now()}`,
            email: normalized || (role === 'student' ? 'student@college.edu' : 'faculty@college.edu'),
            name: normalized ? normalized.split('@')[0].replace('.', ' ') : (role === 'student' ? 'Student' : 'Faculty Member'),
            role,
            isProfileComplete: false,
            isVerified: false,
          };
          this.saveUserToRegistry(user);
        }

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        resolve(user);
      }, 350);
    });
  },

  register(data: { name: string; email: string; role: UserRole }): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalized = data.email.toLowerCase().trim();
        const user: User = {
          id: `usr_${Date.now()}`,
          email: normalized,
          name: data.name,
          role: data.role,
          isProfileComplete: false,
          isVerified: false,
        };
        this.saveUserToRegistry(user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        resolve(user);
      }, 400);
    });
  },

  logout(): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      resolve();
    });
  },

  setProfileComplete(status: boolean): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updated = { ...user, isProfileComplete: status };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    this.saveUserToRegistry(updated);
    return updated;
  },

  verifyAndComplete(details?: Partial<User>): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updated: User = {
      ...user,
      ...details,
      isProfileComplete: true,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    this.saveUserToRegistry(updated);
    return updated;
  },

  resetVerification(): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updated: User = {
      ...user,
      isProfileComplete: false,
      isVerified: false,
      verifiedAt: undefined,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    this.saveUserToRegistry(updated);
    return updated;
  },

  switchRole(role: UserRole): User {
    const target = role === 'student' ? { ...DEFAULT_STUDENT_USER } : { ...DEFAULT_FACULTY_USER };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(target));
    return target;
  },

  // Reset entire application demo data to pristine canonical state
  resetAllDataToDemoClean(): void {
    cleanLegacyStorageKeys();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(INITIAL_REGISTRY));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_STUDENT_USER));
  }
};
