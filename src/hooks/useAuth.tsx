import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth.types';
import { authService, DEFAULT_STUDENT_USER } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  register: (name: string, email: string, role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => User;
  completeProfile: () => void;
  verifyAndComplete: (details?: Partial<User>) => User | null;
  resetVerification: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAuthenticated: false,
  isVerified: false,
  isLoading: true,
  login: async () => DEFAULT_STUDENT_USER,
  register: async () => DEFAULT_STUDENT_USER,
  logout: async () => {},
  switchRole: () => DEFAULT_STUDENT_USER,
  completeProfile: () => {},
  verifyAndComplete: () => null,
  resetVerification: () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cur = authService.getCurrentUser();
    setUser(cur);
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string, role: UserRole) => {
    setIsLoading(true);
    const u = await authService.login(email, pass, role);
    setUser(u);
    setIsLoading(false);
    return u;
  };

  const register = async (name: string, email: string, role: UserRole) => {
    setIsLoading(true);
    const u = await authService.register({ name, email, role });
    setUser(u);
    setIsLoading(false);
    return u;
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsLoading(false);
  };

  const switchRole = (role: UserRole) => {
    const u = authService.switchRole(role);
    setUser(u);
    return u;
  };

  const completeProfile = () => {
    const u = authService.setProfileComplete(true);
    if (u) setUser(u);
  };

  const verifyAndComplete = (details?: Partial<User>) => {
    const u = authService.verifyAndComplete(details);
    if (u) setUser(u);
    return u;
  };

  const resetVerification = () => {
    const u = authService.resetVerification();
    if (u) setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isVerified: !!user?.isVerified && !!user?.isProfileComplete,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        completeProfile,
        verifyAndComplete,
        resetVerification,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
