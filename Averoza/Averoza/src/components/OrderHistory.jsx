import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/orders/my-orders",
          {
            headers: { Authorization: `Bearer ${user.token}` },
            params: statusFilter ? { status: statusFilter } : {},
          }
        );
        setOrders(res.data.orders || []);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user, statusFilter]);

  if (!user)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Please log in to view your orders.
      </div>
    );

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading orders...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-3xl font-bold mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Order History
        </motion.h2>

        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => setStatusFilter("")}
            variant="outline"
            className={`capitalize ${
              statusFilter === ""
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-white/10 text-white"
            }`}
          >
            All
          </Button>
          {[
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant="outline"
              className={`capitalize ${
                statusFilter === status
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {status}
            </Button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center text-white/70">No orders found.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        Order #{order.orderNumber}
                      </div>
                      <div className="text-sm text-white/60">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                      <div className="text-sm text-white/80 mt-1">
                        Status:{" "}
                        <Badge className="bg-purple-600 capitalize text-white">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-white/80 mt-1">
                        Total: ${order.totalPrice?.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {error && <div className="text-red-500 text-center mt-6">{error}</div>}
      </div>
    </div>
  );
};

export default OrderHistory;
