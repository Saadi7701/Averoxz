import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ShoppingCart } from "lucide-react";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const Store = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const storeRes = await axios.get(
          `http://localhost:5000/api/stores/${storeId}`
        );
        setStore(storeRes.data);

        const prodRes = await axios.get(
          `http://localhost:5000/api/products?storeId=${storeId}`
        );
        setProducts(
          Array.isArray(prodRes.data.products) ? prodRes.data.products : []
        );
      } catch (err) {
        setError("Failed to fetch store or products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreAndProducts();
  }, [storeId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Decode buffers to base64 strings (if data exists)
  const frontImageBase64 =
    store && store.frontImage && store.frontImage.data
      ? Buffer.from(store.frontImage.data).toString("base64")
      : null;

  const backBannerBase64 =
    store && store.backBanner && store.backBanner.data
      ? Buffer.from(store.backBanner.data).toString("base64")
      : null;

  const themeColor = store?.themeColor || "#6b21a8";
  const fontStyle = store?.fontStyle || "sans-serif";

  return (
    <div
      className="min-h-screen bg-[#18181b]"
      style={{ fontFamily: fontStyle }}
    >
      {/* Back to Home Button */}
      <div className="w-full flex justify-end px-8 pt-6">
        <Button
          className="bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-white/80">Loading store...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-12">{error}</div>
      ) : !store ? (
        <div className="text-center text-white/60 py-12">Store not found.</div>
      ) : (
        <>
          {/* Back Banner */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="rounded-2xl overflow-hidden mt-8 mb-0">
                <div
                  className="h-40 md:h-56 w-full"
                  style={{
                    backgroundImage: backBannerBase64
                      ? `url(data:image/jpeg;base64,${backBannerBase64})`
                      : `linear-gradient(to right, ${themeColor}, #1e1b4b)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Store Avatar and Info */}
          <div className="flex flex-col items-center mt-[-60px] mb-8">
            <Avatar className="w-32 h-32 border-4 border-white/20 shadow-lg bg-white/10">
              <img
                src={
                  frontImageBase64
                    ? `data:image/jpeg;base64,${frontImageBase64}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        store.name
                      )}`
                }
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </Avatar>

            <h1 className="text-3xl font-bold text-white mt-4 mb-1 text-center">
              {store.name}
            </h1>

            {store.slogan && (
              <p className="text-purple-300 italic text-center mb-2">
                {store.slogan}
              </p>
            )}

            <p className="text-white/70 text-center max-w-xl mb-2">
              {store.description}
            </p>
          </div>

          {/* Featured Products */}
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              Featured Products
            </h2>
            {!Array.isArray(products) || products.length === 0 ? (
              <div className="text-white/60 text-center py-12">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-[#23232b] border-none shadow-lg flex flex-col items-center rounded-lg"
                  >
                    <div className="w-full h-40 flex items-center justify-center bg-[#18181b] rounded-t-lg overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white/60 text-center">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">No Image</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col items-center">
                      <h3 className="text-white font-semibold mb-1 text-lg text-center line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-2 text-center line-clamp-2">
                        {product.description}
                      </p>
                      <span className="text-purple-400 font-bold text-lg mb-2">
                        {formatPrice(product.price)}
                      </span>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 w-full mt-2"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Store;
