import React from 'react';
import { LayoutDashboard, Users, UserCog, Shield, CalendarDays, BarChart3 } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isMobile: boolean;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab, isMobile }) => {
  const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, shortLabel: 'Overview' },
    { id: 'members', label: 'Members', icon: Users, shortLabel: 'Members' },
    { id: 'ushers', label: 'Ushers', icon: UserCog, shortLabel: 'Ushers' },
    { id: 'admins', label: 'Admins', icon: Shield, shortLabel: 'Admins' },
    { id: 'events', label: 'Events', icon: CalendarDays, shortLabel: 'Events' },
    { id: 'reports', label: 'Analytics', icon: BarChart3, shortLabel: 'Analytics' },
  ];

  return (
    <div className="nav-scroll-container pb-2">
      <div className="flex space-x-1" style={{ minWidth: 'max-content' }}>
        {navigation.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex-shrink-0 min-h-[44px] ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-gray-700 hover:text-blue-600 hover:shadow-md border border-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span>{isMobile ? tab.shortLabel : tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationTabs;