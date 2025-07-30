import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, X, Package } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        setCategories(res.data.categories || res.data);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData((prev) => ({
          ...prev,
          imageUrl: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user || user.role !== "vendor") {
      alert("You must be a vendor to add products");
      return;
    }
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      alert("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      imageUrl:
        formData.imageUrl ||
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    };
    try {
      await axios.post("http://localhost:5000/api/products", productData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate("/vendor-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== "vendor") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/60 mb-6">
            You need to be a vendor to add products
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Go to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between p-6 border-b border-white/10"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/vendor-dashboard")}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </motion.button>
        <h1 className="text-2xl font-bold text-white">Add New Product</h1>
        <div className="w-24"></div>
      </motion.div>

      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package size={24} />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="bg-red-500/20 border-red-500/50 text-red-200 mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white">
                      Price ($) *
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat._id}
                            value={cat._id}
                            className="text-white hover:bg-white/10"
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-white">
                      Stock Quantity
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your product in detail..."
                    className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500 min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Product Image</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/20 bg-white/5"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-64 mx-auto rounded-lg"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </motion.button>
                      </div>
                    ) : (
                      <div>
                        <Upload
                          size={48}
                          className="text-white/40 mx-auto mb-4"
                        />
                        <p className="text-white/60 mb-2">
                          Drag and drop an image here, or click to select
                        </p>
                        <p className="text-white/40 text-sm">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/vendor-dashboard")}
                    className="flex-1 bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding Product...
                      </div>
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AddProduct;
