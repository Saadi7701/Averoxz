const mongoose = require("mongoose");
const Category = require("../models/Category");
require("dotenv").config();

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and gadgets",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Fashion and apparel",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    description: "Home improvement and garden supplies",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Sports equipment and outdoor gear",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Books",
    slug: "books",
    description: "Books and educational materials",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description: "Beauty products and personal care items",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    description: "Toys, games, and entertainment",
    image:
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Car parts and automotive accessories",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Health and wellness products",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Food & Beverages",
    slug: "food-beverages",
    description: "Food items and beverages",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Other",
    slug: "other",
    description: "Miscellaneous items",
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=400&q=80",
  },
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories:`);

    createdCategories.forEach((category) => {
      console.log(`- ${category.name} (ID: ${category._id})`);
    });

    console.log("Categories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
