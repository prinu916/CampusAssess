import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GraduationCap, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
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
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your college email address to receive password reset instructions
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Password Reset Email Sent</h2>
              <p className="text-xs text-slate-600 mt-1">
                If an account exists with <span className="font-semibold text-slate-800">{email}</span>, you will receive instructions to reset your password within 5 minutes.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="College Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rollnumber@college.edu"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full h-10 mt-2 font-semibold"
              isLoading={isLoading}
            >
              Send Password Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
