import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, BarChart3, Shield, LogOut, 
  UserPlus, TrendingUp, Clock,
  Plus, Trash2, Edit, Eye, Download, Search,
  UserCheck, Activity,
  UserMinus, RefreshCw, LayoutDashboard, UserCog, CalendarDays,
  Menu, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { memberService, type Member, type MemberStats } from '../../services/memberService';
import { userService, type User as SystemUser } from '../../services/userService';
import { eventService, type Event } from '../../services/eventService';
import { attendanceService, type TodayStats } from '../../services/attendanceService';
import { adminService, type AdminStats } from '../../services/adminService';
import { analyticsService, type AnalyticsData } from '../../services/analyticsService';
import { AddUsherModal, AddMemberModal, EditMemberModal, AddEventModal, EditEventModal, ViewAttendanceModal, AddAdminModal, ViewUserModal } from '../modals';
import EventCalendar from '../Calendar';

// Layout Components
import Header from './layout/Header';
import NavigationTabs from './layout/NavigationTabs';
import MobileMenu from './layout/MobileMenu';

// Common Components
import QuickStats from './common/QuickStats';
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';

// Tab Components
import OverviewTab from './tabs/OverviewTab';
import MembersTab from './tabs/MembersTab';
import UshersTab from './tabs/UsherTab';
import EventsTab from './tabs/EventsTab';
import ReportsTab from './tabs/ReportsTab';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'ushers' | 'admins' | 'events' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals
  const [isAddUsherModalOpen, setIsAddUsherModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isViewAttendanceModalOpen, setIsViewAttendanceModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // State for data
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [activeUshers, setActiveUshers] = useState<SystemUser[]>([]);
  const [deactivatedUshers, setDeactivatedUshers] = useState<SystemUser[]>([]);
  const [activeAdmins, setActiveAdmins] = useState<SystemUser[]>([]);
  const [deactivatedAdmins, setDeactivatedAdmins] = useState<SystemUser[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats[]>([]);
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [ushersTab, setUshersTab] = useState<'active' | 'deactivated'>('active');
  const [adminsTab, setAdminsTab] = useState<'active' | 'deactivated'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [exportLoading, setExportLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [retryCount]);

  // Load analytics data when tab changes or timeRange changes
  useEffect(() => {
    if (activeTab === 'reports') {
      loadAnalyticsData();
    }
  }, [activeTab, timeRange]);

  // Load calendar events when events tab is active
  useEffect(() => {
    if (activeTab === 'events') {
      loadCalendarEvents();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        adminStatsData,
        memberStatsData,
        membersData,
        usersData,
        eventsData,
        todayAttendanceData,
        adminUsersData,
        todayEventsData
      ] = await Promise.all([
        adminService.getStats(),
        memberService.getStats(),
        memberService.getMembers({ page: 1, limit: 5 }),
        userService.getUsers({ role: 'usher', page: 1, limit: 50 }),
        eventService.getUpcomingEvents(),
        attendanceService.getTodayAttendance(),
        userService.getUsers({ role: 'admin', page: 1, limit: 50 }),
        eventService.getTodayEvents()
      ]);

      setAdminStats(adminStatsData);
      setMemberStats(memberStatsData);
      setRecentMembers(membersData.members);
      
      const allUsers = usersData.users;
      setActiveUshers(allUsers.filter((user: SystemUser) => user.active && user.role === 'usher'));
      setDeactivatedUshers(allUsers.filter((user: SystemUser) => !user.active && user.role === 'usher'));
      
      const allAdmins = adminUsersData.users;
      setActiveAdmins(allAdmins.filter((user: SystemUser) => user.active && user.role === 'admin'));
      setDeactivatedAdmins(allAdmins.filter((user: SystemUser) => !user.active && user.role === 'admin'));
      
      setUpcomingEvents(eventsData.events);
      setTodayStats(todayAttendanceData.todayStats);
      setTodayEvents(todayEventsData.events);

      const allMembersData = await memberService.getMembers({ page: 1, limit: 50 });
      setAllMembers(allMembersData.members);

    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      
      if (retryCount < 3) {
        setTimeout(() => setRetryCount(prev => prev + 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await analyticsService.getAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      setCalendarLoading(true);
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      
      const eventsData = await eventService.getEvents({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        limit: 200
      });
      
      setAllEvents(eventsData.events);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Event Handlers
  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsEditMemberModalOpen(true);
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
        await memberService.deleteMember(memberId);
        await loadDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditEventModalOpen(true);
  };

  const handleViewAttendance = (event: Event) => {
    setSelectedEvent(event);
    setIsViewAttendanceModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        await eventService.deleteEvent(eventId);
        await loadDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleGenerateSundays = async () => {
    try {
      await eventService.generateSundayServices(12);
      await loadDashboardData();
      await loadCalendarEvents();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to generate Sunday services');
    }
  };

  const handleUsherCreated = () => {
    loadDashboardData();
  };

  const handleAdminCreated = () => {
    loadDashboardData();
  };

  const handleViewUser = (user: SystemUser) => {
    setSelectedUser(user);
    setIsViewUserModalOpen(true);
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      if (window.confirm('Are you sure you want to deactivate this user? They will no longer be able to access the system.')) {
        await userService.deactivateUser(userId);
        await loadDashboardData();
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleReactivateUser = async (userId: number) => {
    try {
      if (window.confirm('Are you sure you want to reactivate this user? They will be able to access the system again.')) {
        await userService.reactivateUser(userId);
        await loadDashboardData();
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to reactivate user');
    }
  };

  const handleExportReport = async (format: 'pdf' | 'csv') => {
    try {
      setExportLoading(true);
      const blob = await analyticsService.exportReport(format, timeRange);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `church-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.residence.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState retryCount={retryCount} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 safe-top safe-bottom">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
            <Header
                isMobile={isMobile}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                onRefresh={loadDashboardData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={logout} // ✅ Fixed: Pass logout function
            />
            </div>

            <NavigationTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobile={isMobile}
            />
        </div>
        </header>

        <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout} // ✅ Fixed: Pass logout function
        />

      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
        <QuickStats
          adminStats={adminStats}
          todayEvents={todayEvents}
          activeUshers={activeUshers}
          todayStats={todayStats}
          isMobile={isMobile}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab
            isMobile={isMobile}
            recentMembers={recentMembers}
            upcomingEvents={upcomingEvents}
            todayEvents={todayEvents}
            todayStats={todayStats}
            activeUshers={activeUshers}
          />
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <MembersTab
            isMobile={isMobile}
            allMembers={allMembers}
            onAddMember={() => setIsAddMemberModalOpen(true)}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {/* Ushers Tab */}
        {activeTab === 'ushers' && (
          <UshersTab
            isMobile={isMobile}
            activeUshers={activeUshers}
            deactivatedUshers={deactivatedUshers}
            onAddUsher={() => setIsAddUsherModalOpen(true)}
            onViewUser={handleViewUser}
            onDeactivateUser={handleDeactivateUser}
            onReactivateUser={handleReactivateUser}
          />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <EventsTab
            isMobile={isMobile}
            upcomingEvents={upcomingEvents}
            onAddEvent={() => setIsAddEventModalOpen(true)}
            onEditEvent={handleEditEvent}
            onViewAttendance={handleViewAttendance}
            onDeleteEvent={handleDeleteEvent}
            onGenerateSundays={handleGenerateSundays}
          />
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <ReportsTab
            isMobile={isMobile}
            analyticsData={analyticsData}
            analyticsLoading={analyticsLoading}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            exportLoading={exportLoading}
            onExportReport={handleExportReport}
          />
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">Admin Management</h3>
                    <p className="text-gray-500 text-sm mt-1">Manage system administrators</p>
                </div>
                <button 
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg shadow-blue-500/25 whitespace-nowrap min-h-[44px] w-full sm:w-auto"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Admin
                </button>
                </div>
                
                {/* Admins Tabs */}
                <div className="mt-4 flex space-x-1">
                <button
                    onClick={() => setAdminsTab('active')}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center min-h-[44px] ${
                    adminsTab === 'active'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white text-gray-700 hover:text-blue-600 hover:shadow-md border border-gray-200'
                    }`}
                >
                    <Shield className="h-4 w-4 mr-2" />
                    Active ({activeAdmins.length})
                </button>
                <button
                    onClick={() => setAdminsTab('deactivated')}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center min-h-[44px] ${
                    adminsTab === 'deactivated'
                        ? 'bg-gray-600 text-white'
                        : 'bg-white text-gray-700 hover:text-gray-800 hover:shadow-md border border-gray-200'
                    }`}
                >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Inactive ({deactivatedAdmins.length})
                </button>
                </div>
            </div>
            
            <div className="p-4">
                {adminsTab === 'active' && (
                activeAdmins.length === 0 ? (
                    <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-1">No Active Admins</h3>
                    <p className="text-gray-500 text-sm mb-4">Get started by adding your first admin.</p>
                    <button 
                        onClick={() => setIsAddAdminModalOpen(true)}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center mx-auto font-medium shadow-lg shadow-blue-500/25 min-h-[44px]"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Your First Admin
                    </button>
                    </div>
                ) : (
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {activeAdmins.map((admin) => (
                        <div key={admin.userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">{admin.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                            </div>
                            </div>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex-shrink-0">Active</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="truncate text-xs">Joined: {new Date(admin.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button 
                            onClick={() => handleViewUser(admin)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
                            >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                            </button>
                            <button 
                            onClick={() => handleDeactivateUser(admin.userId)}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium min-h-[44px]"
                            >
                            Deactivate
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>
                )
                )}

                {adminsTab === 'deactivated' && (
                deactivatedAdmins.length === 0 ? (
                    <div className="text-center py-8">
                    <UserMinus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-1">No Inactive Admins</h3>
                    <p className="text-gray-500 text-sm">All admins are currently active.</p>
                    </div>
                ) : (
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {deactivatedAdmins.map((admin) => (
                        <div key={admin.userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-gray-600 truncate">{admin.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                            </div>
                            </div>
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex-shrink-0">Inactive</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="truncate text-xs">Joined: {new Date(admin.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button 
                            onClick={() => handleViewUser(admin)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
                            >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                            </button>
                            <button 
                            onClick={() => handleReactivateUser(admin.userId)}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors font-medium min-h-[44px]"
                            >
                            Reactivate
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>
                )
                )}
            </div>
            </div>
        </div>
        )}
      </main>

      {/* Modals */}
      <AddUsherModal
        isOpen={isAddUsherModalOpen}
        onClose={() => setIsAddUsherModalOpen(false)}
        onSuccess={handleUsherCreated}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={loadDashboardData}
      />

      <EditMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => {
          setIsEditMemberModalOpen(false);
          setSelectedMember(null);
        }}
        onSuccess={loadDashboardData}
        member={selectedMember}
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onSuccess={loadDashboardData}
      />

      <EditEventModal
        isOpen={isEditEventModalOpen}
        onClose={() => {
          setIsEditEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onSuccess={loadDashboardData}
        event={selectedEvent}
      />

      <ViewAttendanceModal
        isOpen={isViewAttendanceModalOpen}
        onClose={() => {
          setIsViewAttendanceModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />

      <AddAdminModal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        onSuccess={handleAdminCreated}
      />

      <ViewUserModal
        isOpen={isViewUserModalOpen}
        onClose={() => {
          setIsViewUserModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminDashboard;