import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Users, TrendingUp, Clock, Shield, Heart } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Store className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Grow Your Local Business
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect with customers in your neighborhood and expand your reach through LocalModi's vendor network.
        </p>
      </div>

      {/* Main CTA */}
      <div className="mb-12">
        <Link to="/login" className="block">
          <div className="btn-primary w-full text-center text-lg py-4">
            Join as Vendor
          </div>
        </Link>
      </div>

      {/* Key Benefits */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
          Why Partner with LocalModi?
        </h2>
        
        <div className="grid gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct Customer Access</h3>
              <p className="text-gray-600 text-sm">
                Receive orders directly from customers in your area. No middleman, better margins.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Grow Your Revenue</h3>
              <p className="text-gray-600 text-sm">
                Reach new customers beyond your physical location. Expand your business digitally.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Notifications</h3>
              <p className="text-gray-600 text-sm">
                Get notified immediately when customers need your products. Respond quickly to win orders.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted Platform</h3>
              <p className="text-gray-600 text-sm">
                Secure payments, verified customers, and community-focused approach to business.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Focus */}
      <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <div className="text-center">
          <Heart className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Community First</h3>
          <p className="text-sm text-gray-700">
            LocalModi is built to strengthen local economies. Every transaction supports neighborhood businesses.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12">
        <h3 className="font-semibold text-gray-900 text-center mb-6">How It Works for Vendors</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <p className="text-sm text-gray-700">Register your business and set up your profile</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <p className="text-sm text-gray-700">Receive instant notifications for relevant orders</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <p className="text-sm text-gray-700">Respond with quotes and availability</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
            <p className="text-sm text-gray-700">Fulfill orders and grow your customer base</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-600">
          Questions about joining? Contact us for more information about vendor partnerships.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
