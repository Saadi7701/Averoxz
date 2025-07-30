import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Filter,
  Grid,
  List,
  ArrowLeft,
  ShoppingCart,
  Star,
  Eye,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import SearchBar from "./SearchBar";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sortBy: "relevance",
  });
  const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);

  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

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

  useEffect(() => {
    // Perform search when params or filters change
    const fetchProducts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = {};
        if (query) params.query = query;
        if (categoryParam) params.category = categoryParam;
        if (localFilters.minPrice) params.minPrice = localFilters.minPrice;
        if (localFilters.maxPrice) params.maxPrice = localFilters.maxPrice;
        if (localFilters.sortBy) params.sortBy = localFilters.sortBy;
        params.page = page;
        const res = await axios.get(
          "http://localhost:5000/api/products/search",
          { params }
        );
        setProducts(res.data.products || res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || page);
        setTotal(res.data.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch products");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [query, categoryParam, localFilters, page]);

  const handleFilterChange = (filterName, value) => {
    setLocalFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const applyFilters = () => {
    setPage(1);
  };

  const clearFilters = () => {
    const defaultFilters = { minPrice: "", maxPrice: "", sortBy: "relevance" };
    setLocalFilters(defaultFilters);
    setPage(1);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/cart`,
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate("/cart");
    } catch (error) {
      // Optionally show error
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <SearchBar showFilters={true} />
            </div>
          </div>

          {/* Search Info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {query
                  ? `Search results for "${query}"`
                  : categoryParam
                    ? `Products in ${getCategoryName(categoryParam)}`
                    : "Search Results"}
              </h1>
              <p className="text-white/60">
                {total} {total === 1 ? "product" : "products"} found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div className="flex border border-white/20 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid"
                      ? "bg-white/20"
                      : "text-white hover:bg-white/10"
                  }
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? "bg-white/20"
                      : "text-white hover:bg-white/10"
                  }
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64 space-y-6"
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>

                  {/* Price Range */}
                  <div className="space-y-3 mb-6">
                    <label className="text-white/80 text-sm font-medium">
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={localFilters.minPrice}
                        onChange={(e) =>
                          handleFilterChange("minPrice", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-white/60"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={localFilters.maxPrice}
                        onChange={(e) =>
                          handleFilterChange("maxPrice", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-white/60"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3 mb-6">
                    <label className="text-white/80 text-sm font-medium">
                      Sort By
                    </label>
                    <select
                      value={localFilters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="relevance" className="text-black">
                        Relevance
                      </option>
                      <option value="price_low" className="text-black">
                        Price: Low to High
                      </option>
                      <option value="price_high" className="text-black">
                        Price: High to Low
                      </option>
                      <option value="newest" className="text-black">
                        Newest First
                      </option>
                      <option value="rating" className="text-black">
                        Highest Rated
                      </option>
                      <option value="popular" className="text-black">
                        Most Popular
                      </option>
                    </select>
                  </div>

                  {/* Filter Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={applyFilters}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          <div className="flex-1">
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md mx-auto">
                  <CardContent className="p-8">
                    <Search className="w-16 h-16 text-white/60 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">
                      No products found
                    </h2>
                    <p className="text-white/60 mb-6">
                      Try adjusting your search terms or filters to find what
                      you're looking for.
                    </p>
                    <Button
                      onClick={() => navigate("/")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Browse All Products
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <>
                {/* Products Grid/List */}
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 ${
                          viewMode === "list" ? "flex" : ""
                        }`}
                      >
                        <div
                          className={
                            viewMode === "list" ? "w-48 flex-shrink-0" : ""
                          }
                        >
                          <div
                            className={`bg-white/20 ${viewMode === "list" ? "h-full" : "aspect-square"} flex items-center justify-center overflow-hidden ${viewMode === "list" ? "rounded-l-lg" : "rounded-t-lg"}`}
                          >
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-white/60 text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                  <Search className="w-8 h-8" />
                                </div>
                                <p className="text-sm">No Image</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <CardContent
                          className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}
                        >
                          <div>
                            <h3 className="text-white font-semibold mb-2 line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-white/60 text-sm mb-2 line-clamp-2">
                              {product.description}
                            </p>

                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className="border-white/20 text-white/80"
                              >
                                {product.category?.name}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-white/20 text-white/80"
                              >
                                {product.store?.name}
                              </Badge>
                            </div>

                            {product.rating && (
                              <div className="flex items-center gap-1 mb-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-white/80 text-sm">
                                  {product.rating.toFixed(1)}
                                </span>
                                <span className="text-white/60 text-sm">
                                  ({product.reviewCount || 0})
                                </span>
                              </div>
                            )}
                          </div>

                          <div
                            className={`${viewMode === "list" ? "flex items-center justify-between" : "space-y-3"}`}
                          >
                            <div className="text-white font-bold text-lg">
                              {formatPrice(product.price)}
                            </div>

                            <div
                              className={`flex gap-2 ${viewMode === "list" ? "" : "w-full"}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/product/${product._id}`)
                                }
                                className="border-white/20 text-white hover:bg-white/10 flex-1"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(product)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center gap-2 mt-8"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Next
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
