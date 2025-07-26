import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CategorySelection from './pages/CategorySelection';
import OrderInput from './pages/OrderInput';
import OrderReview from './pages/OrderReview';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategorySelection />} />
            <Route path="/order/:category" element={<OrderInput />} />
            <Route path="/review" element={<OrderReview />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
