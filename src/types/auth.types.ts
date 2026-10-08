export type UserRole = 'student' | 'faculty';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isProfileComplete: boolean;
  isVerified?: boolean;
  verifiedAt?: string;
  avatarUrl?: string;
  phone?: string;
  rollNumber?: string;
  department?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
