import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 py-4">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LocalModi</h1>
            <p className="text-xs text-gray-500">Shop Local</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
