import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/student.service';
import { StudentProfile } from '../../../types/student.types';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from '../../../lib/router';
import { useToast } from '../../../hooks/useToast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  User,
  Edit3,
  Check,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  KeyRound,
  RefreshCw,
  Building,
  GraduationCap,
  FileCheck,
  Clock,
} from 'lucide-react';

const DEMO_OTP = '849201';

export function StudentProfilePage({ isSetup = false }: { isSetup?: boolean }) {
  const { verifyAndComplete, completeProfile, isVerified } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<StudentProfile>(() => studentService.getProfile());
  const [setupStep, setSetupStep] = useState<'details' | 'verify' | 'completed'>('details');
  const [isEditing, setIsEditing] = useState(isSetup);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verification state
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccessfully, setVerifiedSuccessfully] = useState(false);
  const [academicPledge, setAcademicPledge] = useState(true);

  useEffect(() => {
    const cur = studentService.getProfile();
    setProfile(cur);
  }, []);

  const validateDetails = () => {
    const errs: Record<string, string> = {};
    if (!profile.fullName.trim()) errs.fullName = 'Full name is required';
    if (!profile.collegeEmail.trim() || !profile.collegeEmail.includes('@')) {
      errs.collegeEmail = 'Valid college email is required';
    }
    if (!profile.rollNumber.trim()) errs.rollNumber = 'University roll number is required';
    if (!profile.branch.trim()) errs.branch = 'Branch of study is required';
    if (!profile.department.trim()) errs.department = 'Department is required';
    if (!profile.course.trim()) errs.course = 'Degree course is required';
    if (!profile.semester.trim()) errs.semester = 'Current semester is required';
    if (!profile.section.trim()) errs.section = 'Batch section is required';
    if (!profile.phoneNumber.trim() || profile.phoneNumber.length < 8) {
      errs.phoneNumber = 'Active mobile phone number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 1: Submit Details & proceed to Step 2 Verification
  const handleProceedToVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) {
      toast({
        title: 'Incomplete Details',
        description: 'Please complete all mandatory academic fields before verification.',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      await studentService.updateProfile(profile);
      toast({
        title: 'Details Saved',
        description: 'Academic details registered. Please verify your student identity.',
        type: 'success',
      });
      setSetupStep('verify');
    } catch {
      toast({
        title: 'Save Error',
        description: 'Could not store student details. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verification submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanOtp = enteredOtp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setOtpError('Please enter the 6-digit institutional verification code.');
      return;
    }

    if (cleanOtp !== DEMO_OTP && cleanOtp !== '123456') {
      setOtpError(`Invalid verification code. Use standard college OTP: ${DEMO_OTP}`);
      return;
    }

    if (!academicPledge) {
      setOtpError('Please acknowledge the institutional academic integrity pledge.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      // Mark user profile as verified & complete
      verifyAndComplete({
        name: profile.fullName,
        email: profile.collegeEmail,
        rollNumber: profile.rollNumber,
        department: profile.department,
        phone: profile.phoneNumber,
      });

      setVerifiedSuccessfully(true);
      setSetupStep('completed');
      setIsVerifying(false);

      toast({
        title: 'Verification Approved',
        description: 'Institutional credentials verified! Entry to CampusTest dashboard unlocked.',
        type: 'success',
      });

      // Smooth redirection to dashboard
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1200);
    }, 900);
  };

  // Standard profile edit save (when in profile view)
  const handleStandardSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;
    try {
      setIsLoading(true);
      const updated = await studentService.updateProfile(profile);
      setProfile(updated);
      completeProfile();
      toast({
        title: 'Profile Updated',
        description: 'Your academic profile records have been saved.',
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
              {isSetup ? 'Student Onboarding & Verification' : 'Student Academic Profile'}
            </h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Student
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSetup
              ? 'Complete your academic details and institutional verification to gain access to the student exam portal.'
              : 'Official university registration, roll verification, and departmental batch details.'}
          </p>
        </div>

        {!isSetup && !isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Edit Details
            </Button>
          </div>
        )}
      </div>

      {/* Onboarding Step Tracker (When in setup mode) */}
      {isSetup && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 Pill */}
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
                  Step 1: Academic Details
                </p>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Roll, Branch & Semester
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

            {/* Step 2 Pill */}
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
                  Step 2: Identity Verification
                </p>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Institutional OTP & Authorization
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

            {/* Step 3 Pill */}
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
                  Dashboard Entry
                </p>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Full Portal Access
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: DETAILS FORM */}
      {(setupStep === 'details' || !isSetup) && (
        <form
          onSubmit={isSetup ? handleProceedToVerification : handleStandardSave}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-6"
        >
          {/* Student Profile Identity Bar */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-700 dark:text-red-400 font-bold text-xl">
              {profile.fullName.charAt(0) || <User className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {profile.fullName || 'Student Applicant'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono tabular-nums">{profile.rollNumber || 'Roll Not Assigned'}</span>
                <span>·</span>
                <span>{profile.course || 'Degree'} ({profile.branch || 'Branch'})</span>
                <span>·</span>
                <span>{profile.semester || 'Semester'}</span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.fullName}
              required
              placeholder="e.g. Priyanshu Kumar"
            />

            <Input
              label="College Institutional Email"
              type="email"
              value={profile.collegeEmail}
              onChange={(e) => setProfile({ ...profile, collegeEmail: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.collegeEmail}
              required
              placeholder="e.g. priyanshu.k@college.edu"
              helperText="Verification OTP will be sent to this email"
            />

            <Input
              label="University Roll / Enrollment Number"
              value={profile.rollNumber}
              onChange={(e) => setProfile({ ...profile, rollNumber: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.rollNumber}
              required
              placeholder="e.g. 21BCSE104"
              helperText="Unique university roll number printed on your ID card"
            />

            <Input
              label="Contact Phone Number"
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.phoneNumber}
              required
              placeholder="+91 98765 43210"
              helperText="For exam alerts and two-factor identity verification"
            />

            <Select
              label="Academic Degree Course"
              value={profile.course}
              onChange={(e) => setProfile({ ...profile, course: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.course}
              required
              options={[
                { value: 'B.Tech', label: 'B.Tech (Bachelor of Technology)' },
                { value: 'M.Tech', label: 'M.Tech (Master of Technology)' },
                { value: 'BCA', label: 'BCA (Bachelor of Computer Applications)' },
                { value: 'MCA', label: 'MCA (Master of Computer Applications)' },
                { value: 'B.Sc Computer Science', label: 'B.Sc (Computer Science)' },
              ]}
            />

            <Select
              label="Academic Department"
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
              label="Branch / Engineering Stream"
              value={profile.branch}
              onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
              disabled={!isEditing && !isSetup}
              error={errors.branch}
              required
              placeholder="e.g. Computer Science and Engineering"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Semester"
                value={profile.semester}
                onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                disabled={!isEditing && !isSetup}
                error={errors.semester}
                required
                options={[
                  { value: '1st Semester', label: '1st Semester' },
                  { value: '2nd Semester', label: '2nd Semester' },
                  { value: '3rd Semester', label: '3rd Semester' },
                  { value: '4th Semester', label: '4th Semester' },
                  { value: '5th Semester', label: '5th Semester' },
                  { value: '6th Semester', label: '6th Semester' },
                  { value: '7th Semester', label: '7th Semester' },
                  { value: '8th Semester', label: '8th Semester' },
                ]}
              />

              <Select
                label="Assigned Section"
                value={profile.section}
                onChange={(e) => setProfile({ ...profile, section: e.target.value })}
                disabled={!isEditing && !isSetup}
                error={errors.section}
                required
                options={[
                  { value: 'A', label: 'Section A' },
                  { value: 'B', label: 'Section B' },
                  { value: 'C', label: 'Section C' },
                  { value: 'D', label: 'Section D' },
                ]}
              />
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-md flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              All registered student details are cross-referenced with college examination records. Inaccurate details may result in disqualification from assigned tests.
            </span>
          </div>

          {/* Action Footer */}
          {(isEditing || isSetup) && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              {!isSetup && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProfile(studentService.getProfile());
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
                    <span>Proceed to Verification Step</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      )}

      {/* STEP 2: VERIFICATION STEP (Required before Dashboard entry) */}
      {isSetup && setupStep === 'verify' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Institutional Student Identity Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter the 6-digit verification code sent to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.collegeEmail}
                </span>{' '}
                and mobile{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.phoneNumber}
                </span>.
              </p>
            </div>
          </div>

          {/* Demo OTP Helper Callout */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Simulated College Verification Code:</span>
              <span className="font-mono font-bold tracking-widest text-sm bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded text-amber-950 dark:text-amber-100">
                {DEMO_OTP}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEnteredOtp(DEMO_OTP)}
              className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline self-start sm:self-auto"
            >
              Click to Auto-fill Code
            </button>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* 6-Digit Code Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                6-Digit Institutional OTP Code <span className="text-red-600">*</span>
              </label>
              <div className="max-w-xs">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="849201"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-2.5 px-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              {otpError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{otpError}</p>
              )}
            </div>

            {/* University Automated Checks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-medium text-slate-800 dark:text-slate-200">Roll Number Matched</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-2xs">{profile.rollNumber}</p>
                </div>
              </div>

              <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center gap-3">
                <Building className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-medium text-slate-800 dark:text-slate-200">Department Registered</p>
                  <p className="text-slate-500 dark:text-slate-400 text-2xs truncate max-w-[180px]">{profile.department}</p>
                </div>
              </div>
            </div>

            {/* Academic Integrity Pledge Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={academicPledge}
                onChange={(e) => setAcademicPledge(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-600"
              />
              <span>
                I certify under university academic regulations that the information provided is accurate and represents my institutional identity.
              </span>
            </label>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSetupStep('details')}
              >
                Back to Edit Details
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isVerifying}
                className="font-bold text-xs gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Enter Dashboard</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: COMPLETED SUCCESS OVERLAY */}
      {isSetup && setupStep === 'completed' && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 rounded-lg p-8 shadow-xs text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Student Identity Successfully Verified!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Your profile is verified with roll number{' '}
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {profile.rollNumber}
              </span>
              . You now have full clearance to take examinations.
            </p>
          </div>
          <div className="pt-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/student/dashboard')}
              className="gap-2 font-bold text-xs"
            >
              <span>Continue to Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
