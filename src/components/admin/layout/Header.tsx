import React from 'react';
import { Shield, LogOut, RefreshCw, Menu, X, LayoutDashboard, Users, UserCog, CalendarDays, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface HeaderProps {
  isMobile: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen,
  onRefresh,
  activeTab,
  setActiveTab,
  onLogout
}) => {
  const { user } = useAuth();

  const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, shortLabel: 'Overview' },
    { id: 'members', label: 'Members', icon: Users, shortLabel: 'Members' },
    { id: 'ushers', label: 'Ushers', icon: UserCog, shortLabel: 'Ushers' },
    { id: 'admins', label: 'Admins', icon: Shield, shortLabel: 'Admins' },
    { id: 'events', label: 'Events', icon: CalendarDays, shortLabel: 'Events' },
    { id: 'reports', label: 'Analytics', icon: BarChart3, shortLabel: 'Analytics' },
  ];

  if (isMobile) {
    return (
      <>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin</h1>
            <p className="text-xs text-gray-500 hidden sm:block">System panel</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Church Analytics</h1>
          <p className="text-gray-500 text-sm">Complete system administration panel</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Refresh data"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">System Administrator</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </>
  );
};

export default Header;