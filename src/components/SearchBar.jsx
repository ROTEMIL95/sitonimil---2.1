import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// רשימת הקטגוריות
const categories = [
  { value: "electronics", label: "אלקטרוניקה" },
  { value: "clothing", label: "ביגוד" },
  { value: "home_goods", label: "מוצרי בית" },
  { value: "food_beverage", label: "מזון ומשקאות" },
  { value: "health_beauty", label: "בריאות ויופי" },
  { value: "industrial", label: "ציוד תעשייתי" },
  { value: "automotive", label: "רכב" },
  { value: "sports", label: "ספורט" },
  { value: "toys", label: "צעצועים" }
];

export default function SearchBar({ onSearch, className = "", initialQuery = "", initialCategory = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  // עדכון ערכי החיפוש כאשר הפרמטרים החיצוניים משתנים
  useEffect(() => {
    setQuery(initialQuery);
    setCategory(initialCategory);
  }, [initialQuery, initialCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query, category);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="חפש מוצרים..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-4 pr-10 border-blue-100 focus-visible:ring-blue-400"
        />
      </div>
      
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[180px] border-blue-100 focus:ring-blue-400">
          <SelectValue placeholder="כל הקטגוריות" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>כל הקטגוריות</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700"
      >
        חיפוש
      </Button>
    </form>
  );
}