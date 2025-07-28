import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Package, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalCategories: 0,
    pendingInvites: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsData, activityData] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentActivity()
        ]);
        
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalVendors: statsData.totalVendors || 0,
          totalOrders: statsData.totalOrders || 0,
          totalCategories: statsData.totalCategories || 0,
          pendingInvites: statsData.pendingInvites || 0
        });
        
        setRecentActivity(activityData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<Users className="h-6 w-6 text-blue-500" />} 
          />
          <StatCard 
            title="Vendors" 
            value={stats.totalVendors} 
            icon={<ShoppingBag className="h-6 w-6 text-green-500" />} 
          />
          <StatCard 
            title="Orders" 
            value={stats.totalOrders} 
            icon={<Package className="h-6 w-6 text-yellow-500" />} 
          />
          <StatCard 
            title="Pending Invites" 
            value={stats.pendingInvites} 
            icon={<Users className="h-6 w-6 text-purple-500" />} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-gray-600">Welcome back, Admin</p>
        </header>

        {/* Recent Activity */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest actions and events in the system
            </p>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
            <ul className="divide-y divide-gray-200">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem 
                    key={index}
                    type={activity.type}
                    title={activity.title}
                    description={activity.description}
                    time={activity.timestamp}
                    user={activity.user}
                  />
                ))
              ) : (
                <li className="px-6 py-4 text-center text-sm text-gray-500">
                  No recent activity to display
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Invite New Vendor
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        Send vendor invitation
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a
                  href="/invites"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Go to Invites
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Manage Categories
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        Add or edit categories
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a
                  href="/categories"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Go to Categories
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      View Reports
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        Sales and analytics
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  View Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon, change = null }) => {
  const isPositive = change && change.startsWith('+');
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md p-3 bg-blue-50">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value.toLocaleString()}
              </div>
              {change && (
                <div 
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? (
                    <span className="sr-only">Increased by</span>
                  ) : (
                    <span className="sr-only">Decreased by</span>
                  )}
                  {change}
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ type, title, description, time, user }) => {
  const getIcon = () => {
    switch (type) {
      case 'user':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    return 'Just now';
  };

  return (
    <li className="px-6 py-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-50">
            {getIcon()}
          </div>
        </div>
        <div className="ml-4">
          <div className="flex items-center text-sm text-gray-900">
            <p className="font-medium">{title}</p>
            {user && (
              <span className="ml-1 text-sm text-gray-500">by {user}</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{description}</p>
          <div className="mt-1 text-xs text-gray-400">
            {getTimeAgo(time)}
          </div>
        </div>
      </div>
    </li>
  );
};

export default Dashboard;
