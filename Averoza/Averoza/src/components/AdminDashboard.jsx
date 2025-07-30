import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const AdminDashboard = () => {
  useEffect(() => {
    gsap.utils.toArray(".section").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50, rotateX: 10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans antialiased tracking-wide overflow-x-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1b1025] p-4 shadow-lg border-r border-[#2e1b3d] hidden md:block fixed h-full z-50">
        <h2 className="text-2xl font-bold mb-10 tracking-wider text-purple-400">
          Admin Panel
        </h2>
        <ul className="space-y-3">
          {[
            "AdminDashboard",
            "Orders",
            "Products",
            "Categories",
            "Vendors",
            "Customers",
            "Settings",
          ].map((item, idx) => (
            <li key={idx}>
              <Link
                to={`/${item.toLowerCase()}`}
                className="block px-4 py-2 rounded-md bg-[#2a173a] hover:bg-purple-700 transition-all duration-200 text-white"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-60 p-6 space-y-12">
        <motion.h1
          className="text-4xl font-bold mt-6 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          AdminDashboard
        </motion.h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 section">
          {[
            { label: "Total Users", value: "5,000" },
            { label: "Total Vendors", value: "500" },
            { label: "Total Customers", value: "4,500" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-[#2e1b3d] p-6 rounded-2xl shadow-md"
            >
              <h3 className="text-md font-semibold text-purple-300 mb-2">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-[#2e1b3d] p-6 rounded-2xl shadow-xl section">
          <h3 className="text-2xl font-semibold mb-4 text-purple-300">
            Recent Orders
          </h3>
          <table className="w-full text-left text-sm text-white">
            <thead className="text-purple-200">
              <tr className="border-b border-purple-800">
                <th className="pb-2">Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["#12345", "Sophia Carter", "2023-08-15", "Shipped", "$150"],
                ["#12346", "Liam Turner", "2023-08-14", "Processing", "$200"],
                ["#12347", "Emily Hayes", "2023-08-13", "Delivered", "$100"],
                ["#12348", "Noah Bennett", "2023-08-12", "Shipped", "$180"],
                ["#12349", "Ava Foster", "2023-08-11", "Processing", "$220"],
              ].map(([id, name, date, status, total], idx) => (
                <tr key={idx} className="border-b border-[#3a234f]">
                  <td className="py-2">{id}</td>
                  <td>{name}</td>
                  <td>{date}</td>
                  <td>
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-700 text-white text-xs">
                      {status}
                    </span>
                  </td>
                  <td>{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Activity */}
        <div className="bg-[#2e1b3d] p-6 rounded-2xl shadow-xl section">
          <h3 className="text-xl font-semibold mb-2 text-purple-300">
            Customer Activity
          </h3>
          <p className="text-green-400 font-bold text-lg">+15%</p>
          <p className="text-sm mb-2 text-white">Last 30 Days</p>
          <div className="h-32 bg-gradient-to-t from-[#4c2b66] to-[#140d1c] rounded-xl shadow-inner"></div>
        </div>

        {/* Product Performance */}
        <div className="bg-[#2e1b3d] p-6 rounded-2xl shadow-xl section">
          <h3 className="text-xl font-semibold mb-2 text-purple-300">
            Product Performance
          </h3>
          <p className="text-green-400 font-bold text-lg">+10%</p>
          <p className="text-sm mb-2 text-white">Last 30 Days</p>
          {[
            "Product A",
            "Product B",
            "Product C",
            "Product D",
            "Product E",
          ].map((product, idx) => (
            <div key={idx} className="mb-3">
              <div className="text-sm text-white/80 mb-1">{product}</div>
              <div className="w-full h-2 bg-[#3a234f] rounded-full">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${Math.floor(Math.random() * 90) + 10}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
