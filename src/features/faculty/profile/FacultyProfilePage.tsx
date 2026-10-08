import React, { useState, useEffect } from 'react';
import { facultyService } from '../../../services/faculty.service';
import { FacultyProfile } from '../../../types/faculty.types';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from '../../../lib/router';
import { useToast } from '../../../hooks/useToast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  UserCheck,
  Edit3,
  Check,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  KeyRound,
  Briefcase,
  Building,
  GraduationCap,
} from 'lucide-react';

const DEMO_FACULTY_OTP = '918234';

export function FacultyProfilePage({ isSetup = false }: { isSetup?: boolean }) {
  const { verifyAndComplete, completeProfile, isVerified } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<FacultyProfile>(() => facultyService.getProfile());
  const [setupStep, setSetupStep] = useState<'details' | 'verify' | 'completed'>('details');
  const [isEditing, setIsEditing] = useState(isSetup);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verification state
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [facultyPledge, setFacultyPledge] = useState(true);

  useEffect(() => {
    const cur = facultyService.getProfile();
    setProfile(cur);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!profile.fullName.trim()) errs.fullName = 'Full name is required';
    if (!profile.collegeEmail.trim() || !profile.collegeEmail.includes('@')) {
      errs.collegeEmail = 'Valid institutional email is required';
    }
    if (!profile.employeeId.trim()) errs.employeeId = 'Employee / Faculty ID is required';
    if (!profile.department.trim()) errs.department = 'Department is required';
    if (!profile.branch.trim()) errs.branch = 'Branch is required';
    if (!profile.designation.trim()) errs.designation = 'Academic designation is required';
    if (!profile.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required faculty information fields.',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      await facultyService.updateProfile(profile);
      toast({
        title: 'Details Saved',
        description: 'Faculty profile updated. Please verify institutional authorization.',
        type: 'success',
      });
      setSetupStep('verify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const clean = enteredOtp.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      setOtpError('Please enter the 6-digit faculty authorization code.');
      return;
    }

    if (clean !== DEMO_FACULTY_OTP && clean !== '123456') {
      setOtpError(`Invalid code. Demonstration Faculty OTP is: ${DEMO_FACULTY_OTP}`);
      return;
    }

    if (!facultyPledge) {
      setOtpError('Please confirm the institutional examination integrity acknowledgment.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      verifyAndComplete({
        name: profile.fullName,
        email: profile.collegeEmail,
        department: profile.department,
        phone: profile.phoneNumber,
      });

      setSetupStep('completed');
      setIsVerifying(false);

      toast({
        title: 'Faculty Authorized',
        description: 'Institutional credentials verified. Faculty Exam Portal access granted.',
        type: 'success',
      });

      setTimeout(() => {
        navigate('/faculty/dashboard');
      }, 1200);
    }, 900);
  };

  const handleStandardSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      const updated = await facultyService.updateProfile(profile);
      setProfile(updated);
      completeProfile();
      toast({
        title: 'Profile Updated',
        description: 'Faculty credentials updated.',
        type: 'success',
      });
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isSetup ? 'Faculty Onboarding & Verification' : 'Faculty Academic Profile'}
            </h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Authorized Faculty
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSetup
              ? 'Complete institutional credentials and authorization verification to access exam creation and assessment evaluation.'
              : 'Institutional appointment records, department designations, and examination roles.'}
          </p>
        </div>

        {!isSetup && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-xs"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Tracker in Setup mode */}
      {isSetup && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  setupStep === 'details'
                    ? 'bg-red-700 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {setupStep === 'details' ? '1' : <Check className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Step 1: Institutional Details
                </p>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Employee ID & Department
                </p>
              </div>
            </div>

            <div className="flex-1 mx-3 h-0.5 bg-slate-200 dark:bg-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  setupStep !== 'details' ? 'bg-emerald-600' : 'bg-transparent'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  setupStep === 'verify'
                    ? 'bg-red-700 text-white ring-4 ring-red-100 dark:ring-red-950'
                    : setupStep === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {setupStep === 'completed' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Step 2: Staff Authorization
                </p>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Dean / Registrar Verification
                </p>
              </div>
            </div>

            <div className="flex-1 mx-3 h-0.5 bg-slate-200 dark:bg-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  setupStep === 'completed' ? 'bg-emerald-600' : 'bg-transparent'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  setupStep === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Faculty Dashboard
                </p>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Author Exams & Grade
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: Faculty Details */}
      {(setupStep === 'details' || !isSetup) && (
        <form
          onSubmit={isSetup ? handleProceedToVerification : handleStandardSave}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-700 dark:text-red-400 font-bold text-xl">
              {profile.fullName.charAt(0) || <UserCheck className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {profile.fullName || 'Faculty Member'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono">{profile.employeeId || 'ID Not Set'}</span>
                <span>·</span>
                <span>{profile.designation || 'Designation'}</span>
                <span>·</span>
                <span>{profile.department || 'Department'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name & Title"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.fullName}
              required
              placeholder="e.g. Dr. Aris Thorne"
            />

            <Input
              label="Institutional Email"
              type="email"
              value={profile.collegeEmail}
              onChange={(e) => setProfile({ ...profile, collegeEmail: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.collegeEmail}
              required
              placeholder="e.g. a.thorne@college.edu"
            />

            <Input
              label="Employee / Faculty ID"
              value={profile.employeeId}
              onChange={(e) => setProfile({ ...profile, employeeId: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.employeeId}
              required
              placeholder="e.g. FAC-CSE-2018"
            />

            <Input
              label="Phone Number"
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.phoneNumber}
              required
              placeholder="+91 98765 43210"
            />

            <Select
              label="Designation"
              value={profile.designation}
              onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.designation}
              required
              options={[
                { value: 'Professor', label: 'Professor' },
                { value: 'Associate Professor', label: 'Associate Professor' },
                { value: 'Assistant Professor', label: 'Assistant Professor' },
                { value: 'Head of Department', label: 'Head of Department (HOD)' },
                { value: 'Visiting Faculty', label: 'Visiting / Adjunct Faculty' },
              ]}
            />

            <Select
              label="Department"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.department}
              required
              options={[
                { value: 'Department of Computer Science', label: 'Department of Computer Science & Engineering' },
                { value: 'Department of Information Technology', label: 'Department of Information Technology' },
                { value: 'Department of Electronics', label: 'Department of Electronics & Communication' },
                { value: 'Department of Electrical', label: 'Department of Electrical Engineering' },
              ]}
            />

            <Input
              label="Branch / Division"
              value={profile.branch}
              onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.branch}
              required
              placeholder="e.g. Computer Science and Engineering"
            />

            <Input
              label="Office / Faculty Cabin"
              value={profile.officeLocation || ''}
              onChange={(e) => setProfile({ ...profile, officeLocation: e.target.value })}
              disabled={!isEditing && !isSetup}
              placeholder="Block B, Cabin 304"
            />
          </div>

          {(isEditing || isSetup) && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              {!isSetup && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProfile(facultyService.getProfile());
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="font-semibold text-xs gap-1.5"
              >
                {isSetup ? (
                  <>
                    <span>Proceed to Staff Authorization</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    <span>Save Faculty Profile</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      )}

      {/* STEP 2: Verification for Faculty */}
      {isSetup && setupStep === 'verify' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Institutional Faculty Authorization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your academic registrar authorization passcode sent to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.collegeEmail}
                </span>.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Demonstration Faculty OTP:</span>
              <span className="font-mono font-bold tracking-widest text-sm bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded text-amber-950 dark:text-amber-100">
                {DEMO_FACULTY_OTP}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEnteredOtp(DEMO_FACULTY_OTP)}
              className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline self-start sm:self-auto"
            >
              Click to Auto-fill Code
            </button>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                6-Digit Staff Authorization Code <span className="text-red-600">*</span>
              </label>
              <div className="max-w-xs">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="918234"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-2.5 px-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              {otpError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{otpError}</p>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={facultyPledge}
                onChange={(e) => setFacultyPledge(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-600"
              />
              <span>
                I confirm that I am an appointed faculty member authorized to design, administer, and grade examinations under college guidelines.
              </span>
            </label>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSetupStep('details')}
              >
                Back to Details
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isVerifying}
                className="font-bold text-xs gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Enter Dashboard</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Completed */}
      {isSetup && setupStep === 'completed' && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 rounded-lg p-8 shadow-xs text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Faculty Authorization Approved!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Welcome, <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.fullName}</span>. You now have full faculty exam authoring, publishing, and grading privileges.
            </p>
          </div>
          <div className="pt-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/faculty/dashboard')}
              className="gap-2 font-bold text-xs"
            >
              <span>Go to Faculty Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
