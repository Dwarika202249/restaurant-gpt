import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchRestaurantProfile,
  updateRestaurantProfile,
  setupRestaurant,
  clearError
} from '@/store/slices/restaurantSlice';
import { Error, Success, Loading } from '@/components';

type PageMode = 'view' | 'edit' | 'setup';

/**
 * Restaurant Profile Page (Placeholder)
 * Allows CRUD operations on restaurant details
 * Will be enhanced with better UI in next iteration
 */
export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { currentRestaurant: restaurant, loading, error } = useAppSelector(
    (state) => state.restaurant
  );

  const [mode, setMode] = useState<PageMode>('view');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    themeColor: '#ff9500',
    currency: 'INR',
    tablesCount: 10
  });

  // Load restaurant profile on mount
  useEffect(() => {
    if (!restaurant) {
      dispatch(fetchRestaurantProfile());
    } else {
      setFormData({
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl || '',
        themeColor: restaurant.themeColor || '#ff9500',
        currency: restaurant.currency || 'INR',
        tablesCount: restaurant.tablesCount || 10
      });
    }
  }, [dispatch, restaurant]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(setupRestaurant(formData) as any);
    if (result.payload) {
      setSuccessMessage('Restaurant created successfully!');
      setMode('view');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const updateData = {
      name: formData.name,
      logoUrl: formData.logoUrl,
      themeColor: formData.themeColor,
      currency: formData.currency,
      tablesCount: formData.tablesCount
    };
    const result = await dispatch(updateRestaurantProfile(updateData) as any);
    if (result.payload) {
      setSuccessMessage('Restaurant updated successfully!');
      setMode('view');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tablesCount' ? parseInt(value) : value
    }));
  };

  if (loading && !restaurant && mode === 'view') {
    return <Loading fullScreen message="Loading restaurant profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Restaurant Profile
        </h1>

        {error && (
          <Error
            message={error}
            onClose={() => dispatch(clearError())}
            className="mb-6"
          />
        )}

        {successMessage && (
          <Success message={successMessage} className="mb-6" />
        )}

        <div className="bg-white rounded-lg shadow p-8">
          {!restaurant && mode === 'view' ? (
            // Setup Mode
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                No restaurant setup yet. Create one to get started.
              </p>
              <button
                onClick={() => setMode('setup')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Create Restaurant
              </button>
            </div>
          ) : mode === 'view' && restaurant ? (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Restaurant Name
                  </label>
                  <p className="text-lg text-gray-900 mt-1">
                    {restaurant.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <p className="text-lg text-gray-900 mt-1">
                    {restaurant.slug}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tables
                  </label>
                  <p className="text-lg text-gray-900 mt-1">
                    {restaurant.tablesCount}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <p className="text-lg text-gray-900 mt-1">
                    {restaurant.currency}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Theme Color
                </label>
                <div className="flex items-center gap-3 mt-2">
                  {/* eslint-disable-next-line react/no-unstable-nested-components */}
                  <div
                    className="w-12 h-12 rounded border"
                    title={`Color: ${restaurant.themeColor || '#ff9500'}`}
                    data-testid="color-preview"
                    style={{ backgroundColor: restaurant.themeColor || '#ff9500' }}
                  />
                  <p className="text-gray-900">{restaurant.themeColor || '#ff9500'}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => {
                    setMode('edit');
                    setFormData({
                      name: restaurant.name,
                      slug: restaurant.slug,
                      logoUrl: restaurant.logoUrl || '',
                      themeColor: restaurant.themeColor || '#ff9500',
                      currency: restaurant.currency || 'INR',
                      tablesCount: restaurant.tablesCount || 10
                    });
                  }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            // Edit/Setup Mode
            <form
              onSubmit={mode === 'setup' ? handleSetupSubmit : handleUpdateSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter restaurant name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {mode === 'setup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL-friendly name) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    placeholder="my-restaurant"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    name="themeColor"
                    title="Select theme color"
                    value={formData.themeColor}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#ff9500"
                    value={formData.themeColor}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    placeholder="INR"
                    disabled={loading}
                    maxLength={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Tables
                  </label>
                  <input
                    type="number"
                    name="tablesCount"
                    placeholder="10"
                    value={formData.tablesCount}
                    onChange={handleInputChange}
                    min="1"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                {mode === 'edit' && (
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    disabled={loading}
                    className="bg-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
