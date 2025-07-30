import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Search products
export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async ({ query, category, minPrice, maxPrice, sortBy, page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', limit);
      
      const response = await axios.get(`${API_URL}/products/search?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get products by category
export const getProductsByCategory = createAsyncThunk(
  'search/getProductsByCategory',
  async ({ categoryId, page = 1, limit = 12, sortBy }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (sortBy) params.append('sortBy', sortBy);
      
      const response = await axios.get(`${API_URL}/products/category/${categoryId}?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get categories
export const getCategories = createAsyncThunk(
  'search/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get category hierarchy
export const getCategoryHierarchy = createAsyncThunk(
  'search/getCategoryHierarchy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/categories/hierarchy`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get search suggestions
export const getSearchSuggestions = createAsyncThunk(
  'search/getSearchSuggestions',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/suggestions?q=${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    // Search results
    products: [],
    totalPages: 0,
    currentPage: 1,
    total: 0,
    
    // Categories
    categories: [],
    categoryHierarchy: [],
    
    // Search state
    currentQuery: '',
    currentCategory: null,
    currentFilters: {
      minPrice: '',
      maxPrice: '',
      sortBy: 'relevance'
    },
    
    // Suggestions
    suggestions: [],
    
    // Loading states
    isLoading: false,
    isLoadingSuggestions: false,
    
    // Error handling
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentQuery: (state, action) => {
      state.currentQuery = action.payload;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    setCurrentFilters: (state, action) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },
    clearSearchResults: (state) => {
      state.products = [];
      state.totalPages = 0;
      state.currentPage = 1;
      state.total = 0;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get products by category
      .addCase(getProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get categories
      .addCase(getCategories.pending, (state) => {
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Get category hierarchy
      .addCase(getCategoryHierarchy.pending, (state) => {
        state.error = null;
      })
      .addCase(getCategoryHierarchy.fulfilled, (state, action) => {
        state.categoryHierarchy = action.payload;
      })
      .addCase(getCategoryHierarchy.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Get search suggestions
      .addCase(getSearchSuggestions.pending, (state) => {
        state.isLoadingSuggestions = true;
      })
      .addCase(getSearchSuggestions.fulfilled, (state, action) => {
        state.isLoadingSuggestions = false;
        state.suggestions = action.payload;
      })
      .addCase(getSearchSuggestions.rejected, (state, action) => {
        state.isLoadingSuggestions = false;
        state.suggestions = [];
      });
  },
});

export const { 
  clearError, 
  setCurrentQuery, 
  setCurrentCategory, 
  setCurrentFilters, 
  clearSearchResults, 
  clearSuggestions 
} = searchSlice.actions;

export default searchSlice.reducer;

