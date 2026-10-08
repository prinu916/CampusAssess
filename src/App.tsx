import { useRouter, RouterProvider, matchRoute } from './lib/router';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { ThemeProvider } from './hooks/useTheme';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { UnauthorizedPage, NotFoundPage } from './features/auth/UnauthorizedPage';

// Layouts
import { StudentLayout } from './components/layout/StudentLayout';
import { FacultyLayout } from './components/layout/FacultyLayout';

// Student Pages
import { StudentProfilePage } from './features/student/profile/StudentProfilePage';
import { StudentDashboardPage } from './features/student/dashboard/StudentDashboardPage';
import { StudentTestListPage } from './features/student/tests/StudentTestListPage';
import { StudentTestDetailPage } from './features/student/tests/StudentTestDetailPage';
import { StudentLeaderboardPage } from './features/student/leaderboard/StudentLeaderboardPage';
import { McqExamPage } from './features/student/exam/McqExamPage';
import { CodingExamPage } from './features/student/exam/CodingExamPage';
import { StudentResultListPage } from './features/student/results/StudentResultListPage';
import { StudentResultDetailPage } from './features/student/results/StudentResultDetailPage';

// Faculty Pages
import { FacultyProfilePage } from './features/faculty/profile/FacultyProfilePage';
import { FacultyDashboardPage } from './features/faculty/dashboard/FacultyDashboardPage';
import { FacultyTestListPage } from './features/faculty/tests/FacultyTestListPage';
import { CreateTestWizard } from './features/faculty/wizard/CreateTestWizard';
import { FacultyResultsPage } from './features/faculty/results/FacultyResultsPage';
import { FacultyExportPage } from './features/faculty/export/FacultyExportPage';

