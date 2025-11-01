import React, { useState } from 'react';
import { Search, UserPlus, Edit, Trash2, Users } from 'lucide-react';
import type { Member } from '../../../services/memberService';

interface MembersTabProps {
  isMobile: boolean;
  allMembers: Member[];
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: number) => Promise<void>;
}

const MembersTab: React.FC<MembersTabProps> = ({
  isMobile,
  allMembers,
  onAddMember,
  onEditMember,
  onDeleteMember
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.residence.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">Member Management</h3>
              <p className="text-gray-500 text-sm mt-1">Manage all church members</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white min-h-[44px]"
                />
              </div>
              <button 
                onClick={onAddMember}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg shadow-blue-500/25 whitespace-nowrap min-h-[44px]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {isMobile ? (
            // Mobile-friendly card layout
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.memberId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-semibold text-gray-900 truncate">{member.name}</h4>
                        <p className="text-sm text-gray-600 truncate">{member.residence}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            member.ageGroup === 'child' 
                              ? 'bg-purple-100 text-purple-800'
                              : member.ageGroup === 'youth'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {member.ageGroup}
                          </span>
                          <span className="text-xs text-gray-500">
                            {member.phone || 'No phone'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                      Active
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEditMember(member)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium text-sm min-h-[44px] min-w-[44px]"
                        title="Edit member"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteMember(member.memberId)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center font-medium text-sm min-h-[44px] min-w-[44px]"
                        title="Delete member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop table layout
            <div className="mobile-table-container">
              <table className="min-w-full divide-y divide-gray-200 mobile-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Age Group</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.memberId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{member.name}</div>
                            <div className="text-xs text-gray-500 truncate">{member.residence}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          member.ageGroup === 'child' 
                            ? 'bg-purple-100 text-purple-800'
                            : member.ageGroup === 'youth'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {member.ageGroup}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate">{member.phone || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => onEditMember(member)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded hover:bg-blue-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Edit member"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteMember(member.memberId)}
                            className="text-red-600 hover:text-red-900 transition-colors p-2 rounded hover:bg-red-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Delete member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No Members Found</h3>
              <p className="text-gray-500 text-sm mb-4">Get started by adding your first member.</p>
              <button 
                onClick={onAddMember}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center mx-auto font-medium shadow-lg shadow-blue-500/25 min-h-[44px]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Member
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersTab;