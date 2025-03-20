import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

function ProductSkeleton() {
  return (
    <Card className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </Card>
  );
}

export default function ProductGrid({ products, loading, viewMode }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <img 
          src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2070" 
          alt="לא נמצאו מוצרים" 
          className="w-48 h-48 object-cover rounded-full mb-4 opacity-50"
        />
        <h3 className="text-xl font-semibold text-gray-700">לא נמצאו מוצרים</h3>
        <p className="text-gray-500 mt-2 max-w-md">
          נסה לשנות את הסינון או לחפש מונחים אחרים כדי למצוא את מה שאתה מחפש.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${viewMode}-${products.length}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ProductCard 
              product={product} 
              variant={viewMode === "list" ? "list" : "default"}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}