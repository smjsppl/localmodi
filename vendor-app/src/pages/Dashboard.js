import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Clock, DollarSign, Package, Eye, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const [rfqs, setRfqs] = useState([
    {
      id: 1,
      category: 'Beverages',
      items: ['Coca Cola 1L x2', 'Pepsi 500ml x1'],
      customer: 'Customer #1234',
      time: '5 mins ago',
      status: 'new',
      location: '0.5km away'
    },
    {
      id: 2,
      category: 'Snacks',
      items: ['Lays Chips x2', 'Kurkure x1'],
      customer: 'Customer #5678',
      time: '15 mins ago',
      status: 'quoted',
      location: '1.2km away'
    },
    {
      id: 3,
      category: 'Groceries',
      items: ['Rice 1kg', 'Dal 500g', 'Oil 1L'],
      customer: 'Customer #9012',
      time: '1 hour ago',
      status: 'accepted',
      location: '0.8km away'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Bell className="w-4 h-4" />;
      case 'quoted': return <Clock className="w-4 h-4" />;
      case 'accepted': return <DollarSign className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Vendor Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your RFQs and orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New RFQs</p>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-green-600">7</p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* RFQ List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent RFQs</h2>
          <span className="text-sm text-gray-500">{rfqs.length} total</span>
        </div>

        {rfqs.map((rfq) => (
          <div key={rfq.id} className="vendor-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">{rfq.category}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(rfq.status)}`}>
                    {getStatusIcon(rfq.status)}
                    <span className="capitalize">{rfq.status}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">{rfq.customer} • {rfq.location}</p>
              </div>
              <span className="text-xs text-gray-500">{rfq.time}</span>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-700 mb-2">Items requested:</p>
              <div className="space-y-1">
                {rfq.items.map((item, index) => (
                  <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Link 
                to={`/rfq/${rfq.id}`}
                className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </Link>
              
              {rfq.status === 'new' && (
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Quick Quote</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
            <Bell className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <span className="text-sm text-blue-700">Notifications</span>
          </button>
          
          <button className="p-3 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
            <Package className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <span className="text-sm text-green-700">My Inventory</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
