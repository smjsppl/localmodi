import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  MapPin,
  Users,
  Zap,
  Heart
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Mock data for demonstration
const MOCK_CATEGORIES = [
  { id: 'groceries', name: 'Groceries', icon: '🛒' },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
  { id: 'food', name: 'Food', icon: '🍔' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍪' },
  { id: 'essentials', name: 'Essentials', icon: '🏠' },
];

const MOCK_PENDING_RESPONSES = [
  { id: 1, vendor: 'Local Mart', category: 'Groceries', time: '10 min ago' },
  { id: 2, vendor: 'Pharmacy Plus', category: 'Pharmacy', time: '25 min ago' },
];

const MOCK_CURRENT_ORDER = {
  id: 'ORD-12345',
  status: 'In Progress',
  vendor: 'Quick Mart',
  items: 5,
  total: 124.75,
  estimatedDelivery: '30-45 min'
};

const MOCK_PAST_ORDERS = [
  { id: 'ORD-12344', date: '2023-05-15', status: 'Delivered', total: 89.99 },
  { id: 'ORD-12343', date: '2023-05-14', status: 'Delivered', total: 145.50 },
  { id: 'ORD-12342', date: '2023-05-13', status: 'Cancelled', total: 32.99 },
];

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [pendingResponses, setPendingResponses] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be API calls:
        // const categoriesRes = await axios.get('/api/categories');
        // const responsesRes = await axios.get('/api/orders/pending-responses');
        // const currentOrderRes = await axios.get('/api/orders/current');
        // const pastOrdersRes = await axios.get('/api/orders/history');
        
        // For now, using mock data
        setCategories(MOCK_CATEGORIES);
        setPendingResponses(MOCK_PENDING_RESPONSES);
        setCurrentOrder(MOCK_CURRENT_ORDER);
        setPastOrders(MOCK_PAST_ORDERS);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategorySelect = (categoryId) => {
    navigate(`/order/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h1>
        <p className="text-gray-600">What would you like to order today?</p>
      </div>

      {/* Pending Responses */}
      {pendingResponses.length > 0 && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-700 mr-3 mt-0.5 flex-shrink-0" />
            <div className="w-full">
              <h3 className="font-medium text-blue-900 mb-2">
                You have {pendingResponses.length} pending response{pendingResponses.length !== 1 ? 's' : ''}
              </h3>
              {pendingResponses.map((response) => (
                <div key={response.id} className="mb-2 last:mb-0">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">{response.vendor}</span> has responded to your {response.category} order
                  </p>
                  <p className="text-xs text-blue-600">{response.time}</p>
                </div>
              ))}
              <button className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center">
                View all responses <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Order Status */}
      {currentOrder && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium text-gray-900">Current Order</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {currentOrder.status}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">Order #{currentOrder.id}</p>
          <p className="text-gray-800 font-medium mb-3">{currentOrder.vendor}</p>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{currentOrder.items} items • ${currentOrder.total.toFixed(2)}</span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-gray-500" />
              {currentOrder.estimatedDelivery}
            </span>
          </div>
          <button className="w-full mt-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Track Order
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-2">{category.icon}</span>
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Past Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          {pastOrders.length > 0 && (
            <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View all
            </Link>
          )}
        </div>

        {pastOrders.length > 0 ? (
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <div key={order.id} className="bg-white p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <button className="mt-3 w-full text-sm font-medium text-blue-600 hover:text-blue-800 text-left">
                  Reorder <ChevronRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No past orders</h3>
            <p className="mt-1 text-sm text-gray-500">Your order history will appear here</p>
            <div className="mt-6">
              <Link
                to="/categories"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Key Benefits */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
          Why Shop with LocalModi?
        </h2>
        
        <div className="grid gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Hyperlocal Network</h3>
              <p className="text-gray-600 text-sm">
                Connect with vendors within walking distance. Support your neighborhood economy and get faster deliveries.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Real Local Vendors</h3>
              <p className="text-gray-600 text-sm">
                Work directly with shop owners and suppliers in your area. Build relationships, not just transactions.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600 text-sm">
                Get instant quotes from multiple local vendors. Compare prices and delivery times in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Ordering</h3>
              <p className="text-gray-600 text-sm">
                Order naturally - speak, type, or snap a photo. No complex catalogs or endless scrolling.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Focus */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl p-6">
        <div className="text-center">
          <Heart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Built for Community</h3>
          <p className="text-sm text-gray-700">
            Every order supports local businesses and strengthens neighborhood connections. 
            Shop local, live local.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12">
        <h3 className="font-semibold text-gray-900 text-center mb-6">How LocalModi Works</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <p className="text-sm text-gray-700">Tell us what you need (any way you prefer)</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <p className="text-sm text-gray-700">Nearby vendors receive your request instantly</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <p className="text-sm text-gray-700">Compare quotes and choose your preferred vendor</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
            <p className="text-sm text-gray-700">Get your items delivered by someone local</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
