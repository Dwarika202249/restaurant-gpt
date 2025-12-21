import { Outlet } from 'react-router-dom';
import { X, Phone, User } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

interface CustomerLayoutProps {
  restaurantName: string;
  restaurantLogo?: string;
  themeColor: string;
  tableNo: number;
  onLogout: () => void;
  children: React.ReactNode; 
}

/**
 * CustomerLayout Component
 * Wrapper for all customer-facing pages
 * Shows restaurant info, table number, and quick actions
 */
export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  restaurantName,
  restaurantLogo,
  themeColor,
  tableNo,
  onLogout,
  children,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#f9f5f0]">
      {/* Header */}
      <header
        className="bg-white shadow-sm border-b"
        style={{ borderBottom: `2px solid ${themeColor}` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: Restaurant Info */}
          <div className="flex items-center gap-3">
            {restaurantLogo && (
              <img
                src={restaurantLogo}
                alt={restaurantName}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{restaurantName}</h1>
              <p className="text-xs text-gray-600">Table {tableNo}</p>
            </div>
          </div>

          {/* Right: Actions Menu */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open user actions menu"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <User size={20} className="text-gray-700" />
            </button>

            {showActionsMenu && (
              <div className="absolute top-full right-4 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-48">
                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b flex items-center gap-2 text-sm text-gray-700"
                >
                  <Phone size={16} />
                  Login for Loyalty
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                >
                  <X size={16} />
                  Leave Table
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
        {children} {/* <-- Render children here */}
      </main>
    </div>
  );
};

export default CustomerLayout;
