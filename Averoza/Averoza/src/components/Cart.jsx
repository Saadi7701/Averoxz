import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setUserLoading(false);
  }, []);

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const cartItems = res.data.cartItems || res.data.items || [];
        setItems(Array.isArray(cartItems) ? cartItems : []);
        setTotalItems(
          Array.isArray(cartItems)
            ? cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
            : 0
        );
        setTotalPrice(
          Array.isArray(cartItems)
            ? cartItems.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
              )
            : 0
        );
        // Initialize quantities
        const initialQuantities = {};
        if (Array.isArray(cartItems)) {
          cartItems.forEach((item) => {
            initialQuantities[item.product._id] = item.quantity;
          });
        }
        setQuantities(initialQuantities);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch cart");
      } finally {
        setIsLoading(false);
      }
    };
    if (!userLoading && user) fetchCart();
  }, [user, userLoading]);

  // Success/error message timeouts
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
          <CardContent className="text-center p-8">
            <ShoppingCart className="w-16 h-16 text-white/60 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Sign in to view your cart
            </h2>
            <p className="text-white/60 mb-6">
              You need to be logged in to access your shopping cart.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/signup")}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
    try {
      await axios.put(
        `http://localhost:5000/api/cart/update`,
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccessMessage("Cart updated");
      const updatedItems = items.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      setItems(updatedItems);
      setTotalItems(
        Array.isArray(updatedItems)
          ? updatedItems.reduce(
              (acc, item) =>
                acc +
                (item.product._id === productId ? newQuantity : item.quantity),
              0
            )
          : 0
      );
      setTotalPrice(
        Array.isArray(updatedItems)
          ? updatedItems.reduce(
              (acc, item) =>
                acc +
                (item.product._id === productId
                  ? item.price * newQuantity
                  : item.price * item.quantity),
              0
            )
          : 0
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update cart");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccessMessage("Item removed from cart");
      const filteredItems = items.filter(
        (item) => item.product._id !== productId
      );
      setItems(filteredItems);
      setTotalItems(
        Array.isArray(filteredItems)
          ? filteredItems.reduce((acc, item) => acc + item.quantity, 0)
          : 0
      );
      setTotalPrice(
        Array.isArray(filteredItems)
          ? filteredItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0
            )
          : 0
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await axios.delete("http://localhost:5000/api/cart/clear", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage("Cart cleared");
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to clear cart");
      }
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" />
                Shopping Cart
              </h1>
              <p className="text-white/60">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Alert className="bg-green-500/20 border-green-500/50 text-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {Array.isArray(items) && items.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md mx-auto">
              <CardContent className="p-8">
                <ShoppingBag className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Your cart is empty
                </h2>
                <p className="text-white/60 mb-6">
                  Start shopping to add items to your cart.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {Array.isArray(items) &&
                items.map((item, index) => (
                  <motion.div
                    key={item.product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.product.images &&
                            item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="w-8 h-8 text-white/60" />
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Link
                                  to={`/product/${item.product._id}`}
                                  className="text-white font-semibold hover:text-purple-300 transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                                <p className="text-white/60 text-sm">
                                  by {item.product.vendor?.username}
                                </p>
                                {item.product.store && (
                                  <Badge
                                    variant="outline"
                                    className="mt-1 border-white/20 text-white/80"
                                  >
                                    {item.product.store.name}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveItem(item.product._id)
                                }
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.product._id,
                                      quantities[item.product._id] - 1
                                    )
                                  }
                                  disabled={quantities[item.product._id] <= 1}
                                  className="w-8 h-8 p-0 border-white/20 text-white hover:bg-white/10"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={
                                    quantities[item.product._id] ||
                                    item.quantity
                                  }
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.product._id,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-16 text-center bg-white/10 border-white/20 text-white"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.product._id,
                                      quantities[item.product._id] + 1
                                    )
                                  }
                                  className="w-8 h-8 p-0 border-white/20 text-white hover:bg-white/10"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="text-white font-semibold">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-white/60 text-sm">
                                  ${item.price.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between text-white font-semibold text-lg">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Proceed to Checkout"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
