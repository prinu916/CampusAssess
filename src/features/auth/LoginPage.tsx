import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../lib/router';
import { UserRole } from '../../types/auth.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GraduationCap, Eye, EyeOff, ShieldCheck, AlertCircle, UserCheck, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('priyanshu.k@college.edu');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid college email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const user = await login(email, password, role);
      // Route based on verification status:
      // First-time / unverified -> Must fill details and verify
      // Already verified -> Straight to dashboard!
      if (!user.isProfileComplete || !user.isVerified) {
        navigate(role === 'student' ? '/student/profile/setup' : '/faculty/profile/setup');
      } else {
        navigate(role === 'student' ? '/student/dashboard' : '/faculty/dashboard');
      }
    } catch {
      setError('Invalid college credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'faculty') {
      setEmail('a.thorne@college.edu');
    } else {
      setEmail('priyanshu.k@college.edu');
    }
  };

  const handleSelectPreset = (presetEmail: string, presetRole: UserRole) => {
    setRole(presetRole);
    setEmail(presetEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-xs">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#B91C1C] flex items-center justify-center text-white mb-3 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Campus<span className="text-[#B91C1C]">Assess</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            College Assessment & Examination Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              role === 'student'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('faculty')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              role === 'faculty'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Faculty Sign In
          </button>
        </div>

        {/* Demo Fast-Testing Chips */}
        <div className="mb-5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
            <span>Quick Demo Accounts:</span>
            <span className="text-2xs text-[#B91C1C] dark:text-red-400 font-semibold">1-Click autofill</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {role === 'student' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('priyanshu.k@college.edu', 'student')}
                  className={`px-2 py-1.5 rounded text-left border text-2xs transition-colors flex flex-col ${
                    email === 'priyanshu.k@college.edu'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-semibold flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    Verified Student
                  </span>
                  <span className="text-[10px] opacity-75 truncate">Direct Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('new.student@college.edu', 'student')}
                  className={`px-2 py-1.5 rounded text-left border text-2xs transition-colors flex flex-col ${
                    email === 'new.student@college.edu'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                    First-Time Student
                  </span>
                  <span className="text-[10px] opacity-75 truncate">Test Verification</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('a.thorne@college.edu', 'faculty')}
                  className={`px-2 py-1.5 rounded text-left border text-2xs transition-colors flex flex-col ${
                    email === 'a.thorne@college.edu'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-semibold flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    Verified Faculty
                  </span>
                  <span className="text-[10px] opacity-75 truncate">Direct Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('new.faculty@college.edu', 'faculty')}
                  className={`px-2 py-1.5 rounded text-left border text-2xs transition-colors flex flex-col ${
                    email === 'new.faculty@college.edu'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                    First-Time Faculty
                  </span>
                  <span className="text-[10px] opacity-75 truncate">Test Verification</span>
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="College Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === 'student' ? 'student.roll@college.edu' : 'faculty@college.edu'}
            required
            autoComplete="email"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Password <span className="text-red-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-red-700 dark:text-red-400 hover:text-red-800 font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 pr-9 text-sm text-slate-900 dark:text-slate-100 shadow-xs transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:border-transparent"
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-10 mt-2 font-semibold"
            isLoading={isLoading}
          >
            Sign In as {role === 'student' ? 'Student' : 'Faculty'}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Don't have an account?</span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-red-700 dark:text-red-400 hover:text-red-800 font-semibold"
          >
            Register Student / Faculty
          </button>
        </div>

        {/* Institutional notice explaining first-time verification rules */}
        <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md flex items-start gap-2 text-2xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>First-Time Security Policy:</strong> New accounts must complete full academic details and OTP verification before dashboard access. Once verified, subsequent sign-ins bypass setup directly to your dashboard.
          </span>
        </div>
      </div>
    </div>
  );
}
