import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateAdminProfile } from '@/store/slices/authSlice';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';

interface AdminProfileFormProps {
  onComplete?: () => void;
}

export const AdminProfileForm: React.FC<AdminProfileFormProps> = ({ onComplete }) => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dispatch(updateAdminProfile({ ...form, phone: user?.phone || '' }) as any);
      // Refetch user to get updated profileComplete flag
      const res = await dispatch(fetchAdminUser() as any);
      const updatedUser = res?.payload?.user;
      if (updatedUser?.profileComplete && onComplete) {
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow max-w-md mx-auto mt-10">
      <h2 className="text-lg font-semibold mb-4">Complete Admin Profile</h2>
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
          value={user?.phone || ''}
          disabled
          className="w-full border border-slate-200 rounded px-3 py-2 bg-slate-100 text-slate-500"
          placeholder="Phone number"
        />
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};
