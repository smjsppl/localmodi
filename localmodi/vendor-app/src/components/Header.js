import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LocalModi</h1>
              <p className="text-xs text-gray-500">Vendor Portal</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
