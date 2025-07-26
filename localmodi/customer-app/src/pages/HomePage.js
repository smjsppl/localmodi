import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Clock, Zap, Heart, ShoppingBag } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-amber-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Shop Local, Live Local
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect with neighborhood vendors and get what you need from suppliers right around the corner.
        </p>
      </div>

      {/* Main CTA */}
      <div className="mb-12">
        <Link to="/categories" className="block">
          <div className="btn-primary w-full text-center text-lg py-4">
            Start Shopping Locally
          </div>
        </Link>
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
