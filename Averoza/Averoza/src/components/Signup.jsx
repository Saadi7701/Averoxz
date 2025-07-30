import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Store,
  Phone,
  MapPin,
} from "lucide-react";

const Signup = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedRole = queryParams.get("role") || "customer";

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: preselectedRole,
    vendorInfo: {
      storeName: "",
      storeDescription: "",
      businessAddress: "",
      phoneNumber: "",
      storeImage: "",
    },
    customerInfo: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear error on unmount
    return () => {
      setError("");
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("vendor.")) {
      const vendorField = name.split(".")[1];
      setFormData({
        ...formData,
        vendorInfo: {
          ...formData.vendorInfo,
          [vendorField]: value,
        },
      });
    } else if (name.startsWith("customer.")) {
      const customerField = name.split(".")[1];
      setFormData({
        ...formData,
        customerInfo: {
          ...formData.customerInfo,
          [customerField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    if (name === "confirmPassword" || name === "password") {
      setPasswordError("");
    }
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.role === "vendor") {
      if (
        !formData.vendorInfo.storeName ||
        !formData.vendorInfo.storeDescription ||
        !formData.vendorInfo.businessAddress ||
        !formData.vendorInfo.phoneNumber
      ) {
        setPasswordError("All vendor store information is required");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    const { confirmPassword, ...submitData } = formData;
    if (submitData.role !== "vendor") {
      delete submitData.vendorInfo;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        submitData
      );
      // Assume API returns user and token
      const userData = res.data.user || res.data;
      const token = res.data.token;
      if (userData && token) {
        localStorage.setItem("user", JSON.stringify({ ...userData, token }));
        navigate("/main");
      } else {
        setError("Registration succeeded but no user data returned.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Create Account
              </CardTitle>
              <p className="text-white/60">
                {formData.role === "vendor"
                  ? "Start selling on our marketplace"
                  : "Join our marketplace today"}
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {passwordError && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-3"
              >
                <Label className="text-white">Account Type</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="customer"
                      id="customer"
                      className="border-white/40 text-purple-500"
                    />
                    <Label
                      htmlFor="customer"
                      className="text-white cursor-pointer"
                    >
                      Customer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="vendor"
                      id="vendor"
                      className="border-white/40 text-purple-500"
                    />
                    <Label
                      htmlFor="vendor"
                      className="text-white cursor-pointer"
                    >
                      Vendor
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username" className="text-white">
                    Username
                  </Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                      size={18}
                    />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                      size={18}
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      required
                    />
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                      size={18}
                    />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                      size={18}
                    />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Vendor Information */}
              {formData.role === "vendor" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="space-y-4 border-t border-white/20 pt-6"
                >
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Store size={20} />
                    Store Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName" className="text-white">
                        Store Name *
                      </Label>
                      <Input
                        id="storeName"
                        name="vendor.storeName"
                        type="text"
                        value={formData.vendorInfo.storeName}
                        onChange={handleChange}
                        placeholder="Enter your store name"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-white">
                        Phone Number *
                      </Label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                          size={18}
                        />
                        <Input
                          id="phoneNumber"
                          name="vendor.phoneNumber"
                          type="tel"
                          value={formData.vendorInfo.phoneNumber}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeDescription" className="text-white">
                      Store Description *
                    </Label>
                    <Textarea
                      id="storeDescription"
                      name="vendor.storeDescription"
                      value={formData.vendorInfo.storeDescription}
                      onChange={handleChange}
                      placeholder="Describe your store and what you sell"
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500 min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress" className="text-white">
                      Business Address *
                    </Label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-3 text-white/60"
                        size={18}
                      />
                      <Textarea
                        id="businessAddress"
                        name="vendor.businessAddress"
                        value={formData.vendorInfo.businessAddress}
                        onChange={handleChange}
                        placeholder="Enter your business address"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Customer Information */}
              {formData.role === "customer" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="space-y-4 border-t border-white/20 pt-6"
                >
                  <h3 className="text-lg font-semibold text-white">
                    Personal Information (Optional)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="customer.firstName"
                        type="text"
                        value={formData.customerInfo.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="customer.lastName"
                        type="text"
                        value={formData.customerInfo.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-white">
                        Phone Number
                      </Label>
                      <Input
                        id="customerPhone"
                        name="customer.phoneNumber"
                        type="tel"
                        value={formData.customerInfo.phoneNumber}
                        onChange={handleChange}
                        placeholder="Phone number"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    `Create ${formData.role === "vendor" ? "Vendor" : "Customer"} Account`
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-white/60">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