function AppContent() {
  const { path } = useRouter();
  const { isAuthenticated, role, user, isVerified } = useAuth();

  // Root redirect
  if (path === '/' || path === '') {
    if (!isAuthenticated) return <LoginPage />;
    if (!isVerified) {
      return role === 'faculty' ? (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 flex items-center justify-center">
          <FacultyProfilePage isSetup={true} />
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 flex items-center justify-center">
          <StudentProfilePage isSetup={true} />
        </div>
      );
    }
    return role === 'faculty' ? (
      <FacultyLayout>
        <FacultyDashboardPage />
      </FacultyLayout>
    ) : (
      <StudentLayout>
        <StudentDashboardPage />
      </StudentLayout>
    );
  }

  // 1. Auth routes
  if (path === '/login') return <LoginPage />;
  if (path === '/register') return <RegisterPage />;
  if (path === '/forgot-password') return <ForgotPasswordPage />;
  if (path === '/unauthorized') return <UnauthorizedPage />;

  // 2. Role protection checks
  const isStudentRoute = path.startsWith('/student');
  const isFacultyRoute = path.startsWith('/faculty');

  if (!isAuthenticated && (isStudentRoute || isFacultyRoute)) {
    return <LoginPage />;
  }

  if (isStudentRoute && role !== 'student') {
    return <UnauthorizedPage />;
  }

  if (isFacultyRoute && role !== 'faculty') {
    return <UnauthorizedPage />;
  }

  // 2b. Verification Guard: Enforce details completion & verification before dashboard access
  if (isAuthenticated && !isVerified) {
    if (role === 'student' && path !== '/student/profile/setup') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 flex items-center justify-center">
          <StudentProfilePage isSetup={true} />
        </div>
      );
    }
    if (role === 'faculty' && path !== '/faculty/profile/setup') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 flex items-center justify-center">
          <FacultyProfilePage isSetup={true} />
        </div>
      );
    }
  }

  // 3. Exam routes (Distraction-free: NO layout sidebar/navigation)
  let match = matchRoute('/student/tests/:id/exam', path);
  if (match.matches) {
    return <McqExamPage testId={match.params.id} />;
  }

  match = matchRoute('/student/tests/:id/coding', path);
  if (match.matches) {
    return <CodingExamPage testId={match.params.id} />;
  }

  match = matchRoute('/faculty/tests/:id/preview', path);
  if (match.matches) {
    // Determine preview type based on test or default to MCQ
    return <McqExamPage testId={match.params.id} isPreview={true} />;
  }

  // 4. Student profile setup (when requested standalone or with layout)
  if (path === '/student/profile/setup') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 flex items-center justify-center">
        <StudentProfilePage isSetup={true} />
      </div>
    );
  }

  // 5. Standard Student Routes (wrapped in StudentLayout)
  if (path === '/student/dashboard') {
    return (
      <StudentLayout>
        <StudentDashboardPage />
      </StudentLayout>
    );
  }

  if (path === '/student/profile') {
    return (
      <StudentLayout>
        <StudentProfilePage isSetup={false} />
      </StudentLayout>
    );
  }

  if (path === '/student/tests') {
    return (
      <StudentLayout>
        <StudentTestListPage />
      </StudentLayout>
    );
  }

  match = matchRoute('/student/tests/:id', path);
  if (match.matches) {
    return (
      <StudentLayout>
        <StudentTestDetailPage testId={match.params.id} />
      </StudentLayout>
    );
  }

  match = matchRoute('/student/tests/:id/instructions', path);
  if (match.matches) {
    return (
      <StudentLayout>
        <StudentTestDetailPage testId={match.params.id} />
      </StudentLayout>
    );
  }

  if (path === '/student/results') {
    return (
      <StudentLayout>
        <StudentResultListPage />
      </StudentLayout>
    );
  }

  if (path === '/student/leaderboard') {
    return (
      <StudentLayout>
        <StudentLeaderboardPage />
      </StudentLayout>
    );
  }

  match = matchRoute('/student/results/:id', path);
  if (match.matches) {
    return (
      <StudentLayout>
        <StudentResultDetailPage resultId={match.params.id} />
      </StudentLayout>
    );
  }

  // 6. Faculty Profile Setup
  if (path === '/faculty/profile/setup') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 flex items-center justify-center">
        <FacultyProfilePage isSetup={true} />
      </div>
    );
  }

  // 7. Standard Faculty Routes (wrapped in FacultyLayout)
  if (path === '/faculty/dashboard') {
    return (
      <FacultyLayout>
        <FacultyDashboardPage />
      </FacultyLayout>
    );
  }

  if (path === '/faculty/profile') {
    return (
      <FacultyLayout>
        <FacultyProfilePage isSetup={false} />
      </FacultyLayout>
    );
  }

  if (path === '/faculty/tests') {
    return (
      <FacultyLayout>
        <FacultyTestListPage />
      </FacultyLayout>
    );
  }

  if (path === '/faculty/tests/create') {
    return (
      <FacultyLayout>
        <CreateTestWizard />
      </FacultyLayout>
    );
  }

  match = matchRoute('/faculty/tests/:id/edit', path);
  if (match.matches) {
    return (
      <FacultyLayout>
        <CreateTestWizard editTestId={match.params.id} />
      </FacultyLayout>
    );
  }

  match = matchRoute('/faculty/tests/:id/results', path);
  if (match.matches) {
    return (
      <FacultyLayout>
        <FacultyResultsPage testId={match.params.id} />
      </FacultyLayout>
    );
  }

  match = matchRoute('/faculty/tests/:id', path);
  if (match.matches) {
    return (
      <FacultyLayout>
        <FacultyResultsPage testId={match.params.id} />
      </FacultyLayout>
    );
  }

  if (path === '/faculty/results') {
    return (
      <FacultyLayout>
        <FacultyResultsPage />
      </FacultyLayout>
    );
  }

  if (path === '/faculty/export') {
    return (
      <FacultyLayout>
        <FacultyExportPage />
      </FacultyLayout>
    );
  }

  // Fallback 404
  return <NotFoundPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}
