import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useRouter } from '../../lib/router';
import { reminderService } from '../../services/reminder.service';
import { ExamReminder } from '../../types/reminder.types';
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  ArrowRightLeft,
  Menu,
  Bell,
  Mail,
  Clock,
  CheckCheck,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';

export function Header({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const { user, role, switchRole, logout, isVerified } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [reminders, setReminders] = useState<ExamReminder[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const list = reminderService.getStudentReminders(user?.id || 'usr_student_01');
    setReminders(list);
    setUnreadCount(list.filter((r) => !r.isRead).length);
  }, [user, notifOpen]);

  const handleRoleToggle = () => {
    const nextRole = role === 'student' ? 'faculty' : 'student';
    switchRole(nextRole);
    navigate(nextRole === 'student' ? '/student/dashboard' : '/faculty/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMarkAllRead = () => {
    reminderService.markAllAsRead(user?.id || 'usr_student_01');
    setUnreadCount(0);
    setReminders((prev) => prev.map((r) => ({ ...r, isRead: true })));
  };

  const handleReminderClick = (r: ExamReminder) => {
    reminderService.markAsRead(r.id);
    setNotifOpen(false);
    navigate(`/student/tests/${r.testId}`);
  };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Zone 1: Brand title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => navigate(role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded bg-[#B91C1C] flex items-center justify-center text-white font-bold text-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            Campus<span className="text-[#B91C1C]">Assess</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Institution & Role Indicator */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium text-slate-700 dark:text-slate-300">Indian Institute of Technology & Engineering</span>
        <span aria-hidden="true">·</span>
        <span className="capitalize font-mono tabular-nums">{role} Portal</span>
      </div>

      {/* Zone 3: Actions, Notifications, Dark Mode & Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle color theme"
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Automated Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md relative transition-colors"
            title="Exam reminders and deadline alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-3xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 text-xs overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                    <Mail className="w-3.5 h-3.5 text-red-600" />
                    <span>Automated Exam Reminders</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-2xs text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {reminders.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-2xs">
                      No automated deadline reminders at this time.
                    </div>
                  ) : (
                    reminders.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleReminderClick(r)}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer space-y-1 ${
                          !r.isRead ? 'bg-red-50/40 dark:bg-red-950/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-3xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase font-mono">
                            {r.channel} ALERT
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(r.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                          {r.subject}
                        </p>
                        <p className="text-2xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {r.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center text-3xs text-slate-500 dark:text-slate-400">
                  Automated notifications delivered to official institutional email.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Switch Persona Fast Action */}
        <button
          onClick={handleRoleToggle}
          title={`Switch to ${role === 'student' ? 'Faculty' : 'Student'} view`}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Role:</span>
          <span className="font-semibold text-red-700 dark:text-red-400 capitalize">{role}</span>
        </button>

        {/* Profile Avatar / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full sm:rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-semibold text-xs border border-slate-300 dark:border-slate-600">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight max-w-[120px] truncate">
                  {user?.name}
                </p>
                {isVerified && (
                  <span title="Institutional Identity Verified" className="text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <p className="text-2xs text-slate-500 dark:text-slate-400 capitalize leading-tight">{user?.role}</p>
                {isVerified && (
                  <span className="text-3xs px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold font-mono">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                    {isVerified ? (
                      <span className="text-3xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                        Verified
                      </span>
                    ) : (
                      <span className="text-3xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 truncate text-2xs mt-0.5">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(role === 'faculty' ? '/faculty/profile' : '/student/profile');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Academic Profile & ID</span>
                </button>

                {/* Dark Mode toggle inside menu */}
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                  <span className="text-3xs uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {theme}
                  </span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
