import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Cart from "./components/Cart";
import ProductDetails from "./components/ProductDetails";
import Profile from "./components/Profile";
import VendorDashboard from "./components/VendorDashboard";
import AddProduct from "./components/AddProduct";
import OrderHistory from "./components/OrderHistory";
import OrderDetails from "./components/OrderDetails";
import SearchResults from "./components/SearchResults";
import ProtectedRoute from "./components/ProtectedRoute";
import Store from "./components/Store";
import EditStore from "./components/EditStore";
import Checkout from "./components/Checkout";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard";
import CategoryPage from "./components/CategoryPage";
import VendorNotifications from "./components/VendorNotifications";
import MainPage from "./components/MainPage";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/main" element={<MainPage />} />
            {/* Public Routes */}
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/store/:storeId" element={<Store />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/categories" element={<CategoryPage />} />
            {/* Protected Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor-dashboard"
              element={
                <ProtectedRoute>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-product"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-store"
              element={
                <ProtectedRoute>
                  <EditStore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor-notifications"
              element={
                <ProtectedRoute>
                  <VendorNotifications />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
