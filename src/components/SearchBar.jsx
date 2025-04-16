import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";

// רשימת הקטגוריות - מיובאת מהשרת
export default function SearchBar({ onSearch, className = "", initialQuery = "", initialCategory = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // טעינת הקטגוריות מהשרת
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("value, label, image_url")
          .order("label", { ascending: true });

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        setCategories(data || []);
      } catch (err) {
        console.error("Exception fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // עדכון ערכי החיפוש כאשר הפרמטרים החיצוניים משתנים
  useEffect(() => {
    setQuery(initialQuery);
    setCategory(initialCategory);
  }, [initialQuery, initialCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query, category);
  };

  const handleCategorySelect = (value) => {
    setCategory(value);
    onSearch(query, value);
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-[1600px] mx-auto ${className}`}>  
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 py-4 px-2  justify-start">
          {categories.map((cat) => (
            <div 
              key={cat.value} 
              className={`flex flex-col items-center min-w-[100px] cursor-pointer transition-all hover:opacity-80`}
              onClick={() => handleCategorySelect(cat.value)}
            >
              <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${category === cat.value ? 'border-blue-500' : 'border-gray-200'}`}>
                <img
                  src={cat.image_url || `https://ui-avatars.com/api/?name=${cat.label}&background=random&color=fff`}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm mt-2 text-center font-medium max-w-[100px] line-clamp-2">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}