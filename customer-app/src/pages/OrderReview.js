import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Check, Clock, MapPin } from 'lucide-react';

const OrderReview = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [parsedItems, setParsedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedOrder = localStorage.getItem('currentOrder');
    if (storedOrder) {
      const order = JSON.parse(storedOrder);
      setOrderData(order);
      
      // Mock parsed items - in real app this would come from LLM processing
      setParsedItems([
        { id: 1, item: 'Coca Cola', brand: 'Coca Cola', unit: '1 liter', qty: 2 },
        { id: 2, item: 'Lays Chips', brand: 'Lays', unit: '1 pack', qty: 1 }
      ]);
    }
    setLoading(false);
  }, []);

  const handleSubmitOrder = () => {
    // In real app, this would submit to backend
    alert('Order submitted to local vendors!');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Order
        </h1>
        <p className="text-gray-600">
          Confirm your items before sending to vendors
        </p>
      </div>

      {/* Original Input */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Your Request:</h3>
        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
          "{orderData?.input}"
        </p>
      </div>

      {/* Parsed Items */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Parsed Items:</h3>
        <div className="space-y-3">
          {parsedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.item}</p>
                <p className="text-sm text-gray-600">
                  {item.brand} • {item.unit} • Qty: {item.qty}
                </p>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Location Info */}
      <div className="card mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Delivery Location</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Your current location • Vendors within 2km will receive this request
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleSubmitOrder}
          className="btn-primary w-full py-4 flex items-center justify-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>Send to Local Vendors</span>
        </button>

        <button
          onClick={() => navigate(-1)}
          className="btn-outline w-full py-4"
        >
          Go Back to Edit
        </button>
      </div>

      <div className="mt-6 bg-green-50 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Next Steps:</strong> Local vendors will receive your request and respond with quotes. 
          You'll be notified when quotes are available.
        </p>
      </div>
    </div>
  );
};

export default OrderReview;
