import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return;
      setIsLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setOrder(res.data.order || res.data);
      } catch (err) {
        setError("Failed to fetch order");
      } finally {
        setIsLoading(false);
      }
    };
    if (user && orderId) fetchOrder();
  }, [user, orderId]);

  if (!user)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Please log in to view order details.
      </div>
    );

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading order details...
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Order not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Order #{order.orderNumber}
              </h2>

              <div className="mb-4">
                <span className="text-white/80">Status:</span>{" "}
                <Badge className="bg-purple-600 text-white capitalize">
                  {order.status}
                </Badge>
              </div>

              <div className="mb-4 text-white/80">
                <strong className="text-white">Placed:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </div>

              <div className="mb-4 text-white/80">
                <strong className="text-white">Total:</strong> $
                {order.totalPrice?.toFixed(2)}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg text-white mb-2">
                  Items:
                </h3>
                <ul className="list-disc pl-6 text-white/80 space-y-1">
                  {order.items.map((item) => (
                    <li key={item._id}>
                      {item.product?.name || "Product"} x{item.quantity} @ $
                      {item.price?.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">
                    Shipping Address:
                  </h3>
                  <p className="text-white/80">
                    {order.shippingAddress?.firstName}{" "}
                    {order.shippingAddress?.lastName}
                  </p>
                  <p className="text-white/80">
                    {order.shippingAddress?.street}
                  </p>
                  <p className="text-white/80">
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.zipCode}
                  </p>
                  <p className="text-white/80">
                    {order.shippingAddress?.country}
                  </p>
                </div>

                {/* Billing Address */}
                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">
                    Billing Address:
                  </h3>
                  <p className="text-white/80">
                    {order.billingAddress?.firstName}{" "}
                    {order.billingAddress?.lastName}
                  </p>
                  <p className="text-white/80">
                    {order.billingAddress?.street}
                  </p>
                  <p className="text-white/80">
                    {order.billingAddress?.city}, {order.billingAddress?.state}{" "}
                    {order.billingAddress?.zipCode}
                  </p>
                  <p className="text-white/80">
                    {order.billingAddress?.country}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-lg text-white mb-2">
                  Payment Info:
                </h3>
                <p className="text-white/80">
                  <strong className="text-white">Method:</strong>{" "}
                  {order.payment?.method}
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Status:</strong>{" "}
                  {order.payment?.status}
                </p>
              </div>

              <div className="text-center mt-8">
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl"
                >
                  Back
                </Button>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center mt-4">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;
