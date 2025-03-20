import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { categories, getCategoryImage, getCategoryLabel } from "./categories";

// בחירת 4 הקטגוריות המרכזיות למקטע המורחב
const categoryImages = [
  {
    id: "electronics",
    name: "אלקטרוניקה",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070",
    description: "מוצרי אלקטרוניקה מתקדמים במחירים סיטונאיים"
  },
  {
    id: "clothing",
    name: "ביגוד",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000",
    description: "קולקציות אופנה עדכניות לכל העונות"
  },
  {
    id: "home_goods",
    name: "מוצרי בית",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070",
    description: "הכל לשדרוג ועיצוב הבית שלכם"
  },
  {
    id: "food_beverage",
    name: "מזון ומשקאות",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070",
    description: "מוצרי מזון איכותיים ממיטב היצרנים"
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ExpandedCategoryBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">קטגוריות מומלצות</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">מגוון רחב של קטגוריות מוצרים איכותיים למסחר סיטונאי</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categoryImages.map((category) => (
            <motion.div
              key={category.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-xl shadow-sm h-48"
            >
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 right-0 p-4 text-right">
                <h3 className="text-white text-lg font-bold mb-1">{category.name}</h3>
                <p className="text-white/80 text-sm mb-2 line-clamp-2">{category.description}</p>
                <Button 
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100"
                  asChild
                >
                  <Link to={createPageUrl("Search") + `?category=${category.id}`}>
                    <span>לכל המוצרים</span>
                    <ArrowLeft className="mr-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}