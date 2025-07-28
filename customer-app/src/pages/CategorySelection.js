import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Coffee, Cookie, Apple, ShoppingCart, Utensils, Heart } from 'lucide-react';

const CategorySelection = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories] = useState([
    { id: 'beverages', name: 'Beverages', icon: Coffee, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'snacks', name: 'Snacks', icon: Cookie, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { id: 'groceries', name: 'Groceries', icon: ShoppingCart, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { id: 'fruits', name: 'Fruits', icon: Apple, color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'food', name: 'Food', icon: Utensils, color: 'text-red-600', bgColor: 'bg-red-100' },
    { id: 'health', name: 'Health', icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100' }
  ]);
  const navigate = useNavigate();

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
      navigate(`/order/${selectedCategories[0]}`);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Select Categories
        </h1>
        <p className="text-gray-600">
          Choose one or more categories for your order
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`relative card p-4 text-center transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`w-12 h-12 ${category.bgColor} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${category.color}`} />
              </div>
              
              <span className="text-sm font-medium text-gray-900 block">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-2">
              Selected Categories ({selectedCategories.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(categoryId => {
                const category = categories.find(c => c.id === categoryId);
                return (
                  <span key={categoryId} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {category.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={selectedCategories.length === 0}
        className={`w-full py-4 rounded-lg font-medium transition-colors ${
          selectedCategories.length > 0
            ? 'btn-primary'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue to Order
      </button>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can select multiple categories and add items to each one. 
          We'll group your order by category for better vendor matching.
        </p>
      </div>
    </div>
  );
};

export default CategorySelection;
