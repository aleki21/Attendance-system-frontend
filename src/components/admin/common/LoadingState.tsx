import React from 'react';

interface LoadingStateProps {
  retryCount: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ retryCount }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center safe-top safe-bottom">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg font-medium">Loading Dashboard</p>
      <p className="text-gray-400 text-sm mt-2">
        {retryCount > 0 ? `Attempt ${retryCount} of 3` : 'Preparing your data...'}
      </p>
    </div>
  </div>
);

export default LoadingState;