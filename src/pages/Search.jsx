import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { Search, X, FilterIcon, ListFilter, Grid3X3, Store, Package, ChevronLeft, ChevronRight } from "lucide-react";
import ProductFilter from "@/components/ProductFilter";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from "@/utils";
import SupplierCard from "@/components/SupplierCard";
import PageMeta from "@/components/PageMeta";

// הגדרת טיפוס לאפשרויות הסינון
const initialFilterOptions = {
  categories: [],
  priceRange: [0, 500],
  minOrderRange: [0, 200],
  rating: 0,
  sortBy: 'newest'
};

// מספר מוצרים מקסימלי לעמוד
const PRODUCTS_PER_PAGE = 30;

// פונקציית סינון ומיון המוצרים - מוגדרת מחוץ לקומפוננטה למנוע שגיאות הרפרור
const filterAndSortProducts = (products, options, searchQuery) => {
  let filtered = products.filter(product => {
    // וידוא שהמוצר תקין
    if (!product || !product.title) {
      return false;
    }
    
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
        // Use created_at field with proper fallback
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
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
  const navigate = useNavigate();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const { toast } = useToast();
  
  // Get search query parameters
  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const supplierParam = searchParams.get("supplier") || "";
  const searchType = searchParams.get("searchType") || "products"; // "products", "suppliers", "all"
  const isNewProduct = searchParams.get("new") === "true";
  const pageParam = searchParams.get("page") || "1";
  const currentPage = parseInt(pageParam, 10) || 1;
  
  // טאב פעיל
  const [activeTab, setActiveTab] = useState(searchType === "suppliers" ? "suppliers" : "products");
  
  // Filter state
  const [filterOptions, setFilterOptions] = useState({
    ...initialFilterOptions,
    categories: categoryParam ? [categoryParam] : []
  });

  const [allProducts, setAllProducts] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState({});

  // Function to refresh product data
  const refreshProducts = async () => {
    setLoading(true);
    try {
      const products = await Product.list();
      // סינון מוצרים לא תקינים
      const validProducts = products.filter(product => 
        product && product.title && product.price !== undefined
      );
      setAllProducts(validProducts);
      
      console.log("Refreshed products:", validProducts.length);
    } catch (error) {
      console.error("Error refreshing products:", error);
      toast({
        variant: "destructive",
        description: "שגיאה בטעינת המוצרים",
      });
    } finally {
      setLoading(false);
    }
  };

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
        console.log("Initial products loaded:", validProducts.length);

        // Load suppliers for product info and for supplier search
        try {
          const usersList = await User.list();
          const suppliersMap = {};
          const suppliersList = [];
          
          usersList.forEach(user => {
            suppliersMap[user.id] = user;
            
            // אם זה ספק, נוסיף אותו לרשימת הספקים לחיפוש
            if (user.business_type === "supplier" && user.company_name) {
              suppliersList.push(user);
            }
          });
          
          setSuppliers(suppliersMap);
          setAllSuppliers(suppliersList);
        } catch (error) {
          console.error("Error loading suppliers:", error);
        }
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
    let filtered = filterAndSortProducts(allProducts, filterOptions, query);
    
    // Apply supplier filter if provided
    if (supplierParam) {
      filtered = filtered.filter(product => product.supplier_id === supplierParam);
    }
    
    return filtered;
  }, [allProducts, filterOptions, query, supplierParam]);

  // חיפוש ספקים
  const filteredSuppliers = useMemo(() => {
    if (!query) return allSuppliers;
    
    return allSuppliers.filter(supplier => {
      const companyName = supplier.company_name?.toLowerCase() || '';
      const description = supplier.description?.toLowerCase() || '';
      const address = supplier.address?.toLowerCase() || '';
      const searchQuery = query.toLowerCase();
      
      return companyName.includes(searchQuery) || 
             description.includes(searchQuery) || 
             address.includes(searchQuery);
    });
  }, [allSuppliers, query]);
  
  // הפרדה בין מוצרים חדשים לישנים אם מסומן שזה מוצר חדש
  const { newProducts, otherProducts } = useMemo(() => {
    if (!isNewProduct || !supplierParam) {
      return { newProducts: [], otherProducts: filteredProducts };
    }
    
    // Get the newest products from this supplier (last 24 hours)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const newOnes = filteredProducts.filter(product => {
      const createdDate = new Date(product.created_at);
      return createdDate > oneDayAgo;
    });
    
    const others = filteredProducts.filter(product => {
      const createdDate = new Date(product.created_at);
      return createdDate <= oneDayAgo;
    });
    
    return {
      newProducts: newOnes,
      otherProducts: others
    };
  }, [filteredProducts, isNewProduct, supplierParam]);

  // Apply scroll effect to newly added products
  useEffect(() => {
    if (isNewProduct && newProducts.length > 0 && !loading) {
      // Scroll to the new products section smoothly
      const newProductsHeader = document.getElementById('new-products-section');
      if (newProductsHeader) {
        setTimeout(() => {
          newProductsHeader.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 500); // Small delay to ensure rendering is complete
      }
      
      // Show a toast notification
      toast({
        title: "מוצר חדש נוסף בהצלחה!",
        description: "המוצר שלך מוצג כעת בחנות",
      });
    }
  }, [isNewProduct, newProducts.length, loading]);

  // Get paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts]);

  // Pagination navigation
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (searchQuery, category) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category) params.set("category", category);
    
    // שמירה על סוג החיפוש (מוצרים/ספקים/הכל)
    if (searchType) params.set("searchType", searchType);
    
    // Reset page to 1 when changing search
    params.set("page", "1");
    
    setSearchParams(params);
    
    // עדכון אפשרויות הסינון אם הקטגוריה משתנה
    if (category && !filterOptions.categories.includes(category)) {
      setFilterOptions(prev => ({
        ...prev,
        categories: [category]
      }));
    }
  };

  // טיפול בשינוי טאב
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // עדכון פרמטר searchType ב-URL
    const params = new URLSearchParams(searchParams);
    params.set("searchType", tab);
    setSearchParams(params);
  };

  const handleFilterChange = (newOptions) => {
    // עדכון פרמטר הקטגוריה ב-URL
    const params = new URLSearchParams(searchParams);
    
    if (newOptions.categories !== undefined) {
      if (newOptions.categories.length === 1) {
        params.set("category", newOptions.categories[0]);
      } else {
        params.delete("category");
      }
    }
    
    // Reset page to 1 when changing filters
    params.set("page", "1");
    setSearchParams(params);

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
    
    // ניקוי פרמטר הקטגוריה מה-URL ואיפוס העמוד ל-1
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    params.set("page", "1");
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

  // עדכון activeTab כאשר searchType משתנה מה-URL
  useEffect(() => {
    if (searchType === "all") {
      // אם מדובר בחיפוש מהדף הראשי (all), נבדוק אם יש תוצאות ספקים
      if (query && filteredSuppliers.length > 0) {
        // אם יש ספקים שמתאימים לחיפוש, נציג את לשונית הספקים
        setActiveTab("suppliers");
      } else {
        // אחרת, ברירת המחדל היא מוצרים
        setActiveTab("products");
      }
    } else if (searchType === "suppliers") {
      setActiveTab("suppliers");
    } else {
      setActiveTab("products");
    }
  }, [searchType, query, filteredSuppliers.length]);

  // Render the main content of the search page
  const renderContent = () => {
    if (loading) {
      return <ProductGrid products={[]} loading={true} viewMode={viewMode} />;
    }
    
    return (
      <>
        {/* תצוגת טאבים */}
        <Tabs 
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-4"
        >
          <div className="flex justify-between items-center mb-2">
            <TabsList className="mb-2">
              <TabsTrigger value="products" className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>מוצרים {filteredProducts.length > 0 && `(${filteredProducts.length})`}</span>
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="flex items-center gap-1">
                <Store className="h-4 w-4" />
                <span>ספקים {filteredSuppliers.length > 0 && `(${filteredSuppliers.length})`}</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                aria-label="הצג בתצוגת רשת"
                className="border-gray-400 text-gray-800"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                aria-label="הצג בתצוגת רשימה"
                className="border-gray-400 text-gray-800"
              >
                <ListFilter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="products">
            {newProducts.length > 0 && (
              <div className="mb-4" id="new-products-section">
                <div className="flex items-center mb-3">
                  <h2 className="text-xl font-bold">מוצרים חדשים</h2>
                  <Badge variant="default" className="ml-2 bg-green-500">חדש</Badge>
                </div>
                <ProductGrid products={newProducts} loading={false} viewMode={viewMode} />
                <Separator className="my-4" />
              </div>
            )}
            
            <div>
              {newProducts.length > 0 ? (
                <h2 className="text-xl font-bold mb-3">מוצרים נוספים</h2>
              ) : (
                <h2 className="text-xl font-bold mb-3">
                  {query ? `תוצאות חיפוש עבור "${query}"` : 'כל המוצרים'}
                </h2>
              )}
              
              {filteredProducts.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">
                      מציג {Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, filteredProducts.length)}-
                      {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} מתוך {filteredProducts.length} מוצרים
                    </div>
                    {totalPages > 1 && (
                      <div className="text-sm text-gray-500">
                        עמוד {currentPage} מתוך {totalPages}
                      </div>
                    )}
                  </div>
                  
                  <ProductGrid products={paginatedProducts} loading={false} viewMode={viewMode} />
                  
                  {/* Pagination controls */}
                  {renderPagination()}
                  
                  {/* תצוגת תקציר של ספקים כאשר יש חיפוש כולל עם תוצאות ספקים */}
                  {searchType === "all" && filteredSuppliers.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-blue-800">נמצאו גם {filteredSuppliers.length} ספקים</h3>
                        <Button 
                          variant="link" 
                          onClick={() => handleTabChange("suppliers")}
                          className="text-blue-700 p-0 h-auto"
                        >
                          עבור לתוצאות הספקים
                        </Button>
                      </div>
                      <p className="text-sm text-blue-700">
                        החיפוש שלך התאים גם ל-{filteredSuppliers.length} ספקים. לחץ על הכפתור כדי לראות אותם.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">לא נמצאו מוצרים מתאימים לחיפוש שלך</p>
                  <Button 
                    variant="link" 
                    onClick={clearFilters}
                    className="mt-2 text-blue-600"
                  >
                    נקה סינון ונסה שוב
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="suppliers">
            <h2 className="text-xl font-bold mb-3">
              {query ? `ספקים התואמים לחיפוש "${query}"` : 'כל הספקים'}
            </h2>
            
            {filteredSuppliers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSuppliers.map(supplier => (
                    <SupplierCard key={supplier.id} supplier={supplier} />
                  ))}
                </div>
                
                {/* תצוגת תקציר של מוצרים כאשר יש חיפוש כולל עם תוצאות מוצרים */}
                {searchType === "all" && filteredProducts.length > 0 && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-blue-800">נמצאו גם {filteredProducts.length} מוצרים</h3>
                      <Button 
                        variant="link" 
                        onClick={() => handleTabChange("products")}
                        className="text-blue-700 p-0 h-auto"
                      >
                        עבור לתוצאות המוצרים
                      </Button>
                    </div>
                    <p className="text-sm text-blue-700">
                      החיפוש שלך התאים גם ל-{filteredProducts.length} מוצרים. לחץ על הכפתור כדי לראות אותם.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">לא נמצאו ספקים מתאימים לחיפוש שלך</p>
                {query && (
                  <Button 
                    variant="link" 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete("q");
                      setSearchParams(params);
                    }}
                    className="mt-2 text-blue-600"
                  >
                    נקה חיפוש ונסה שוב
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </>
    );
  };

  // Refresh products when a new product is added
  useEffect(() => {
    if (isNewProduct) {
      refreshProducts();
    }
  }, [isNewProduct]);

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-6 mb-8 gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-gray-200 hover:bg-gray-100 text-gray-700"
          aria-label="עמוד קודם"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-1 mx-1">
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            
            // Show limited page numbers for better UX
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className={
                    pageNumber === currentPage
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-gray-200 hover:bg-gray-100 text-gray-700"
                  }
                  aria-label={`עבור לעמוד ${pageNumber}`}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                >
                  {pageNumber}
                </Button>
              );
            }
            
            // Show ellipsis for gaps in page numbers
            if (
              (pageNumber === currentPage - 2 && pageNumber > 2) ||
              (pageNumber === currentPage + 2 && pageNumber < totalPages - 1)
            ) {
              return <span key={pageNumber} className="px-2">...</span>;
            }
            
            return null;
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-gray-200 hover:bg-gray-100 text-gray-700"
          aria-label="עמוד הבא"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-10">
      <PageMeta
        title={`חיפוש ${query ? `"${query}"` : ""} | סיטונימיל`}
        description={`חיפוש ${activeTab === "products" ? "מוצרים" : "ספקים"} באתר סיטונימיל${query ? ` - "${query}"` : ""}. מצא את המוצרים או הספקים הטובים ביותר בקטגוריה שלך.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2 text-right">מוצרים</h1>

            <Button 
              variant="outline"
              size="sm"
              onClick={refreshProducts}
              className="mb-2 border-gray-400 text-gray-800 hover:bg-gray-100"
              aria-label="רענן רשימת מוצרים"
            >
              רענון מוצרים
            </Button>
          </div>
          <SearchBar 
            initialQuery={query}
            initialCategory={categoryParam}
            onSearch={handleSearch}
            className="mb-3"
          />
          
          {/* תצוגת סינונים פעילים */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-2 p-2 bg-muted/40 rounded-lg justify-end" >
              <span className="text-sm font-medium">סינון פעיל:</span>
              
              {filterOptions.categories.map(category => (
                <Badge key={category} variant="secondary" className="gap-1 bg-background" >
                  {getCategoryLabel(category)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-gray-200 text-gray-700"
                    onClick={() => handleFilterChange({
                      categories: filterOptions.categories.filter(c => c !== category)
                    })}
                    aria-label={`הסר סינון קטגוריה ${getCategoryLabel(category)}`}
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
                    className="h-4 w-4 p-0 hover:bg-gray-200 text-gray-700"
                    onClick={() => handleFilterChange({ rating: 0 })}
                    aria-label="הסר סינון דירוג"
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
                    className="h-4 w-4 p-0 hover:bg-gray-200 text-gray-700"
                    onClick={() => handleFilterChange({ priceRange: [0, 500] })}
                    aria-label="הסר סינון טווח מחירים"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-800 hover:text-blue-900 hover:bg-blue-100 p-0 h-auto font-medium"
                onClick={clearFilters}
                aria-label="נקה את כל הסינונים"
              >
                נקה הכל
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-3 gap-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex items-center gap-2 border-gray-400 text-gray-800" aria-label="פתח אפשרויות סינון">
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
              className={`rounded-full ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setViewMode('grid')}
              aria-label="החלף לתצוגת רשת"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={`rounded-full ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setViewMode('list')}
              aria-label="החלף לתצוגת רשימה"
              aria-pressed={viewMode === 'list'}
            >
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 relative">
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
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}