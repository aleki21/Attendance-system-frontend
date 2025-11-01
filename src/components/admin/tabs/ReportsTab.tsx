import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Download, TrendingUp, Users, UserPlus, Activity, BarChart3 } from 'lucide-react';
import type { AnalyticsData, DemographicData } from '../../../services/analyticsService';

interface ReportsTabProps {
  isMobile: boolean;
  analyticsData: AnalyticsData | null;
  analyticsLoading: boolean;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  setTimeRange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
  exportLoading: boolean;
  onExportReport: (format: 'pdf' | 'csv') => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  isMobile,
  analyticsData,
  analyticsLoading,
  timeRange,
  setTimeRange,
  exportLoading,
  onExportReport
}) => {
  // Chart colors
  const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    male: '#3b82f6',
    female: '#ec4899',
    background: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']
  };

  // Convert demographics data to simple array for Pie chart
  const getPieChartData = (demographics: DemographicData[]): any[] => {
    return demographics.map(item => ({
      name: item.name,
      value: item.value,
      count: item.count,
      percentage: item.percentage
    }));
  };

  // Process gender data for line chart
  const getGenderTrendData = () => {
    if (!analyticsData?.genderAttendanceTrends) return [];
    
    return analyticsData.genderAttendanceTrends.map(trend => ({
      date: trend.date,
      'Adult Male': trend.male,
      'Adult Female': trend.female,
      total: trend.total
    }));
  };

  // Process event attendance data
  const getEventAttendanceData = () => {
    if (!analyticsData?.eventAttendance) return [];
    
    return analyticsData.eventAttendance.map(event => ({
      name: event.eventName.length > 20 ? `${event.eventName.substring(0, 20)}...` : event.eventName,
      fullName: event.eventName,
      attendance: event.attendance,
      percentage: event.percentage,
      date: event.date
    }));
  };

  if (analyticsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">No Analytics Data</h3>
        <p className="text-gray-500 text-sm">Analytics data will appear here once available.</p>
      </div>
    );
  }

  const pieChartData = analyticsData.demographics ? getPieChartData(analyticsData.demographics) : [];
  const genderTrendData = getGenderTrendData();
  const eventAttendanceData = getEventAttendanceData();

  console.log('Analytics Data:', analyticsData);
  console.log('Gender Trend Data:', genderTrendData);
  console.log('Event Attendance Data:', eventAttendanceData);
  console.log('Pie Chart Data:', pieChartData);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900">Analytics Dashboard</h3>
            <p className="text-gray-600 text-sm mt-1">
              Insights into church attendance and engagement
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white w-full min-h-[44px]"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => onExportReport('csv')}
                disabled={exportLoading || analyticsLoading}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium disabled:opacity-50 flex-1 min-h-[44px]"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </button>
              <button
                onClick={() => onExportReport('pdf')}
                disabled={exportLoading || analyticsLoading}
                className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex-1 min-h-[44px]"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Attendance</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {analyticsData.topMetrics.averageAttendance}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Peak Attendance</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {analyticsData.topMetrics.peakAttendance}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-100">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Member Growth</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                +{analyticsData.topMetrics.memberGrowth}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-100">
              <UserPlus className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Engagement</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {analyticsData.topMetrics.engagementRate}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-orange-100">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid with Mobile Optimization */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Overall Attendance Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h4 className="text-base font-semibold text-gray-900 mb-3">Total Attendance Trends</h4>
          <div className="mobile-chart-container">
            <div className="mobile-chart h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={isMobile ? 400 : 300}>
                <LineChart 
                  data={analyticsData.attendanceTrends}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return timeRange === 'year' 
                        ? date.toLocaleDateString('en-US', { month: 'short' })
                        : timeRange === 'quarter'
                        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'attendance') return [`${value} attendees`, 'Attendance'];
                      if (name === 'percentage') return [`${value}%`, 'Rate'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: isMobile ? 2 : 3 }}
                    activeDot={{ r: isMobile ? 4 : 5, fill: CHART_COLORS.primary }}
                    name="Attendance Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Adult Gender Trends Line Chart */}
        {genderTrendData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-3">Adult Gender Trends</h4>
            <div className="mobile-chart-container">
              <div className="mobile-chart h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={isMobile ? 400 : 300}>
                  <LineChart
                    data={genderTrendData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Adult Male" 
                      stroke={CHART_COLORS.male} 
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.male, strokeWidth: 2, r: isMobile ? 2 : 3 }}
                      activeDot={{ r: isMobile ? 4 : 5, fill: CHART_COLORS.male }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Adult Female" 
                      stroke={CHART_COLORS.female} 
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.female, strokeWidth: 2, r: isMobile ? 2 : 3 }}
                      activeDot={{ r: isMobile ? 4 : 5, fill: CHART_COLORS.female }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Demographics Pie Chart */}
        {pieChartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-3">Age Group Distribution</h4>
            <div className="mobile-chart-container">
              <div className="mobile-chart h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={isMobile ? 400 : 300}>
                  <RePieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => 
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS.background[index % CHART_COLORS.background.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const total = pieChartData.reduce((sum: number, item: any) => sum + item.value, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [`${value} members (${percentage}%)`, name];
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Event Attendance Chart */}
        {eventAttendanceData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-900 mb-3">Event Attendance</h4>
            <div className="mobile-chart-container">
              <div className="mobile-chart h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={isMobile ? 400 : 300}>
                  <BarChart
                    data={eventAttendanceData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 80 : 40}
                    />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'attendance') return [`${value} attendees`, 'Attendance'];
                        return [value, name];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return `Event: ${payload[0].payload.fullName}`;
                        }
                        return label;
                      }}
                    />
                    <Bar 
                      dataKey="attendance" 
                      fill={CHART_COLORS.secondary} 
                      name="Attendance" 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="text-base font-semibold text-gray-900 mb-3">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800 text-sm">Attendance Trends</span>
            </div>
            <p className="text-blue-700 text-xs">
              Average attendance is {analyticsData.topMetrics.averageAttendance}% with peak attendance reaching {analyticsData.topMetrics.peakAttendance} members.
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center mb-1">
              <Users className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-semibold text-green-800 text-sm">Member Growth</span>
            </div>
            <p className="text-green-700 text-xs">
              Church membership has grown by {analyticsData.topMetrics.memberGrowth}% in the selected period.
            </p>
          </div>

          {pieChartData.length > 0 && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center mb-1">
                <UserPlus className="h-4 w-4 text-purple-600 mr-2" />
                <span className="font-semibold text-purple-800 text-sm">Demographics</span>
              </div>
              <p className="text-purple-700 text-xs">
                Largest age group: {pieChartData[0]?.name} ({((pieChartData[0]?.value / pieChartData.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(0)}% of members)
              </p>
            </div>
          )}

          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center mb-1">
              <Activity className="h-4 w-4 text-orange-600 mr-2" />
              <span className="font-semibold text-orange-800 text-sm">Engagement</span>
            </div>
            <p className="text-orange-700 text-xs">
              Overall engagement rate is {analyticsData.topMetrics.engagementRate}%, indicating healthy member participation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;