import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateAdminProfile } from '@/store/slices/authSlice';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';

const AdminPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
    // Rehydrate user if missing but authenticated
    useEffect(() => {
      if (!user && isAuthenticated) {
        dispatch(fetchAdminUser());
      }
    }, [user, isAuthenticated, dispatch]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(updateAdminProfile({ ...form, phone: user?.phone ?? '' }) as any);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Admin Profile</h2>
      {!editMode ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="text-slate-900 font-medium">{user.name}</div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="text-slate-900 font-medium">{user.email}</div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <div className="text-slate-900 font-medium">{user.phone}</div>
          </div>
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded px-3 py-2"
              required
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded px-3 py-2"
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={user.phone}
              disabled
              placeholder="Phone Number"
              className="w-full border border-slate-200 rounded px-3 py-2 bg-slate-100 text-slate-500"
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="bg-slate-200 text-slate-900 px-4 py-2 rounded hover:bg-slate-300 transition"
              onClick={() => setEditMode(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminPage;
