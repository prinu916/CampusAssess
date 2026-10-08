import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../lib/router';
import { UserRole } from '../../types/auth.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GraduationCap, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

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
    if (newRole === 'faculty' && email.includes('priyanshu')) {
      setEmail('a.thorne@college.edu');
    } else if (newRole === 'student' && email.includes('thorne')) {
      setEmail('priyanshu.k@college.edu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#B91C1C] flex items-center justify-center text-white mb-3 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Campus<span className="text-[#B91C1C]">Test</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            College Assessment & Examination Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              role === 'student'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('faculty')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              role === 'faculty'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty Sign In
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-xs text-red-700">
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
              <label className="block text-xs font-semibold text-slate-800">
                Password <span className="text-red-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-red-700 hover:text-red-800 font-medium"
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
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 pr-9 text-sm shadow-xs transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:border-transparent"
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Don't have an account?</span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-red-700 hover:text-red-800 font-semibold"
          >
            Register Student / Faculty
          </button>
        </div>

        {/* Institutional notice */}
        <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2 text-2xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Institutional authentication enabled. Activity monitored for test integrity.</span>
        </div>
      </div>
    </div>
  );
}
