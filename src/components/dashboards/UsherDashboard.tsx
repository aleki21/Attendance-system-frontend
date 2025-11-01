import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Calendar, Users, CheckCircle, X, LogOut, Clock, UserPlus, Menu, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { eventService, type Event } from '../../services/eventService';
import { memberService, type Member } from '../../services/memberService';
import { attendanceService, type MemberAttendance } from '../../services/attendanceService';
import { AddMemberModal } from '../../components/modals';

const UsherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [eventsResponse, membersResponse] = await Promise.all([
        eventService.getTodayEvents(),
        memberService.getMembers({ page: 1, limit: 1000 })
      ]);

      setTodayEvents(eventsResponse.events);
      setAllMembers(membersResponse.members);

      if (selectedEvent) {
        await loadEventAttendance(selectedEvent.eventId);
      }

    } catch (error) {
      console.error('Failed to load usher dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventAttendance = async (eventId: number) => {
    try {
      const attendanceResponse = await attendanceService.getEventAttendance(eventId);
      const presentMemberIds = new Set(
        attendanceResponse.attendance
          .filter((record: MemberAttendance) => record.attendance.status === 'present')
          .map((record: MemberAttendance) => record.member.memberId)
      );
      setAttendanceMarked(presentMemberIds);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    }
  };

  const handleMarkAttendance = async (memberId: number) => {
    if (!selectedEvent) return;

    try {
      setMarkingAttendance(memberId);
      
      await attendanceService.recordAttendance({
        eventId: selectedEvent.eventId,
        attendance: [
          {
            memberId: memberId,
            status: 'present' as const
          }
        ]
      });

      setAttendanceMarked(prev => new Set(prev).add(memberId));
      setSuccessMessage('Attendance marked successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(null);
    }
  };

  const handleMemberCreated = () => {
    loadDashboardData();
    setSuccessMessage('Member added successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredMembers = allMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.residence.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isPresent = attendanceMarked.has(member.memberId);
    
    if (filter === 'present') return matchesSearch && isPresent;
    if (filter === 'absent') return matchesSearch && !isPresent;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading Dashboard</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your events...</p>
        </div>
      </div>
    );
  }

  // Event Selection View
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Usher Portal</h1>
                  <p className="text-gray-500 text-xs">Welcome, {user?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Events</h2>
            <p className="text-gray-600">Select an event to start marking attendance</p>
          </div>

          <div className="space-y-4">
            {todayEvents.map(event => (
              <div
                key={event.eventId}
                onClick={async () => {
                  setSelectedEvent(event);
                  await loadEventAttendance(event.eventId);
                }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.eventType === 'sunday_service' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {event.eventType === 'sunday_service' ? 'Sunday Service' : 'Custom Event'}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {event.name}
                </h3>
                
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <button className="w-full bg-gradient-to-br from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium shadow-lg shadow-green-500/25 active:scale-[0.98] transition-transform">
                    Mark Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>

          {todayEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Today</h3>
              <p className="text-gray-600">
                There are no events scheduled for today.
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Attendance Marking View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to events"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div className="max-w-[140px]">
                <h1 className="text-lg font-bold text-gray-900 truncate">Marking Attendance</h1>
                <p className="text-gray-500 text-xs truncate">{selectedEvent.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-medium text-gray-900">
                  {attendanceMarked.size} / {allMembers.length}
                </p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="bg-white border-b border-gray-200 shadow-lg z-10 md:hidden">
          <div className="px-4 py-2">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-green-800 font-medium text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Event Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedEvent.name}</h2>
              <p className="text-gray-600 text-sm mt-1">
                {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedEvent.eventType === 'sunday_service' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {selectedEvent.eventType === 'sunday_service' ? 'Sunday Service' : 'Custom Event'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {attendanceMarked.size} Present
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {Math.round((attendanceMarked.size / allMembers.length) * 100)}%
                </div>
                <p className="text-gray-500 text-xs">Attendance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base bg-white placeholder-gray-500"
            />
          </div>

          {/* Filter Toggle and Add Member */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-3 flex-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium flex items-center justify-center min-w-[120px] hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <div className="flex-1 sm:hidden">
                <button 
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform hover:from-blue-600 hover:to-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </button>
              </div>
            </div>
            <button 
              onClick={() => setIsAddMemberModalOpen(true)}
              className="hidden sm:flex bg-gradient-to-br from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg font-medium flex items-center justify-center shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform hover:from-blue-600 hover:to-blue-700 whitespace-nowrap"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setFilter('all')}
                className={`py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'all' 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('present')}
                className={`py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'present' 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Present
              </button>
              <button
                onClick={() => setFilter('absent')}
                className={`py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'absent' 
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Absent
              </button>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Members ({filteredMembers.length})
              </h3>
              <span className="text-sm text-gray-500 capitalize hidden sm:block">
                {filter} • {Math.round((attendanceMarked.size / allMembers.length) * 100)}% Complete
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredMembers.map(member => {
              const isMarked = attendanceMarked.has(member.memberId);
              const isMarking = markingAttendance === member.memberId;
              
              return (
                <div key={member.memberId} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-semibold text-gray-900 truncate">{member.name}</div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize flex-shrink-0 hidden sm:inline-block ${
                            member.ageGroup === 'child' 
                              ? 'bg-purple-100 text-purple-800'
                              : member.ageGroup === 'youth'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {member.ageGroup}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate mb-1">{member.residence}</div>
                        <div className="text-xs text-gray-600">
                          {member.phone || 'No phone provided'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize sm:hidden ${
                        member.ageGroup === 'child' 
                          ? 'bg-purple-100 text-purple-800'
                          : member.ageGroup === 'youth'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {member.ageGroup}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {isMarked ? (
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-medium text-sm hidden sm:block">Present</span>
                            <span className="text-green-700 font-medium text-sm sm:hidden">✓</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleMarkAttendance(member.memberId)}
                            disabled={isMarking}
                            className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg shadow-green-500/25 active:scale-[0.95] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 hover:from-green-600 hover:to-green-700 flex items-center gap-2 whitespace-nowrap"
                          >
                            {isMarking ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span className="hidden sm:inline">Marking...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3" />
                                <span className="hidden sm:inline">Mark Present</span>
                                <span className="sm:hidden">Mark</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 px-4">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">No Members Found</h3>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your search or add a new member</p>
              <button 
                onClick={() => setIsAddMemberModalOpen(true)}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center mx-auto shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform hover:from-blue-600 hover:to-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Member
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-3 text-sm">How to mark attendance:</h4>
          <ul className="text-blue-700 text-sm space-y-2">
            <li className="flex items-start">
              <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="text-blue-800 text-xs font-bold">1</span>
              </div>
              Search for members by name or residence
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="text-blue-800 text-xs font-bold">2</span>
              </div>
              Tap "Mark Present" for each member who attended
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="text-blue-800 text-xs font-bold">3</span>
              </div>
              Use filters to view present/absent members
            </li>
          </ul>
        </div>
      </main>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={handleMemberCreated}
      />
    </div>
  );
};

export default UsherDashboard;