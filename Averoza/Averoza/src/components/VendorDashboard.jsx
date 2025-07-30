import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Plus,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Bell,
  Settings,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [store, setStore] = useState(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setUserLoading(false);
  }, []);

  useEffect(() => {
    if (!userLoading) {
      if (!user || user.role !== "vendor") {
        navigate("/");
        return;
      }
      const fetchVendorProducts = async () => {
        setIsLoading(true);
        try {
          // Call the vendor-specific endpoint to get only this vendor's products
          const res = await axios.get(
            "http://localhost:5000/api/vendor/me/products",
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          setProducts(res.data.products || res.data);
        } catch (err) {
          setProducts([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVendorProducts();
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    if (!userLoading && user && user.role === "vendor") {
      // Fetch vendor's store info
      const fetchStore = async () => {
        setStoreLoading(true);
        setStoreError("");
        try {
          const res = await axios.get(
            "http://localhost:5000/api/stores/my-store",
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          setStore(res.data.store);
        } catch (err) {
          setStoreError("Failed to fetch store info");
        } finally {
          setStoreLoading(false);
        }
      };
      fetchStore();
    }
  }, [user, userLoading]);

  // Mock data for vendor stats
  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-600/20",
    },
    {
      title: "Total Orders",
      value: 127,
      icon: ShoppingCart,
      color: "text-green-400",
      bgColor: "bg-green-600/20",
    },
    {
      title: "Monthly Revenue",
      value: "$3,240",
      icon: DollarSign,
      color: "text-purple-400",
      bgColor: "bg-purple-600/20",
    },
    {
      title: "Growth Rate",
      value: "+12.5%",
      icon: TrendingUp,
      color: "text-pink-400",
      bgColor: "bg-pink-600/20",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      product: "Wireless Headphones",
      amount: "$99.99",
      status: "Pending",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      product: "Smart Watch",
      amount: "$199.99",
      status: "Shipped",
      date: "2024-01-14",
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson",
      product: "Bluetooth Speaker",
      amount: "$79.99",
      status: "Delivered",
      date: "2024-01-13",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-600";
      case "Shipped":
        return "bg-blue-600";
      case "Delivered":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  // Helper to get image src from url or buffer
  const getImageSrc = (image) => {
    if (!image) return "/default-image.png";
    if (image.url) return image.url;
    if (image.data && image.contentType) {
      // If image.data is already a base64 string (from backend), use it directly
      if (typeof image.data === "string") {
        // If it looks like base64, use as is
        if (/^[A-Za-z0-9+/=]+$/.test(image.data.slice(0, 24))) {
          return `data:${image.contentType};base64,${image.data}`;
        }
        // If it's not base64, try to convert from JSON array
        try {
          const byteArray =
            typeof image.data === "string"
              ? JSON.parse(image.data)
              : image.data;
          const uint8Array = new Uint8Array(byteArray);
          let binary = "";
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          return `data:${image.contentType};base64,${window.btoa(binary)}`;
        } catch {
          return "/default-image.png";
        }
      }
      // If image.data is an array (from JSON), convert to base64
      if (Array.isArray(image.data)) {
        const uint8Array = new Uint8Array(image.data);
        let binary = "";
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        return `data:${image.contentType};base64,${window.btoa(binary)}`;
      }
    }
    return "/default-image.png";
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${productToDelete}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setProducts(products.filter((p) => p._id !== productToDelete));
      setDeleteSuccess("Product deleted successfully!");
      setTimeout(() => setDeleteSuccess(""), 2000);
    } catch (err) {
      setDeleteSuccess("");
      alert("Failed to delete product");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const openDeleteModal = (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleEditProduct = (productId) => {
    // Placeholder: navigate to edit page or open modal
    // navigate(`/edit-product/${productId}`);
    alert("Edit product functionality coming soon!");
  };

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
            You need to be a vendor to access this page
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between p-6 border-b border-white/10"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Profile
          </motion.button>
          <h1 className="text-2xl font-bold text-white">Vendor Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/vendor-notifications">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <Bell size={20} />
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Only show Edit Store button, remove store info card */}
        <div className="flex justify-end mb-8">
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow"
            onClick={() => navigate("/edit-store")}
          >
            Edit Store
          </Button>
        </div>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.username}!
          </h2>
          <p className="text-white/60">
            Here's what's happening with your store today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm font-medium">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon size={24} className={stat.color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/add-product")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus size={18} className="mr-2" />
                    Add New Product
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white"
                  >
                    <Package size={18} className="mr-2" />
                    Manage Inventory
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    View Orders
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Your Products</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white"
                  onClick={() => navigate("/add-product")}
                >
                  <Plus size={16} className="mr-1" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center gap-4"
                      >
                        <div className="w-16 h-16 bg-white/10 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-white/10 rounded mb-2"></div>
                          <div className="h-3 bg-white/10 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <img
                          src={getImageSrc(product.images && product.images[0])}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">
                            {product.name}
                          </h4>
                          <p className="text-purple-400 font-semibold">
                            ${product.price}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleEditProduct(product._id)}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => openDeleteModal(product._id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package size={48} className="text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">No products yet</p>
                    <Button
                      onClick={() => navigate("/add-product")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Add Your First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {order.id}
                          </span>
                          <Badge
                            className={`${getStatusColor(order.status)} text-white text-xs`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm">
                          {order.customer}
                        </p>
                        <p className="text-white/80 text-sm">{order.product}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-semibold">
                          {order.amount}
                        </p>
                        <p className="text-white/60 text-xs">{order.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      {deleteSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {deleteSuccess}
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Store Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Store</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setEditLoading(true);
              setEditError("");
              setEditSuccess("");
              try {
                let imageUrl = editData.image;
                if (editImageFile) {
                  const formData = new FormData();
                  formData.append("image", editImageFile);
                  // Optionally add other fields if your backend expects them
                  const uploadRes = await axios.post(
                    "http://localhost:5000/api/stores/upload-image",
                    formData,
                    {
                      headers: {
                        Authorization: `Bearer ${user.token}`,
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
                  imageUrl =
                    uploadRes.data.url || uploadRes.data.image || imageUrl;
                }
                const res = await axios.put(
                  "http://localhost:5000/api/stores",
                  {
                    name: editData.name,
                    description: editData.description,
                    image: imageUrl,
                  },
                  { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setStore(res.data);
                setEditSuccess("Store updated successfully!");
                setTimeout(() => setEditOpen(false), 1200);
              } catch (err) {
                setEditError(
                  err.response?.data?.message || "Failed to update store"
                );
              } finally {
                setEditLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="store-name" className="text-white">
                Store Name
              </Label>
              <Input
                id="store-name"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
                required
              />
            </div>
            <div>
              <Label htmlFor="store-description" className="text-white">
                Description
              </Label>
              <Input
                id="store-description"
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
                required
              />
            </div>
            <div>
              <Label htmlFor="store-image" className="text-white">
                Store Image
              </Label>
              <Input
                id="store-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setEditImageFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) =>
                      setEditImagePreview(ev.target.result);
                    reader.readAsDataURL(file);
                  } else {
                    setEditImagePreview("");
                  }
                }}
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
              />
              {editImagePreview && (
                <img
                  src={editImagePreview}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border-2 border-white/20 shadow"
                />
              )}
              {!editImagePreview && editData.image && (
                <img
                  src={getImageSrc(editData.image)}
                  alt="Current"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border-2 border-white/20 shadow"
                />
              )}
            </div>
            {editError && (
              <div className="text-red-400 text-sm">{editError}</div>
            )}
            {editSuccess && (
              <div className="text-green-400 text-sm">{editSuccess}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={editLoading}
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboard;
