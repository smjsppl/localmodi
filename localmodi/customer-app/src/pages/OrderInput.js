import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Camera, Type, Send } from 'lucide-react';

const OrderInput = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = () => {
    if (inputText.trim()) {
      // Store order data and navigate to review
      const orderData = {
        category,
        input: inputText,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
      navigate('/review');
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    // Voice input implementation would go here
    setTimeout(() => {
      setIsListening(false);
      setInputText("Sample voice input: I need 2 bottles of Coca Cola 1 liter each");
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
          {category} Order
        </h1>
        <p className="text-gray-600">
          Tell us what you need in this category
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Methods */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={startVoiceInput}
            className={`card p-4 text-center transition-all ${
              isListening ? 'bg-red-50 border-red-200' : 'hover:shadow-md'
            }`}
          >
            <Mic className={`w-6 h-6 mx-auto mb-2 ${
              isListening ? 'text-red-600' : 'text-gray-600'
            }`} />
            <span className="text-xs text-gray-700">
              {isListening ? 'Listening...' : 'Voice'}
            </span>
          </button>

          <button className="card p-4 text-center hover:shadow-md">
            <Camera className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-xs text-gray-700">Photo</span>
          </button>

          <button className="card p-4 text-center hover:shadow-md bg-blue-50 border-blue-200">
            <Type className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <span className="text-xs text-blue-700">Type</span>
          </button>
        </div>

        {/* Text Input */}
        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Describe what you need in ${category}...`}
            className="w-full p-4 border border-gray-200 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              inputText.trim()
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>Process Order</span>
          </button>
        </div>

        {/* Example */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Example:</strong>
          </p>
          <p className="text-sm text-gray-600 italic">
            "I need 2 bottles of Coca Cola 1 liter each, and 1 pack of Lays chips"
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderInput;
