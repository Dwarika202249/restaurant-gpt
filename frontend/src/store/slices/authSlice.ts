import { fetchAdminUser } from "./fetchAdminUser";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import axios from "axios";
import { VITE_API_URL } from '@/config/env';

const API_URL = VITE_API_URL;

// Type definitions
export interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone: string;
  role: "admin" | "customer" | "superadmin";
  restaurantId?: string;
  loyaltyPoints?: number;
  profileComplete?: boolean;
  createdAt?: string;
}

interface AuthError {
  message?: string;
  error?: string;
}

/**
 * Async thunk for sending OTP
 */
export const sendOTP = createAsyncThunk<
  { message: string; otp?: string },
  string,
  { rejectValue: AuthError }
>("auth/sendOTP", async (phone, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/admin/send-otp`, {
      phone,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Failed to send OTP" }
    );
  }
});

/**
 * Async thunk for verifying OTP
 */
export const verifyOTP = createAsyncThunk<
  { accessToken: string; refreshToken: string; user: User },
  { phone: string; otp: string },
  { rejectValue: AuthError }
>("auth/verifyOTP", async ({ phone, otp }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/admin/verify-otp`, {
      phone,
      otp,
    });
    const { accessToken, refreshToken, user } = response.data.data;

    // Store tokens in localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return { accessToken, refreshToken, user };
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Failed to verify OTP" }
    );
  }
});

/**
 * Async thunk for refreshing access token
 */
export const refreshAccessToken = createAsyncThunk<
  { accessToken: string; refreshToken: string },
  string,
  { rejectValue: AuthError }
>("auth/refreshAccessToken", async (refreshToken, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/admin/refresh`, {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // Update tokens in localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Failed to refresh token" }
    );
  }
});

/**
 * Async thunk for SuperAdmin login
 */
export const superAdminLogin = createAsyncThunk<
  { accessToken: string; refreshToken: string; user: User },
  { email: string; password: string },
  { rejectValue: AuthError }
>("auth/superAdminLogin", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/superadmin/login`, {
      email,
      password,
    });
    const { accessToken, refreshToken, user } = response.data.data;

    // Store tokens in localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return { accessToken, refreshToken, user };
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "SuperAdmin login failed" }
    );
  }
});

/**
 * Async thunk for updating admin profile
 */
export const updateAdminProfile = createAsyncThunk<
  { user: User },
  { name: string; email: string; phone: string },
  { rejectValue: AuthError }
>("auth/updateAdminProfile", async (profile, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.put(
      `${API_URL}/auth/admin/profile`,
      profile,
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Failed to update profile" }
    );
  }
});

/**
 * Async thunk for changing SuperAdmin password
 */
export const changeSuperAdminPassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string },
  { rejectValue: AuthError }
>("auth/changeSuperAdminPassword", async (passwords, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.post(
      `${API_URL}/auth/superadmin/change-password`,
      passwords,
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Password update failed" }
    );
  }
});

/**
 * Async thunk for logout
 */
export const logout = createAsyncThunk<null, void, { rejectValue: AuthError }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await axios.post(
          `${API_URL}/auth/admin/logout`,
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return null;
    } catch (error) {
      // Clear tokens even if request fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      const axiosError = error as AxiosError<AuthError>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Logout failed" }
      );
    }
  }
);

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  otpSent: boolean;
  otpPhone: string | null;
  demoOTP: string | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
  otpSent: false,
  otpPhone: null,
  demoOTP: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.otpPhone = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    resetOTPSent: (state) => {
      state.otpSent = false;
      state.otpPhone = null;
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.otpPhone = action.meta.arg; // Store phone number for verification
        // Store demo OTP if returned by backend (development mode)
        if (action.payload.otp) {
          state.demoOTP = action.payload.otp;
        }
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to send OTP";
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.otpPhone = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to verify OTP";
      });

    // Refresh Access Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Session expired";
      });

    // Fetch Admin User (rehydration)
    builder
      .addCase(fetchAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch user";
      });

    // Update Admin Profile
    builder
      .addCase(updateAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update profile";
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // SuperAdmin Login
    builder
      .addCase(superAdminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(superAdminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(superAdminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "SuperAdmin login failed";
      });
  },
});

export const { clearError, resetAuth, resetOTPSent } = authSlice.actions;
export default authSlice.reducer;
