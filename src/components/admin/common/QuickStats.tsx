import React from 'react';
import { Users, Calendar, UserCog, UserCheck } from 'lucide-react';
import type { AdminStats } from '../../../services/adminService';

interface QuickStatsProps {
  adminStats: AdminStats | null;
  todayEvents: any[];
  activeUshers: any[];
  todayStats: any[];
  isMobile: boolean;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  adminStats,
  todayEvents,
  activeUshers,
  todayStats,
  isMobile
}) => {
  const quickStats = [
    { 
      label: 'Total Members', 
      value: adminStats?.totalMembers?.toString() || '0', 
      icon: Users, 
      color: 'blue',
      change: '+12%',
      description: 'Total registered members',
      showChange: true
    },
    { 
      label: "Today's Events", 
      value: todayEvents.length.toString(), 
      icon: Calendar, 
      color: 'green',
      change: todayEvents.length > 0 ? 'Active' : 'None',
      description: 'Events scheduled today',
      showChange: false
    },
    { 
      label: 'Active Ushers', 
      value: activeUshers.length.toString(),
      icon: UserCog, 
      color: 'orange',
      change: '+1',
      description: 'System users',
      showChange: false
    },
    { 
      label: "Today's Attendance", 
      value: todayStats.length > 0 && todayStats[0].totalMembers
        ? `${todayStats[0].presentCount || 0}/${todayStats[0].totalMembers}`
        : '0/0', 
      icon: UserCheck, 
      color: 'purple',
      change: todayStats.length > 0 && todayStats[0].totalMembers
        ? `${Math.round(((todayStats[0].presentCount || 0) / todayStats[0].totalMembers) * 100)}%`
        : '0%',
      description: 'Kenya time attendance',
      showChange: true
    },
  ];

  return (
    <div className="horizontal-scroll mb-6">
      {quickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="horizontal-scroll-item bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 truncate">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{stat.description}</p>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-100 flex-shrink-0 ml-2`}>
                <Icon className={`h-4 w-4 text-${stat.color}-600`} />
              </div>
            </div>
            {stat.showChange && (
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}-100 text-${stat.color}-800 truncate`}>
                  {stat.change}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;