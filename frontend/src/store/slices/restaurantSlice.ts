import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import axios from "axios";
import type { RootState } from "../store";
import { logout, verifyFirebaseToken, verifyOTP } from "./authSlice";
import { VITE_API_URL } from "@/config/env";

const API_URL = VITE_API_URL;

// Type definitions
export interface Restaurant {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  ownerId?: string;
  logoUrl?: string;
  themeColor?: string;
  currency?: string;
  tablesCount?: number;
  autoPilot?: boolean;
  isActive?: boolean;
  isPremium?: boolean;
  subscriptionExpiresAt?: string;
  trialActivatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  loyaltySettings?: {
    enabled: boolean;
    earnRate: number;
    redeemRate: number;
    minPointsToRedeem: number;
    maxRedemptionPercentage: number;
  };
}

interface RestaurantError {
  message?: string;
  error?: string;
}

/**
 * Async thunk for fetching restaurant profile
 */
export const fetchRestaurantProfile = createAsyncThunk<
  Restaurant,
  void,
  { rejectValue: RestaurantError; state: RootState }
>("restaurant/fetchProfile", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const accessToken = (state as any).auth.accessToken;
    const response = await axios.get(`${API_URL}/restaurant/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<RestaurantError>;
    return rejectWithValue(
      axiosError.response?.data || {
        message: "Failed to fetch restaurant profile",
      },
    );
  }
});

/**
 * Async thunk for updating restaurant profile
 */
export const updateRestaurantProfile = createAsyncThunk<
  Restaurant,
  Partial<Restaurant> & { loyaltyEnabled?: boolean },
  { rejectValue: RestaurantError; state: RootState }
>(
  "restaurant/updateProfile",
  async (updates, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const accessToken = (state as any).auth.accessToken;
      const response = await axios.put(
        `${API_URL}/restaurant/profile`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<RestaurantError>;
      return rejectWithValue(
        axiosError.response?.data || {
          message: "Failed to update restaurant profile",
        },
      );
    }
  },
);

/**
 * Async thunk for setting up a new restaurant
 */
export const setupRestaurant = createAsyncThunk<
  Restaurant,
  {
    name: string;
    slug: string;
    tablesCount?: number;
    currency?: string;
    themeColor?: string;
  },
  { rejectValue: RestaurantError; state: RootState }
>("restaurant/setup", async (restaurantData, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const accessToken = (state as any).auth.accessToken;
    const response = await axios.post(
      `${API_URL}/restaurant/setup`,
      restaurantData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<RestaurantError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Failed to setup restaurant" },
    );
  }
});

/**
 * Async thunk for deleting restaurant
 */
export const deleteRestaurant = createAsyncThunk<
  null,
  string,
  { rejectValue: RestaurantError; state: RootState }
>("restaurant/delete", async (restaurantId, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const accessToken = (state as any).auth.accessToken;
    await axios.delete(`${API_URL}/restaurant/${restaurantId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return null;
  } catch (error) {
    const axiosError = error as AxiosError<RestaurantError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Failed to delete restaurant" },
    );
  }
});

/**
 * Async thunk for upgrading to premium (mock payment)
 */
export const upgradeToPremium = createAsyncThunk<
  Restaurant,
  void,
  { rejectValue: RestaurantError; state: RootState }
>("restaurant/upgradePremium", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const accessToken = (state as any).auth.accessToken;
    const response = await axios.post(
      `${API_URL}/subscription/upgrade`,
      { plan: "premium" },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<RestaurantError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Failed to upgrade to premium" },
    );
  }
});

/**
 * Async thunk for fetching restaurant by slug (public)
 */
export const fetchRestaurantBySlug = createAsyncThunk<
  Restaurant,
  string,
  { rejectValue: RestaurantError }
>("restaurant/fetchBySlug", async (slug, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/restaurant/public/${slug}`);
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<RestaurantError>;
    return rejectWithValue(
      axiosError.response?.data || { message: "Restaurant not found" },
    );
  }
});

interface RestaurantState {
  currentRestaurant: Restaurant | null;
  publicRestaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: RestaurantState = {
  currentRestaurant: null, // Currently authenticated admin's restaurant
  publicRestaurant: null, // Public restaurant data (for customer)
  loading: false,
  error: null,
  lastFetched: null,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRestaurant: (state) => {
      state.currentRestaurant = null;
      state.publicRestaurant = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Restaurant Profile
    builder
      .addCase(fetchRestaurantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchRestaurantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch restaurant profile";
      });

    // Update Restaurant Profile
    builder
      .addCase(updateRestaurantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRestaurantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
      })
      .addCase(updateRestaurantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update restaurant profile";
      });

    // Setup Restaurant
    builder
      .addCase(setupRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setupRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
      })
      .addCase(setupRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to setup restaurant";
      });

    // Delete Restaurant
    builder
      .addCase(deleteRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRestaurant.fulfilled, (state) => {
        state.loading = false;
        state.currentRestaurant = null;
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete restaurant";
      });

    // Upgrade to Premium
    builder
      .addCase(upgradeToPremium.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upgradeToPremium.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
      })
      .addCase(upgradeToPremium.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to upgrade to premium";
      });

    // Fetch Restaurant by Slug
    builder
      .addCase(fetchRestaurantBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.publicRestaurant = action.payload;
      })
      .addCase(fetchRestaurantBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Restaurant not found";
      });

    // Reset on Logout or New Login Exchange
    builder.addMatcher(
      (action) =>
        [
          logout.fulfilled.type,
          logout.rejected.type,
          verifyOTP.pending.type,
          verifyFirebaseToken.pending.type,
        ].includes(action.type),
      (state) => {
        state.currentRestaurant = null;
        state.error = null;
        state.lastFetched = null;
      },
    );
  },
});

export const { clearError, resetRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
