import React from 'react';
import { X, LayoutDashboard, UserPlus, Tag as TagIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

// Sidebar component with navigation links
export const Sidebar = ({ navigation, sidebarOpen, setSidebarOpen, currentPath }) => {
  // Map icon names to actual components
  const getIcon = (iconName) => {
    const iconMap = {
      'layout-dashboard': <LayoutDashboard className="h-5 w-5" />,
      'user-plus': <UserPlus className="h-5 w-5" />,
      'tag': <TagIcon className="h-5 w-5" />
    };
    return iconMap[iconName] || <LayoutDashboard className="h-5 w-5" />;
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-gray-900">LocalModi Admin</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${currentPath === item.href ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3 text-gray-400 group-hover:text-gray-500">
                      {getIcon(item.icon)}
                    </span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">LocalModi Admin</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${currentPath === item.href ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <span className={`mr-3 ${currentPath === item.href ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {getIcon(item.icon)}
                  </span>
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Admin User
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main layout container
export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default Layout;
