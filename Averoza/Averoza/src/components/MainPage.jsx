import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Buffer } from "buffer";
import axios from "axios";
// import { fetchProducts } from "../store/slices/productSlice";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Star, Heart } from "lucide-react";
import SearchBar from "./SearchBar";
import { Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import BannerSection from "./BannerSection"; // Ensure this path is correct
window.Buffer = Buffer;

const featuredProducts = [
  {
    title: "Elegant Evening Wear",
    subtitle: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Sharp Business Attire",
    subtitle: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Casual Street Style",
    subtitle: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Luxury Handbags",
    subtitle: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
  },
];

const MainPage = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState("");

  // Fetch user info from localStorage or API
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch cart items count
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setTotalItems(0);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/cart`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const items = res.data.cartItems || res.data.items || [];
        const count = items.reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        );
        setTotalItems(count);
      } catch (err) {
        setTotalItems(0);
      }
    };
    fetchCart();
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data.products || res.data); // match your controller response
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // Fetch all stores for the store directory
    const fetchStores = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stores");
        setStores(res.data.stores || res.data);
        setStoresLoading(false);
      } catch (err) {
        setStoresError("Failed to fetch stores");
        setStoresLoading(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY < 40) setShowNavbar(true);
      else setShowNavbar(false);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/cart/add`,
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTotalItems((prev) => prev + 1);
      setSuccessMessage("Product successfully added to cart!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: showNavbar ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-lg border-b border-white/10"
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-white text-xl font-bold cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <span className="text-white text-xl font-bold">Averoxz</span>
              </div>
            </motion.div>
            <div className="hidden md:flex gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => navigate("/")}
              >
                Home
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => navigate("/search")}
              >
                Explore
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => navigate("/signup?type=vendor")}
              >
                Vendors
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => {}}
              >
                Deals
              </motion.button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="relative p-2 text-white/80 hover:text-white"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500">
                  {totalItems}
                </Badge>
              )}
            </motion.button>
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                onClick={() => navigate("/profile")}
              >
                Profile
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="bg-transparent text-white hover:bg-white/10 border-white/20"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/signup")}
                  className="bg-white/10 text-white hover:bg-white/20"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.nav>
      {/* Banner Section */}
      <BannerSection />
      {/* Featured Categories */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="px-6 py-12"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Featured Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => navigate("/search")}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-semibold text-lg">
                        {category.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {category.subtitle}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Latest Products */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="px-6 py-12"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Latest Products
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white/10 rounded-lg h-64 mb-4"></div>
                  <div className="bg-white/10 rounded h-4 mb-2"></div>
                  <div className="bg-white/10 rounded h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden group">
                    <div className="relative">
                      <div className="w-full h-48 bg-white/20 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-white/60 text-center">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">No Image</p>
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-2 right-2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                      >
                        <Heart size={16} />
                      </motion.button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-purple-400 font-bold text-lg">
                          ${product.price}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star
                            size={14}
                            className="text-yellow-400 fill-current"
                          />
                          <span className="text-white/80 text-sm">4.5</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          View Details
                        </Button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(product)}
                          className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-colors"
                        >
                          <ShoppingCart size={16} />
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Products Yet
              </h3>
              <p className="text-white/60 mb-6">
                Be the first vendor to add products to our marketplace!
              </p>
              <Button
                onClick={() => navigate("/signup?type=vendor")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Become a Vendor
              </Button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Store Directory */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="px-6 py-12"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Explore Stores
          </h2>
          {storesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white/10 rounded-lg h-32 mb-4"></div>
                  <div className="bg-white/10 rounded h-4 mb-2"></div>
                  <div className="bg-white/10 rounded h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : storesError ? (
            <div className="text-center text-red-400">{storesError}</div>
          ) : stores.length === 0 ? (
            <div className="text-center text-white/60">No stores found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stores.map((store, index) => {
                const imageBuffer =
                  store.image && store.image.data ? store.image.data : null;
                const base64String = imageBuffer
                  ? Buffer.from(imageBuffer).toString("base64")
                  : null;

                return (
                  <motion.div
                    key={store._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                  >
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
                      <div className="relative h-32 flex items-center justify-center overflow-hidden">
                        <Avatar className="w-24 h-24 mx-auto rounded-full border-4 border-white/20 shadow-lg">
                          <img
                            src={
                              base64String
                                ? `data:image/jpeg;base64,${base64String}`
                                : "https://ui-avatars.com/api/?name=" +
                                  encodeURIComponent(store.name)
                            }
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                        </Avatar>
                      </div>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {store.name}
                        </h3>
                        <p className="text-white/60 text-sm mb-3 line-clamp-2">
                          {store.description}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white"
                          onClick={() => navigate(`/store/${store._id}`)}
                        >
                          Visit Store
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 mt-12 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Averoxz</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Your trusted multi-vendor marketplace for quality products from
              verified sellers worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/search")}
                  className="hover:text-white transition-colors"
                >
                  Explore
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/cart")}
                  className="hover:text-white transition-colors"
                >
                  Cart
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/orders")}
                  className="hover:text-white transition-colors"
                >
                  Orders
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              For Vendors
            </h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <button
                  onClick={() => navigate("/signup?type=vendor")}
                  className="hover:text-white transition-colors"
                >
                  Sell on Averoxz
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/vendor-dashboard")}
                  className="hover:text-white transition-colors"
                >
                  Vendor Dashboard
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Vendor Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Resources
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-white/40 text-sm mt-8 pt-8 border-t border-white/10">
          © {new Date().getFullYear()} Averoxz. All rights reserved.
        </div>
      </footer>
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default MainPage;
