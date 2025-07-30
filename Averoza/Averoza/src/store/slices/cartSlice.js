import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get cart
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart/add`, {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Update cart item
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/cart/update`, {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/clear`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get cart count
export const getCartCount = createAsyncThunk(
  'cart/getCartCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cart/count`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Validate cart
export const validateCart = createAsyncThunk(
  'cart/validateCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart/validate`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    error: null,
    successMessage: null,
    validationErrors: [],
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearValidationErrors: (state) => {
      state.validationErrors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get cart
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.cart.items || [];
        state.totalItems = action.payload.cart.totalItems || 0;
        state.totalPrice = action.payload.cart.totalPrice || 0;
        state.successMessage = action.payload.message;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.cart.items || [];
        state.totalItems = action.payload.cart.totalItems || 0;
        state.totalPrice = action.payload.cart.totalPrice || 0;
        state.successMessage = action.payload.message;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.cart.items || [];
        state.totalItems = action.payload.cart.totalItems || 0;
        state.totalPrice = action.payload.cart.totalPrice || 0;
        state.successMessage = action.payload.message;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.successMessage = action.payload.message;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get cart count
      .addCase(getCartCount.fulfilled, (state, action) => {
        state.totalItems = action.payload.count;
      })
      // Validate cart
      .addCase(validateCart.pending, (state) => {
        state.isLoading = true;
        state.validationErrors = [];
      })
      .addCase(validateCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.isValid) {
          state.validationErrors = action.payload.errors;
        }
        if (action.payload.cart) {
          state.cart = action.payload.cart;
          state.items = action.payload.cart.items || [];
          state.totalItems = action.payload.cart.totalItems || 0;
          state.totalPrice = action.payload.cart.totalPrice || 0;
        }
      })
      .addCase(validateCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearValidationErrors } = cartSlice.actions;
export default cartSlice.reducer;

