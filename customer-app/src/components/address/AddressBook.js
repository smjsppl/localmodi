import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddressList from './AddressList';
import AddressForm from './AddressForm';

const AddressBook = ({ isModal = false, onSelectAddress = null, onClose = null }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Fetch addresses from the API
  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/customer/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data);
      
      // Set the default address as selected if in selection mode
      if (onSelectAddress) {
        const defaultAddress = response.data.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (response.data.length > 0) {
          setSelectedAddressId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  // Load addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Handle address creation
  const handleCreateAddress = async (addressData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/customer/addresses', addressData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Address added successfully');
      setShowForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  };

  // Handle address update
  const handleUpdateAddress = async (addressData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/customer/addresses/${editingAddress.id}`, addressData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Address updated successfully');
      setShowForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (data) => {
    if (editingAddress) {
      await handleUpdateAddress(data);
    } else {
      await handleCreateAddress(data);
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/customer/addresses/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Address deleted successfully');
        fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      }
    }
  };

  // Handle setting default address
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/customer/addresses/${addressId}/set-default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  // Handle address selection
  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    if (isModal && onClose) {
      onClose();
    }
  };

  // Handle edit button click
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  // Render loading state
  if (isLoading && !showForm) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Render the address form
  if (showForm) {
    return (
      <div className={`${isModal ? 'p-4' : 'bg-white shadow rounded-lg p-6'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          {isModal && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <AddressForm
          address={editingAddress}
          onSave={handleSubmit}
          onCancel={handleCancel}
          isEditing={!!editingAddress}
        />
      </div>
    );
  }

  // Render the address list
  return (
    <div className={isModal ? '' : 'bg-white shadow rounded-lg p-6'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {isModal ? 'Select Delivery Address' : 'My Addresses'}
        </h2>
        {!isModal && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New Address
          </button>
        )}
      </div>

      <AddressList
        addresses={addresses}
        onEdit={handleEditAddress}
        onDelete={handleDeleteAddress}
        onSetDefault={handleSetDefaultAddress}
        onAddNew={() => setShowForm(true)}
        selectedAddressId={selectedAddressId}
        onSelect={isModal ? handleSelectAddress : null}
      />

      {isModal && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const selected = addresses.find(addr => addr.id === selectedAddressId);
              if (selected && onSelectAddress) {
                onSelectAddress(selected);
              }
              if (onClose) onClose();
            }}
            disabled={!selectedAddressId}
            className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedAddressId
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                : 'bg-indigo-300 cursor-not-allowed'
            }`}
          >
            Deliver to this address
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
