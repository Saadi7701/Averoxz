import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Package,
  MapPin,
  CreditCard,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const profileMenuItems = [
    {
      icon: User,
      label: "Personal Information",
      description: "Manage your account details",
      onClick: () => navigate("/profile/personal-info"),
    },
    {
      icon: Package,
      label: "My Orders",
      description: "Track your orders and purchases",
      onClick: () => navigate("/orders"),
    },
    {
      icon: MapPin,
      label: "Addresses",
      description: "Manage shipping addresses",
      onClick: () => navigate("/addresses"),
    },
    {
      icon: CreditCard,
      label: "Payment Methods",
      description: "Manage payment options",
      onClick: () => navigate("/payment-methods"),
    },
  ];

  const settingsMenuItems = [
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage notification preferences",
      onClick: () => navigate("/settings/notifications"),
    },
    {
      icon: Globe,
      label: "Language & Region",
      description: "Change language and region settings",
      onClick: () => navigate("/settings/language"),
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      description: "Get help and support",
      onClick: () => navigate("/help"),
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Privacy and security settings",
      onClick: () => navigate("/settings/account"),
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Please log in to view your profile
          </h2>
          <Button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Go to Login
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </motion.button>
      </motion.div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">
                    {user.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {user.username}
                  </h2>
                  <p className="text-white/60 mb-3">{user.email}</p>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={`${user.role === "vendor" ? "bg-purple-600" : "bg-blue-600"} text-white`}
                    >
                      {user.role === "vendor" ? (
                        <>
                          <Store size={14} className="mr-1" />
                          Vendor
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} className="mr-1" />
                          Customer
                        </>
                      )}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-green-500/50 text-green-400"
                    >
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <Button
                    variant="outline"
                    className="bg-transparent text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white"
                    onClick={() => navigate("/profile/edit")}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vendor Dashboard Link */}
        {user.role === "vendor" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Vendor Dashboard
                    </h3>
                    <p className="text-white/60">
                      Manage your products, orders, and store settings
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/vendor-dashboard")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Store size={18} className="mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profileMenuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={item.onClick}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-purple-600/20">
                      <item.icon size={20} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.label}</h4>
                      <p className="text-white/60 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {settingsMenuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={item.onClick}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-600/20">
                      <item.icon size={20} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.label}</h4>
                      <p className="text-white/60 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats for Vendors */}
        {user.role === "vendor" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      12
                    </div>
                    <div className="text-white/60 text-sm">Total Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      48
                    </div>
                    <div className="text-white/60 text-sm">
                      Orders This Month
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      $2,340
                    </div>
                    <div className="text-white/60 text-sm">
                      Revenue This Month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
