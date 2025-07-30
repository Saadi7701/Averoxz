import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Clock, TrendingUp, Filter } from "lucide-react";

const SearchBar = ({ className = "", showFilters = false }) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    // Load categories from API
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
    // Handle clicks outside to close suggestions
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounced search suggestions
    if (query.length > 2) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(async () => {
        setIsLoadingSuggestions(true);
        try {
          const res = await axios.get(
            "http://localhost:5000/api/products/suggestions",
            {
              params: { q: query },
            }
          );
          setSuggestions(res.data.suggestions || res.data);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSearch = (searchQuery = query, category = selectedCategory) => {
    if (!searchQuery.trim()) return;
    // Save to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    // Navigate to search results
    const params = new URLSearchParams();
    params.append("q", searchQuery);
    if (category) params.append("category", category);
    navigate(`/search?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleRecentSearchClick = (recentSearch) => {
    setQuery(recentSearch);
    handleSearch(recentSearch);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    if (query.length > 0 || recentSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="flex gap-2">
        {/* Category Filter */}
        {showFilters && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option
                key={category._id}
                value={category._id}
                className="text-black"
              >
                {category.name}
              </option>
            ))}
          </select>
        )}

        {/* Search Input */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products, stores, or vendors..."
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-purple-500"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
              >
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-600 mb-2 px-2">
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-purple-100 rounded-md flex items-center gap-2 text-gray-800"
                      >
                        <Search className="w-4 h-4 text-gray-500" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-2 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <div className="text-xs font-semibold text-gray-600">
                        Recent Searches
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto"
                      >
                        Clear
                      </Button>
                    </div>
                    {recentSearches.map((recentSearch, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(recentSearch)}
                        className="w-full text-left px-3 py-2 hover:bg-purple-100 rounded-md flex items-center gap-2 text-gray-800"
                      >
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{recentSearch}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Categories */}
                {categories.length > 0 && query.length === 0 && (
                  <div className="p-2 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-600 mb-2 px-2">
                      Popular Categories
                    </div>
                    <div className="flex flex-wrap gap-1 px-2">
                      {categories.slice(0, 6).map((category) => (
                        <Badge
                          key={category._id}
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-100 text-gray-700 border-gray-300"
                          onClick={() => {
                            setSelectedCategory(category._id);
                            handleSearch("", category._id);
                          }}
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* No suggestions */}
                {query.length > 2 &&
                  suggestions.length === 0 &&
                  !isLoadingSuggestions && (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No suggestions found</p>
                      <p className="text-xs">
                        Try searching for something else
                      </p>
                    </div>
                  )}

                {/* Loading */}
                {isLoadingSuggestions && (
                  <div className="p-4 text-center">
                    <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Button */}
        <Button
          onClick={() => handleSearch()}
          disabled={!query.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
