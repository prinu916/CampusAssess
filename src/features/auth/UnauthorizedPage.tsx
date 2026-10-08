import { useRouter } from '../../lib/router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function UnauthorizedPage() {
  const { navigate } = useRouter();
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center shadow-xs">
        <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Access Restricted</h1>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          You do not have administrative or authorization clearance to view this assessment page.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="primary"
            onClick={() => navigate(role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to {role === 'faculty' ? 'Faculty' : 'Student'} Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/login')}
          >
            Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const { navigate } = useRouter();
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center shadow-xs">
        <p className="text-2xl font-bold font-mono text-red-700">404</p>
        <h1 className="text-lg font-bold text-slate-900 mt-1">Page Not Found</h1>
        <p className="text-xs text-slate-600 mt-2">
          The requested campus examination page does not exist or has been relocated.
        </p>
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() => navigate(role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
