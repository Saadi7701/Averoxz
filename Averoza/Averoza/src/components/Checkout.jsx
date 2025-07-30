import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const initialShipping = {
  firstName: "",
  lastName: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};
const initialBilling = {
  firstName: "",
  lastName: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};
const initialCard = { number: "", expiry: "", cvv: "", name: "" };

const paymentMethodMap = {
  "Credit Card": "credit_card",
  PayPal: "paypal",
  "Gift Card": "gift_card",
};

const Checkout = () => {
  const navigate = useNavigate();
  const [shipping, setShipping] = useState(initialShipping);
  const [billing, setBilling] = useState(initialBilling);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [card, setCard] = useState(initialCard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [totals, setTotals] = useState({
    subtotal: 0,
    shipping: 5,
    tax: 0,
    total: 5,
  });

  useEffect(() => {
    const fetchCart = async () => {
      setCartLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${user.token}` },
          credentials: "include",
        });
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        const data = await res.json();
        const items = data.cartItems || data.items || [];
        setCart(items);
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const shipping = 5;
        const tax = Math.round(subtotal * 0.082 * 100) / 100;
        const total = Math.round((subtotal + shipping + tax) * 100) / 100;
        setTotals({ subtotal, shipping, tax, total });
      } catch (err) {
        setError("Failed to load cart");
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleShippingChange = (e) =>
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  const handleBillingChange = (e) =>
    setBilling({ ...billing, [e.target.name]: e.target.value });
  const handleCardChange = (e) =>
    setCard({ ...card, [e.target.name]: e.target.value });
  const handleSameAsShipping = (e) => {
    setSameAsShipping(e.target.checked);
    if (e.target.checked) setBilling(shipping);
  };
  const handlePaymentMethod = (method) => setPaymentMethod(method);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      navigate("/login");
      return;
    }
    try {
      const shippingAddress = { ...shipping };
      const billingAddress = sameAsShipping ? { ...shipping } : { ...billing };
      const payment = { method: paymentMethodMap[paymentMethod], ...card };
      const items = cart;
      const res = await fetch("http://localhost:5000/api/checkout/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          shippingAddress,
          billingAddress,
          paymentMethod: payment.method,
          items,
        }),
      });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error("Order failed");
      setSuccess(true);
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="p-8 text-center text-white">
        Order placed! Redirecting to order history...
      </div>
    );
  if (cartLoading)
    return <div className="p-8 text-center text-white">Loading cart...</div>;

  return (
    <div className="min-h-screen bg-[#18141c] flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-[#221c2a] rounded-lg shadow-lg p-8">
        <div className="mb-6 text-sm text-gray-400">
          Shopping Bag / <span className="text-white">Checkout</span>
        </div>
        <h2 className="text-3xl font-bold mb-8 text-white">Checkout</h2>
        {/* Order Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Order Summary
          </h3>
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-[#2a2336] rounded p-3"
              >
                <img
                  src={
                    item.product?.images?.[0]?.url ||
                    item.image ||
                    "/placeholder.png"
                  }
                  alt={item.product?.name || item.name}
                  className="w-12 h-12 rounded object-cover bg-gray-700"
                />
                <div>
                  <div className="text-white font-medium">
                    {item.product?.name || item.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.size ? `Size ${item.size}` : ""}
                  </div>
                </div>
                <div className="ml-auto text-white">x{item.quantity}</div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Shipping Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">First Name</label>
                <input
                  name="firstName"
                  value={shipping.firstName}
                  onChange={handleShippingChange}
                  required
                  className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={shipping.lastName}
                  onChange={handleShippingChange}
                  required
                  className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-400 mb-1">Street</label>
                <input
                  name="street"
                  value={shipping.street}
                  onChange={handleShippingChange}
                  required
                  className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">City</label>
                <input
                  name="city"
                  value={shipping.city}
                  onChange={handleShippingChange}
                  required
                  className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">State</label>
                <input
                  name="state"
                  value={shipping.state}
                  onChange={handleShippingChange}
                  required
                  className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Zip Code</label>
                <input
                  name="zipCode"
                  value={shipping.zipCode}
                  onChange={handleShippingChange}
                  required
                  className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Country</label>
                <input
                  name="country"
                  value={shipping.country}
                  onChange={handleShippingChange}
                  required
                  className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                />
              </div>
            </div>
          </div>
          {/* Billing Address */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Billing Address
            </h3>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={sameAsShipping}
                onChange={handleSameAsShipping}
                className="mr-2"
                id="sameAsShipping"
              />
              <label htmlFor="sameAsShipping" className="text-gray-400">
                Same as shipping address
              </label>
            </div>
            {!sameAsShipping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">First Name</label>
                  <input
                    name="firstName"
                    value={billing.firstName}
                    onChange={handleBillingChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Last Name</label>
                  <input
                    name="lastName"
                    value={billing.lastName}
                    onChange={handleBillingChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-400 mb-1">Street</label>
                  <input
                    name="street"
                    value={billing.street}
                    onChange={handleBillingChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">City</label>
                  <input
                    name="city"
                    value={billing.city}
                    onChange={handleBillingChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">State</label>
                  <input
                    name="state"
                    value={billing.state}
                    onChange={handleBillingChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Zip Code</label>
                  <input
                    name="zipCode"
                    value={billing.zipCode}
                    onChange={handleBillingChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Country</label>
                  <input
                    name="country"
                    value={billing.country}
                    onChange={handleBillingChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Payment Method
            </h3>
            <div className="flex gap-3 mb-4">
              {["Credit Card", "PayPal", "Gift Card"].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => handlePaymentMethod(method)}
                  className={`px-4 py-2 rounded border ${paymentMethod === method ? "bg-[#a259f7] text-white border-[#a259f7]" : "bg-[#18141c] text-gray-300 border-[#2a2336]"} focus:outline-none`}
                >
                  {method}
                </button>
              ))}
            </div>
            {paymentMethod === "Credit Card" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-400 mb-1">
                    Card Number
                  </label>
                  <input
                    name="number"
                    value={card.number}
                    onChange={handleCardChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                    placeholder="1234-5678-9012-3456"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">
                    Expiration Date
                  </label>
                  <input
                    name="expiry"
                    value={card.expiry}
                    onChange={handleCardChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">CVV</label>
                  <input
                    name="cvv"
                    value={card.cvv}
                    onChange={handleCardChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                    placeholder="123"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-400 mb-1">
                    Name on Card
                  </label>
                  <input
                    name="name"
                    value={card.name}
                    onChange={handleCardChange}
                    required
                    className="w-full bg-[#18141c] text-white p-2 rounded border border-[#2a2336] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Order Total */}
          <div className="bg-[#2a2336] rounded p-4 text-white">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>${totals.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-full bg-[#a259f7] text-white font-semibold text-lg hover:bg-[#8d3cf7] transition disabled:opacity-60"
          >
            {loading ? "Placing Order..." : "Complete Purchase"}
          </button>
          {error && <div className="text-red-400 text-center">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Checkout;
