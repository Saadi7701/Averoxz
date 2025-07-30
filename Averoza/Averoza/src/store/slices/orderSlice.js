import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get user orders
export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async ({ page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      
      const response = await axios.get(`${API_URL}/orders/my-orders?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get vendor orders
export const getVendorOrders = createAsyncThunk(
  'orders/getVendorOrders',
  async ({ page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      
      const response = await axios.get(`${API_URL}/orders/vendor/orders?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  'orders/getOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Update order status (vendor/admin)
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, note, trackingNumber }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status,
        note,
        trackingNumber
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Cancel order (customer)
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get order statistics (vendor)
export const getOrderStats = createAsyncThunk(
  'orders/getOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/orders/vendor/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    stats: null,
    totalPages: 0,
    currentPage: 1,
    total: 0,
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get vendor orders
      .addCase(getVendorOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVendorOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(getVendorOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.successMessage = 'Order status updated successfully';
        
        // Update order in orders list if it exists
        const orderIndex = state.orders.findIndex(order => order._id === action.payload._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.successMessage = 'Order cancelled successfully';
        
        // Update order in orders list if it exists
        const orderIndex = state.orders.findIndex(order => order._id === action.payload._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get order stats
      .addCase(getOrderStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getOrderStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;

