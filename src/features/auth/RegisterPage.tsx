import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../lib/router';
import { UserRole } from '../../types/auth.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GraduationCap, AlertCircle, ArrowLeft } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please provide a valid institutional college email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the academic honor code and terms of use.');
      return;
    }

    try {
      setIsLoading(true);
      await register(name, email, role);
      // Fresh registration goes to profile setup as requested in spec
      navigate(role === 'student' ? '/student/profile/setup' : '/faculty/profile/setup');
    } catch {
      setError('Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#B91C1C] flex items-center justify-center text-white mb-2 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Create CampusAssess Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register with institutional email for exams and grading
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              role === 'student'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I am a Student
          </button>
          <button
            type="button"
            onClick={() => setRole('faculty')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              role === 'faculty'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I am Faculty
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
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priyanshu Kumar"
            required
          />

          <Input
            label="College Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === 'student' ? 'student.roll@college.edu' : 'faculty@college.edu'}
            required
          />

          <Input
            label="Create Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-600 h-4 w-4"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 leading-snug cursor-pointer">
              I agree to the college assessment integrity policy, anti-cheat regulations, and academic honor code.
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-10 mt-2 font-semibold"
            isLoading={isLoading}
          >
            Register & Continue to Profile Setup
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-red-700 hover:text-red-800 font-semibold"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}
