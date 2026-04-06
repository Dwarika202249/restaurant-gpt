import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { User } from './authSlice';
import { VITE_API_URL } from '@/config/env';

const API_URL = VITE_API_URL;

export const fetchAdminUser = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: { message?: string } }
>(
  'auth/fetchAdminUser',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/auth/admin/me`, accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data || { message: 'Failed to fetch user' });
    }
  }
);
