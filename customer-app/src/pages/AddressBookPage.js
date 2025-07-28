import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AddressBook from '../components/address/AddressBook';

const AddressBookPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h1 className="text-lg leading-6 font-medium text-gray-900">My Addresses</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your saved delivery addresses
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <AddressBook />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressBookPage;
