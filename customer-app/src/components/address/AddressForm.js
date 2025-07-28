import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Home, Briefcase, MapPin } from 'lucide-react';
import axios from 'axios';

const AddressForm = ({ address, onSave, onCancel, isEditing = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPincodeValid, setIsPincodeValid] = useState(false);
  const [pincodeData, setPincodeData] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    defaultValues: address || {
      address_line1: '',
      address_line2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      address_type: 'home',
      is_default: false
    }
  });

  const pincode = watch('pincode');

  // Auto-fill city and state when pincode changes
  useEffect(() => {
    const fetchPincodeData = async () => {
      if (pincode && pincode.length === 6) {
        try {
          const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
          if (response.data && response.data[0].Status === 'Success') {
            const postOffice = response.data[0].PostOffice[0];
            setPincodeData({
              city: postOffice.District,
              state: postOffice.State
            });
            setValue('city', postOffice.District);
            setValue('state', postOffice.State);
            setIsPincodeValid(true);
          } else {
            setIsPincodeValid(false);
          }
        } catch (error) {
          console.error('Error fetching pincode data:', error);
          setIsPincodeValid(false);
        }
      } else if (pincode && pincode.length !== 6) {
        setIsPincodeValid(false);
      }
    };

    const timer = setTimeout(fetchPincodeData, 500);
    return () => clearTimeout(timer);
  }, [pincode, setValue]);

  const onSubmit = async (data) => {
    if (!isPincodeValid) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(data);
      if (!isEditing) {
        reset(); // Reset form after successful submission for new addresses
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address Type</label>
          <div className="mt-1 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-indigo-600"
                value="home"
                {...register('address_type')}
              />
              <span className="ml-2 flex items-center">
                <Home className="h-4 w-4 mr-1" /> Home
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-indigo-600"
                value="work"
                {...register('address_type')}
              />
              <span className="ml-2 flex items-center">
                <Briefcase className="h-4 w-4 mr-1" /> Work
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-indigo-600"
                value="other"
                {...register('address_type')}
              />
              <span className="ml-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> Other
              </span>
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
            Address Line 1 *
          </label>
          <input
            type="text"
            id="address_line1"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.address_line1 ? 'border-red-500' : ''
            }`}
            {...register('address_line1', { required: 'Address line 1 is required' })}
          />
          {errors.address_line1 && (
            <p className="mt-1 text-sm text-red-600">{errors.address_line1.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
            Address Line 2
          </label>
          <input
            type="text"
            id="address_line2"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('address_line2')}
          />
        </div>

        <div>
          <label htmlFor="landmark" className="block text-sm font-medium text-gray-700">
            Landmark
          </label>
          <input
            type="text"
            id="landmark"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('landmark')}
          />
        </div>

        <div>
          <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
            PIN Code *
          </label>
          <input
            type="text"
            id="pincode"
            maxLength="6"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.pincode || (pincode && !isPincodeValid) ? 'border-red-500' : ''
            }`}
            {...register('pincode', {
              required: 'PIN code is required',
              pattern: {
                value: /^[1-9][0-9]{5}$/,
                message: 'Please enter a valid 6-digit PIN code'
              }
            })}
          />
          {errors.pincode && (
            <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
          )}
          {pincode && !isPincodeValid && pincode.length === 6 && !errors.pincode && (
            <p className="mt-1 text-sm text-yellow-600">Verifying PIN code...</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            type="text"
            id="city"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.city ? 'border-red-500' : ''
            }`}
            {...register('city', { required: 'City is required' })}
            readOnly={!!pincodeData}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State *
          </label>
          <input
            type="text"
            id="state"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.state ? 'border-red-500' : ''
            }`}
            {...register('state', { required: 'State is required' })}
            readOnly={!!pincodeData}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_default"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            {...register('is_default')}
          />
          <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
            Set as default address
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading || !isPincodeValid}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : isEditing ? (
            'Update Address'
          ) : (
            'Add Address'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
