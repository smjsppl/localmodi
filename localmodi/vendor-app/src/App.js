import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RFQDetails from './pages/RFQDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rfq/:id" element={<RFQDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
