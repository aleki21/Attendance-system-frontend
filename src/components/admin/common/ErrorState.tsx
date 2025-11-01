import React from 'react';
import { Activity, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Unavailable</h2>
        <p className="text-red-600 mb-6">{error}</p>
        
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center font-medium min-h-[44px]"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Retry Loading Dashboard
          </button>
          
          <button
            onClick={logout}
            className="w-full bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center font-medium min-h-[44px]"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;