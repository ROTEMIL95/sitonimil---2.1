import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { Search, X, FilterIcon, ListFilter, Grid3X3 } from "lucide-react";
import ProductFilter from "@/components/ProductFilter";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";

// הגדרת טיפוס לאפשרויות הסינון
const initialFilterOptions = {
  categories: [],
  priceRange: [0, 500],
  minOrderRange: [0, 200],
  rating: 0,
  sortBy: 'newest'
};

// פונקציית סינון ומיון המוצרים - מוגדרת מחוץ לקומפוננטה למנוע שגיאות הרפרור
const filterAndSortProducts = (products, options, searchQuery) => {
  let filtered = products.filter(product => {
    // סינון לפי חיפוש
    if (searchQuery && !product.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // סינון לפי קטגוריות
    if (options.categories.length > 0 && 
        !options.categories.includes(product.category)) {
      return false;
    }
    
    // סינון לפי מחיר
    if (product.price < options.priceRange[0] || 
        product.price > options.priceRange[1]) {
      return false;
    }
    
    // סינון לפי כמות מינימלית
    if (product.minimum_order < options.minOrderRange[0] || 
        product.minimum_order > options.minOrderRange[1]) {
      return false;
    }
    
    // סינון לפי דירוג
    if (options.rating > 0 && (!product.rating || product.rating < options.rating)) {
      return false;
    }
    
    return true;
  });

  // מיון המוצרים
  return filtered.sort((a, b) => {
    switch (options.sortBy) {
      case 'newest':
        return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const { toast } = useToast();
  
  // Get search query parameters
  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  
  // Filter state
  const [filterOptions, setFilterOptions] = useState({
    ...initialFilterOptions,
    categories: categoryParam ? [categoryParam] : []
  });

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // טעינת מוצרים ראשונית - רק פעם אחת
  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      try {
        const products = await Product.list();
        // סינון מוצרים לא תקינים
        const validProducts = products.filter(product => 
          product && product.title && product.price !== undefined
        );
        setAllProducts(validProducts);
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          variant: "destructive",
          description: "שגיאה בטעינת המוצרים",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialProducts();
  }, []);

  // חישוב המוצרים המסוננים באמצעות useMemo - רק כאשר הסינונים או המוצרים משתנים
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(allProducts, filterOptions, query);
  }, [allProducts, filterOptions, query]);

  const handleSearch = (searchQuery, category) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category) params.set("category", category);
    setSearchParams(params);
    
    // עדכון אפשרויות הסינון אם הקטגוריה משתנה
    if (category && !filterOptions.categories.includes(category)) {
      setFilterOptions(prev => ({
        ...prev,
        categories: [category]
      }));
    }
  };

  const handleFilterChange = (newOptions) => {
    // עדכון פרמטר הקטגוריה ב-URL
    if (newOptions.categories !== undefined) {
      const params = new URLSearchParams(searchParams);
      if (newOptions.categories.length === 1) {
        params.set("category", newOptions.categories[0]);
      } else {
        params.delete("category");
      }
      setSearchParams(params);
    }

    // עדכון אפשרויות הסינון
    setFilterOptions(prev => ({
      ...prev,
      ...newOptions
    }));

    toast({
      description: "הסינון עודכן בהצלחה",
      duration: 1500,
    });
  };

  const clearFilters = () => {
    setFilterOptions(initialFilterOptions);
    
    // ניקוי פרמטר הקטגוריה מה-URL
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    setSearchParams(params);

    toast({
      description: "הסינון נוקה בהצלחה",
      duration: 1500,
    });
  };

  const hasActiveFilters = filterOptions.categories.length > 0 || 
                          filterOptions.rating > 0 || 
                          filterOptions.priceRange[0] > 0 || 
                          filterOptions.priceRange[1] < 500 ||
                          filterOptions.minOrderRange[0] > 0 || 
                          filterOptions.minOrderRange[1] < 200;

  // מיפוי שמות קטגוריות
  const getCategoryLabel = (categoryValue) => {
    const categoryMap = {
      "electronics": "אלקטרוניקה",
      "clothing": "ביגוד",
      "home_goods": "מוצרי בית",
      "food_beverage": "מזון ומשקאות",
      "health_beauty": "בריאות ויופי",
      "industrial": "ציוד תעשייתי",
      "automotive": "רכב",
      "sports": "ספורט",
      "toys": "צעצועים"
    };
    return categoryMap[categoryValue] || categoryValue;
  };

  return (
    <div className="py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-4 text-right">מוצרים</h1>
          <SearchBar 
            initialQuery={query}
            initialCategory={categoryParam}
            onSearch={handleSearch}
            className="mb-4"
          />
          
          {/* תצוגת סינונים פעילים */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 p-3 bg-muted/40 rounded-lg justify-end">
              <span className="text-sm font-medium">סינון פעיל:</span>
              
              {filterOptions.categories.map(category => (
                <Badge key={category} variant="secondary" className="gap-1 bg-background">
                  {getCategoryLabel(category)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFilterChange({
                      categories: filterOptions.categories.filter(c => c !== category)
                    })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              
              {filterOptions.rating > 0 && (
                <Badge variant="secondary" className="gap-1 bg-background">
                  דירוג: {filterOptions.rating}+
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFilterChange({ rating: 0 })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {(filterOptions.priceRange[0] > 0 || filterOptions.priceRange[1] < 500) && (
                <Badge variant="secondary" className="gap-1 bg-background">
                  מחיר: ₪{filterOptions.priceRange[0]}-₪{filterOptions.priceRange[1]}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFilterChange({ priceRange: [0, 500] })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 p-0 h-auto font-medium"
                onClick={clearFilters}
              >
                נקה הכל
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex items-center gap-2">
                  <FilterIcon className="h-4 w-4" />
                  סינון
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="py-6">
                  <ProductFilter
                    options={filterOptions}
                    onChange={handleFilterChange}
                    onReset={clearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} מוצרים
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className={`rounded-full ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={`rounded-full ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6 relative">
          <div className="hidden md:block w-[240px] flex-shrink-0">
            <div className="sticky top-20">
              <ProductFilter
                options={filterOptions}
                onChange={handleFilterChange}
                onReset={clearFilters}
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <ProductGrid 
              products={filteredProducts}
              loading={loading}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}