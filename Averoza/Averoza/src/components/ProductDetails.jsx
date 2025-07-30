import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Heart, Star, Share2 } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [addToCartError, setAddToCartError] = useState("");
  const [addToCartSuccess, setAddToCartSuccess] = useState("");

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setCurrentProduct(res.data.product || res.data);
      } catch (err) {
        setCurrentProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/cart/add`,
        { productId: currentProduct._id, quantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAddToCartError("");
      setAddToCartSuccess("Product successfully added to cart!");
      setTimeout(() => setAddToCartSuccess(""), 2000);
      return true;
    } catch (error) {
      setAddToCartError("Failed to add product to cart. Please try again.");
      return false;
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      navigate("/cart");
    }
    // else, error message is shown
  };

  // Helper to get image src from url or buffer
  const getImageSrc = (image) => {
    if (!image) return "/default-image.png";
    if (image.url) return image.url;
    if (image.data && image.contentType) {
      // image.data may be base64 or Buffer (handle both)
      const base64 =
        typeof image.data === "string"
          ? image.data
          : Buffer.from(image.data).toString("base64");
      return `data:${image.contentType};base64,${base64}`;
    }
    return "/default-image.png";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Product not found
          </h2>
          <Button
            onClick={() => navigate("/")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const productImages =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images.map(getImageSrc)
      : [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
        ];

  const relatedProducts = [
    {
      id: 1,
      name: "Similar Product 1",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      name: "Similar Product 2",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      name: "Similar Product 3",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between p-6 border-b border-white/10"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>
        <h1 className="text-xl font-bold text-white">Product Details</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-white/80 hover:text-white transition-colors"
        >
          <Share2 size={20} />
        </motion.button>
      </motion.div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/10">
              <img
                src={productImages[selectedImageIndex]}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-colors ${
                  isWishlisted
                    ? "bg-red-500/80 text-white"
                    : "bg-white/20 text-white/80 hover:text-white"
                }`}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </motion.button>
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-purple-500"
                        : "border-white/20"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {currentProduct.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${i < 4 ? "text-yellow-400 fill-current" : "text-white/30"}`}
                    />
                  ))}
                  <span className="text-white/60 text-sm ml-2">
                    (4.0) • 127 reviews
                  </span>
                </div>
              </div>
              <p className="text-white/80 text-lg leading-relaxed">
                {currentProduct.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-purple-400">
                ${currentProduct.price}
              </span>
              <Badge variant="secondary" className="bg-green-600 text-white">
                In Stock
              </Badge>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-white font-medium">Quantity</label>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  -
                </motion.button>
                <span className="text-white font-semibold text-lg w-12 text-center">
                  {quantity}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold"
                >
                  Buy Now
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white py-3 rounded-xl font-semibold"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </Button>
              </motion.div>
            </div>

            {/* Product Details */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3">
                  Product Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Category</span>
                    <span className="text-white">
                      {typeof currentProduct.category === "object" &&
                      currentProduct.category !== null
                        ? currentProduct.category.name || "General"
                        : currentProduct.category || "General"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Brand</span>
                    <span className="text-white">
                      {currentProduct.brand || "Averoxz"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">SKU</span>
                    <span className="text-white">
                      {currentProduct._id?.slice(-8) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Vendor</span>
                    <span className="text-white">
                      {currentProduct.vendor?.username || "Averoxz Store"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {addToCartError && (
              <div className="text-red-400 text-center mb-4">
                {addToCartError}
              </div>
            )}
            {addToCartSuccess && (
              <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
                {addToCartSuccess}
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                viewport={{ once: true }}
                className="cursor-pointer"
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold mb-2">
                      {product.name}
                    </h3>
                    <p className="text-purple-400 font-bold text-lg">
                      ${product.price}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ProductDetails;
