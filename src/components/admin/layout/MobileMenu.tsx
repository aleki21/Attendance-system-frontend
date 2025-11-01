import React from 'react';
import { LayoutDashboard, Users, UserCog, Shield, CalendarDays, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, activeTab, setActiveTab, onLogout }) => {
  const { user } = useAuth();

  const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, shortLabel: 'Overview' },
    { id: 'members', label: 'Members', icon: Users, shortLabel: 'Members' },
    { id: 'ushers', label: 'Ushers', icon: UserCog, shortLabel: 'Ushers' },
    { id: 'admins', label: 'Admins', icon: Shield, shortLabel: 'Admins' },
    { id: 'events', label: 'Events', icon: CalendarDays, shortLabel: 'Events' },
    { id: 'reports', label: 'Analytics', icon: BarChart3, shortLabel: 'Analytics' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose}>
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {navigation.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onClose();
                }}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;