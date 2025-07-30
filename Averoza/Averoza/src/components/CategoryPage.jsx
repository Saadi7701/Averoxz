import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "Active",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    gsap.from(".section", {
      scrollTrigger: {
        trigger: ".section",
        start: "top 90%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.2,
    });
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/categories", formData);
      fetchCategories();
      setShowForm(false);
      setFormData({ name: "", slug: "", status: "Active" });
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  return (
    <div className="flex min-h-screen font-sans text-gray-800 bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md h-full p-6 fixed top-0 left-0">
        <h2 className="text-2xl font-semibold mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          {[
            "Dashboard",
            "Orders",
            "Products",
            "Categories",
            "Vendors",
            "Customers",
            "Settings",
          ].map((item, idx) => (
            <Link
              key={idx}
              to={`/${item.toLowerCase()}`}
              className="block px-4 py-2 rounded hover:bg-blue-100 transition"
            >
              {item}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-10 flex-1 section">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Categories</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "Add Category"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4"
          >
            <div>
              <label className="block mb-1 font-medium">Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Category
            </button>
          </form>
        )}

        {/* Category Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium text-sm">ID</th>
                <th className="px-6 py-3 font-medium text-sm">Name</th>
                <th className="px-6 py-3 font-medium text-sm">Slug</th>
                <th className="px-6 py-3 font-medium text-sm">Status</th>
                <th className="px-6 py-3 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {categories.map((category, idx) => (
                <tr key={category._id || idx}>
                  <td className="px-6 py-4">{category._id}</td>
                  <td className="px-6 py-4">{category.name}</td>
                  <td className="px-6 py-4">{category.slug}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2">
                      Edit
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
