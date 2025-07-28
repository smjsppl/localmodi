import React from 'react';
import { Home, Briefcase, MapPin, Edit2, Trash2, Check, Plus } from 'lucide-react';

const AddressList = ({ 
  addresses, 
  onEdit, 
  onDelete, 
  onSetDefault, 
  onAddNew,
  selectedAddressId = null,
  onSelect = null
}) => {
  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home className="h-5 w-5 text-indigo-500" />;
      case 'work':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      default:
        return <MapPin className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAddressTypeLabel = (type) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'work':
        return 'Work';
      default:
        return 'Other';
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses saved</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new address.</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New Address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onSelect && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Select a delivery address</h3>
          <p className="mt-1 text-sm text-gray-500">Choose where you'd like to receive your order.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {addresses.map((address) => (
          <div 
            key={address.id}
            className={`relative border rounded-lg p-4 ${selectedAddressId === address.id ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'} ${onSelect ? 'cursor-pointer' : ''}`}
            onClick={() => onSelect && onSelect(address)}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {getAddressIcon(address.address_type)}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {getAddressTypeLabel(address.address_type)}
                  </p>
                  {address.is_default && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Default
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-600 space-y-1">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  {address.landmark && <p>Near {address.landmark}</p>}
                  <p>
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>
            </div>
            
            {!onSelect && (
              <div className="mt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(address);
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit2 className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(address.id);
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="-ml-0.5 mr-1.5 h-4 w-4 text-red-500" aria-hidden="true" />
                  Remove
                </button>
                {!address.is_default && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetDefault(address.id);
                    }}
                    className="ml-auto inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Check className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                    Set as default
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {onAddNew && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Add New Address
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressList;
