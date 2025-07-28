import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CategorySelection from './pages/CategorySelection';
import OrderInput from './pages/OrderInput';
import OrderReview from './pages/OrderReview';
import AddressBookPage from './pages/AddressBookPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Watermark from './components/common/Watermark';

// Set axios defaults
axios.defaults.baseURL = 'http://localhost:8000/api/v1';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set the default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const userData = JSON.parse(localStorage.getItem('user') || 'null');
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Set the default auth header
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 relative">
        <Watermark />
        <Header user={user} onLogout={handleLogout} />
        <main className="pb-20 relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategorySelection />} />
            <Route path="/order/:category" element={<OrderInput />} />
            <Route path="/orders/review" element={<OrderReview />} />
            <Route path="/addresses" element={<AddressBookPage />} />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" /> : <Register onRegister={handleLogin} />} 
            />
            
            {/* Protected Routes (example) */}
            <Route 
              path="/profile" 
              element={user ? <div>Profile Page (Coming Soon)</div> : <Navigate to="/login" />} 
            />
            <Route 
              path="/addresses" 
              element={user ? <div>Addresses Page (Coming Soon)</div> : <Navigate to="/login" />} 
            />
            <Route 
              path="/orders" 
              element={user ? <div>Orders Page (Coming Soon)</div> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        
        {/* Simple Footer */}
        <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-3">
          <div className="max-w-md mx-auto px-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} LocalModi. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
