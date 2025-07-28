import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setOtpSent(true);
      // Mock OTP send
      alert('OTP sent to your phone!');
    }
  };

  const handleLogin = () => {
    if (otp === '1234') { // Mock OTP verification
      localStorage.setItem('vendorLoggedIn', 'true');
      navigate('/dashboard');
    } else {
      alert('Invalid OTP. Try 1234 for demo.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Vendor Login
        </h1>
        <p className="text-gray-600">
          Access your business dashboard
        </p>
      </div>

      <div className="card space-y-6">
        {/* Phone Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={otpSent}
            />
          </div>
        </div>

        {/* Send OTP Button */}
        {!otpSent && (
          <button
            onClick={handleSendOtp}
            disabled={phone.length < 10}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              phone.length >= 10
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Send OTP
          </button>
        )}

        {/* OTP Input */}
        {otpSent && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showOtp ? 'text' : 'password'}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOtp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={otp.length < 4}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                otp.length >= 4
                  ? 'btn-primary'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Verify & Login
            </button>

            <button
              onClick={() => {
                setOtpSent(false);
                setOtp('');
              }}
              className="w-full text-sm text-green-600 hover:text-green-700"
            >
              Change Phone Number
            </button>
          </>
        )}
      </div>

      {/* Demo Info */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Demo:</strong> Use any 10-digit phone number and OTP: 1234
        </p>
      </div>

      {/* Invite Only Notice */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Vendor access is currently invite-only. Contact us if you'd like to join our network.
        </p>
      </div>
    </div>
  );
};

export default Login;
