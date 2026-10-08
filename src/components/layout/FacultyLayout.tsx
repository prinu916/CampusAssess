import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../hooks/useAuth';
import { Header } from './Header';
import {
  LayoutDashboard,
  FolderKanban,
  GraduationCap,
  Download,
  User,
  LogOut,
  X,
  PlusCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { path, navigate } = useRouter();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Tests', path: '/faculty/tests', icon: FolderKanban },
    { label: 'Results', path: '/faculty/results', icon: GraduationCap },
    { label: 'Export', path: '/faculty/export', icon: Download },
    { label: 'Profile', path: '/faculty/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Header onToggleSidebar={() => setMobileOpen(true)} />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100vh-3.5rem)] transition-colors">
          <div className="p-3">
            <div className="mb-3">
              <Button
                variant="primary"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => navigate('/faculty/tests/create')}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Test</span>
              </Button>
            </div>

            <p className="px-3 py-1.5 text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Faculty Administration
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = path === item.path || path.startsWith(`${item.path}/`);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left',
                      isActive
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-semibold border-l-2 border-red-700 dark:border-red-500 rounded-l-none'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-red-700 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-64 max-w-[80%] bg-white dark:bg-slate-900 h-full flex flex-col p-4 shadow-xl z-10 border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Faculty Workspace</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-3">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full gap-2 text-xs"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/faculty/tests/create');
                  }}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Test</span>
                </Button>
              </div>

              <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = path === item.path || path.startsWith(`${item.path}/`);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        setMobileOpen(false);
                        navigate(item.path);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-left',
                        isActive
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? 'text-red-700 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
