import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Users,
  Building2,
  DollarSign,
  UserCircle,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  TrendingUp,
  LayoutDashboard,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FXUnlockedLogo from '@/components/FXUnlockedLogo';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Affiliates', href: '/affiliates', icon: Users },
    { name: 'Brokers', href: '/brokers', icon: Building2 },
    { name: 'Revenue', href: '/revenue', icon: DollarSign },
    ...(user?.role === 'STAFF' ? [{ name: 'My Performance', href: '/staff-dashboard', icon: UserCircle }] : []),
    ...(user?.role === 'ADMIN' ? [
      { name: 'Company KPIs', href: '/company-kpis', icon: TrendingUp },
      { name: 'Staff', href: '/staff', icon: UserCircle },
      { name: 'Users', href: '/users', icon: UserCircle }
    ] : []),
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className={cn('min-h-screen', theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50')}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          theme === 'dark' ? 'bg-gray-900' : 'bg-white',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn('flex h-16 items-center justify-between px-6 border-b', theme === 'dark' ? 'border-gray-800' : 'border-gray-200')}>
            <FXUnlockedLogo size="sm" />
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className={cn('h-6 w-6', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className={cn('border-t p-4', theme === 'dark' ? 'border-gray-800' : 'border-gray-200')}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className={cn('text-sm font-medium', theme === 'dark' ? 'text-gray-100' : 'text-gray-900')}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className={cn('text-xs', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>{user?.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className={cn('sticky top-0 z-10 flex h-16 shadow-sm', theme === 'dark' ? 'bg-gray-900' : 'bg-white')}>
          <button
            className={cn('px-4 focus:outline-none lg:hidden', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-between px-4">
            <h1 className={cn('text-2xl font-semibold', theme === 'dark' ? 'text-gray-100' : 'text-gray-900')}>
              {navigation.find((item) => item.href === location.pathname)?.name || 'FX Unlocked CRM'}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className={cn('p-6', theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50')}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
