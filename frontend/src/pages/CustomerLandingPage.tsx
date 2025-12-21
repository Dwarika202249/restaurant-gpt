import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { Loading, Error } from '@/components';
import axios from 'axios';

/**
 * Customer Landing Page (QR Scan Entry Point)
 * Route: /r/:restaurantSlug/table/:tableNo
 * 
 * This page:
 * 1. Validates restaurant exists
 * 2. Creates/resumes guest session
 * 3. Loads restaurant theme/branding
 * 4. Redirects to customer menu page
 */
export const CustomerLandingPage = () => {
  const { restaurantSlug, tableNo } = useParams<{
    restaurantSlug: string;
    tableNo: string;
  }>();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const initializeCustomerSession = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!restaurantSlug || !tableNo) {
          setError('Invalid QR code: Missing restaurant or table information');
          return;
        }

        // Parse table number
        const table = parseInt(tableNo, 10);
        if (isNaN(table) || table < 1) {
          setError('Invalid table number');
          return;
        }

        // Step 1: Get restaurant info
        const restaurantResponse = await axios.get(
          `${API_URL}/customer/restaurant/${restaurantSlug}`
        );

        if (!restaurantResponse.data.data) {
          setError('Restaurant not found');
          return;
        }

        const restaurant = restaurantResponse.data.data;
        setRestaurantData(restaurant);

        // Step 2: Create or resume guest session
        const sessionResponse = await axios.post(`${API_URL}/customer/session`, {
          restaurantSlug,
          tableNo: table
        });

        if (!sessionResponse.data.data) {
          setError('Failed to create session');
          return;
        }

        const sessionData = sessionResponse.data.data;

        // Store session data in localStorage
        localStorage.setItem('guestSession', JSON.stringify({
          sessionId: sessionData.sessionId,
          restaurantId: sessionData.restaurantId,
          restaurantSlug,
          tableNo: table,
          sessionToken: sessionData.sessionToken,
          expiresAt: sessionData.expiresAt,
          restaurantName: restaurant.name,
          restaurantLogo: restaurant.logoUrl,
          themeColor: restaurant.themeColor,
          currency: restaurant.currency
        }));

        // Store session token in localStorage
        localStorage.setItem('sessionToken', sessionData.sessionToken);

        // Redirect to customer menu page
        setTimeout(() => {
          navigate(`/customer/${restaurantSlug}/table/${table}`, {
            replace: true
          });
        }, 500);
      } catch (err: any) {
        console.error('Initialize session error:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to initialize session. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeCustomerSession();
  }, [restaurantSlug, tableNo, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center max-w-md">
          <Error message={error} />
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state with branding
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="text-center">
        {restaurantData?.logoUrl && (
          <img
            src={restaurantData.logoUrl}
            alt={restaurantData.name}
            className="h-20 w-20 rounded-full mx-auto mb-4 object-cover shadow-lg"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {restaurantData?.name}
        </h1>
        <p className="text-gray-600 mb-8">Table {tableNo}</p>

        {/* Loading spinner */}
        <div className="flex justify-center mb-6">
          <div
            className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"
          />
        </div>

        <p className="text-sm text-gray-600">Loading your menu...</p>
      </div>
    </div>
  );
};

export default CustomerLandingPage;
