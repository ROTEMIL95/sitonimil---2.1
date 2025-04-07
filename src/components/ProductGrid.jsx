import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

function ProductSkeleton() {
  return (
    <Card className="bg-white p-4 rounded-xl shadow-sm animate-pulse" dir="rtl">
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </Card>
  );
}

export default function ProductGrid({ products, loading, viewMode, className }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" dir="rtl">
        {Array(8).fill(0).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-center py-12" dir="rtl">
        <Package className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">לא נמצאו מוצרים</h3>
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
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            : "flex flex-col gap-4",
          className
        )}
        dir="rtl"
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ProductCard 
              product={product} 
              variant={viewMode === "list" ? "list" : "default"}
              className="h-full"
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}