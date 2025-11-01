import React, { useState } from 'react';
import { UserPlus, UserCog, UserMinus, Clock, Eye } from 'lucide-react';
import type { User as SystemUser } from '../../../services/userService';

interface UshersTabProps {
  isMobile: boolean;
  activeUshers: SystemUser[];
  deactivatedUshers: SystemUser[];
  onAddUsher: () => void;
  onViewUser: (user: SystemUser) => void;
  onDeactivateUser: (userId: number) => Promise<void>;
  onReactivateUser: (userId: number) => Promise<void>;
}

const UshersTab: React.FC<UshersTabProps> = ({
  isMobile,
  activeUshers,
  deactivatedUshers,
  onAddUsher,
  onViewUser,
  onDeactivateUser,
  onReactivateUser
}) => {
  const [ushersTab, setUshersTab] = useState<'active' | 'deactivated'>('active');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">Usher Management</h3>
              <p className="text-gray-500 text-sm mt-1">Manage system ushers and their access</p>
            </div>
            <button 
              onClick={onAddUsher}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg shadow-blue-500/25 whitespace-nowrap min-h-[44px] sm:w-auto w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Usher
            </button>
          </div>
          
          {/* Ushers Tabs */}
          <div className="mt-4 flex space-x-1">
            <button
              onClick={() => setUshersTab('active')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center min-h-[44px] ${
                ushersTab === 'active'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-gray-700 hover:text-blue-600 hover:shadow-md border border-gray-200'
              }`}
            >
              <UserCog className="h-4 w-4 mr-2" />
              Active ({activeUshers.length})
            </button>
            <button
              onClick={() => setUshersTab('deactivated')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center min-h-[44px] ${
                ushersTab === 'deactivated'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-800 hover:shadow-md border border-gray-200'
              }`}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Inactive ({deactivatedUshers.length})
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {ushersTab === 'active' && (
            activeUshers.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">No Active Ushers</h3>
                <p className="text-gray-500 text-sm mb-4">Get started by adding your first usher.</p>
                <button 
                  onClick={onAddUsher}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center mx-auto font-medium shadow-lg shadow-blue-500/25 min-h-[44px]"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Usher
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {activeUshers.map((usher) => (
                  <div key={usher.userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {usher.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{usher.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{usher.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex-shrink-0">Active</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate text-xs">Joined: {new Date(usher.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onViewUser(usher)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => onDeactivateUser(usher.userId)}
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

          {ushersTab === 'deactivated' && (
            deactivatedUshers.length === 0 ? (
              <div className="text-center py-8">
                <UserMinus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">No Inactive Ushers</h3>
                <p className="text-gray-500 text-sm">All ushers are currently active.</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {deactivatedUshers.map((usher) => (
                  <div key={usher.userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {usher.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-600 truncate">{usher.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{usher.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex-shrink-0">Inactive</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate text-xs">Joined: {new Date(usher.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onViewUser(usher)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => onReactivateUser(usher.userId)}
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
  );
};

export default UshersTab;