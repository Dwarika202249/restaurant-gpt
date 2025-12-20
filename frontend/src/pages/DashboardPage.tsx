import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { Sidebar, Navbar } from '@/components';
import { TrendingUp, Users, ShoppingCart, Clock } from 'lucide-react';
import { fetchRestaurantProfile } from '@/store/slices/restaurantSlice';

export const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);
  const loading = useAppSelector((state) => state.restaurant.loading);

  // Fetch restaurant profile on mount
  useEffect(() => {
    if (!restaurant && user?.restaurantId) {
      dispatch(fetchRestaurantProfile());
    }
  }, [user?.restaurantId, restaurant, dispatch]);

  // Mock dashboard stats
  const stats = [
    { icon: ShoppingCart, label: 'Today\'s Orders', value: '24', color: 'bg-blue-500' },
    { icon: Users, label: 'Active Customers', value: '156', color: 'bg-green-500' },
    { icon: TrendingUp, label: 'Revenue Today', value: '₹18,450', color: 'bg-purple-500' },
    { icon: Clock, label: 'Avg. Order Time', value: '18 min', color: 'bg-orange-500' },
  ];

  // Mock recent orders
  const recentOrders = [
    { id: 'ORD-001', customer: 'Table 5', amount: '₹850', status: 'Completed', time: '5 min ago' },
    { id: 'ORD-002', customer: 'Table 12', amount: '₹1,200', status: 'In Progress', time: '12 min ago' },
    { id: 'ORD-003', customer: 'Table 3', amount: '₹650', status: 'Pending', time: '8 min ago' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back! 👋</h1>
            <p className="text-slate-600 mt-2">{restaurant?.name} • {restaurant?.slug}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-600">{stat.label}</h3>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-2">+12% from yesterday</p>
                </div>
              );
            })}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Order ID</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Customer</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Amount</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                        <td className="px-6 py-4 text-slate-700">{order.customer}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{order.amount}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{order.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 text-center">
                <a href="/orders" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  View all orders →
                </a>
              </div>
            </div>

            {/* Restaurant Quick Stats */}
            <div className="space-y-6">
              {/* Restaurant Info Card */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Restaurant Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Name</p>
                    <p className="text-slate-900 font-medium">{restaurant?.name || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Tables</p>
                    <p className="text-slate-900 font-medium">{restaurant?.tablesCount || 0} Tables</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Currency</p>
                    <p className="text-slate-900 font-medium">{restaurant?.currency || 'INR'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Theme Color</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                      <div
                        className="w-6 h-6 rounded"
                        title={`Theme: ${restaurant?.themeColor || '#ff9500'}`}
                        data-testid="theme-color"
                        style={{ backgroundColor: restaurant?.themeColor || '#ff9500' }}
                      ></div>
                      <p className="text-slate-900 font-mono text-sm">{restaurant?.themeColor || '#ff9500'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <a
                    href="/menu"
                    className="block w-full px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors text-center"
                  >
                    Manage Menu
                  </a>
                  <a
                    href="/profile"
                    className="block w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors text-center"
                  >
                    Edit Settings
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Placeholder for pages not yet implemented */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">Loading dashboard...</div>
        </div>
      )}
    </div>
  );
};
