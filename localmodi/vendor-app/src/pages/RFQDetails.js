import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, Package, DollarSign, Send } from 'lucide-react';

const RFQDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Mock RFQ data
  const rfq = {
    id: id,
    category: 'Beverages',
    customer: 'Customer #1234',
    location: '0.5km away',
    time: '5 mins ago',
    originalRequest: 'I need 2 bottles of Coca Cola 1 liter each, and 1 bottle of Pepsi 500ml',
    parsedItems: [
      { item: 'Coca Cola', brand: 'Coca Cola', unit: '1 liter', qty: 2 },
      { item: 'Pepsi', brand: 'Pepsi', unit: '500ml', qty: 1 }
    ]
  };

  const handleSubmitQuote = () => {
    if (quote && deliveryTime) {
      alert('Quote submitted successfully!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">RFQ Details</h1>
          <p className="text-sm text-gray-600">#{rfq.id}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{rfq.customer}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{rfq.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Requested {rfq.time}</span>
          </div>
        </div>
      </div>

      {/* Original Request */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Original Request</h3>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
          "{rfq.originalRequest}"
        </p>
      </div>

      {/* Parsed Items */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Items Requested</h3>
        <div className="space-y-3">
          {rfq.parsedItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.item}</p>
                <p className="text-sm text-gray-600">
                  {item.brand} • {item.unit} • Qty: {item.qty}
                </p>
              </div>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Quote Form */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Submit Your Quote</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Price (₹)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Enter total amount"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Time
            </label>
            <select
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select delivery time</option>
              <option value="30min">Within 30 minutes</option>
              <option value="1hour">Within 1 hour</option>
              <option value="2hours">Within 2 hours</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Any additional information for the customer..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none h-20 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitQuote}
        disabled={!quote || !deliveryTime}
        className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
          quote && deliveryTime
            ? 'btn-primary'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
        <span>Submit Quote</span>
      </button>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Competitive pricing and faster delivery times increase your chances of winning the order.
        </p>
      </div>
    </div>
  );
};

export default RFQDetails;
