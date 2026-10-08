import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../hooks/useAuth';
import { Header } from './Header';
import {
  LayoutDashboard,
  FileCheck2,
  Award,
  Trophy,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const { path, navigate } = useRouter();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Tests', path: '/student/tests', icon: FileCheck2 },
    { label: 'Results', path: '/student/results', icon: Award },
    { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { label: 'Profile', path: '/student/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Header onToggleSidebar={() => setMobileOpen(true)} />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (240px wide) */}
        <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100vh-3.5rem)] transition-colors">
          <div className="p-3">
            <p className="px-3 py-2 text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Student Navigation
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
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">CampusAssess</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 mt-4 flex-1">
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
