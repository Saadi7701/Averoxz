import React from "react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";

// Extended image list (ecommerce-focused)
const images = [
  "https://images.unsplash.com/photo-1600180758890-6f0e18ab7f18?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1585386959984-a415522ad8ef?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1606813909227-7351b14dfe8f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1596464716121-e3f32dc3d665?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1618354691417-016aafcddc49?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1616627783586-dbd74ff612f0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1588776814546-ec7d4d5e0bcf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555529669-1b47f8235d5b?auto=format&fit=crop&w=600&q=80",
];

// Floating image tile generator with continuous floating animation
const generateTiles = (count = 30) => {
  return Array.from({ length: count }, (_, i) => {
    const img = images[i % images.length];
    const size = Math.random() * 80 + 120;

    // Random float offsets, positive or negative
    const floatX = Math.random() * 20 - 10;
    const floatY = Math.random() * 20 - 10;

    // Optional: random duration for natural floating effect
    const duration = 20 + Math.random() * 10;

    return (
      <motion.div
        key={i}
        className="absolute rounded-xl shadow-md"
        style={{
          top: `${Math.random() * 90}%`,
          left: `${Math.random() * 90}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.9,
        }}
        animate={{
          x: [0, floatX, 0],
          y: [0, floatY, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    );
  });
};

export default function BannerSection() {
  return (
    <section className="relative w-full h-[400px] overflow-hidden bg-purple-200 flex items-center justify-center">
      {/* Floating background images */}
      <div className="absolute inset-0 z-0">{generateTiles(35)}</div>

      {/* Search bar on top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl px-4"
      >
        <div className="bg-white/20 border border-white/30 text-black rounded-xl p-6 shadow-lg backdrop-blur-sm">
          <SearchBar />
        </div>
      </motion.div>
    </section>
  );
}
