import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Product } from "@/api/entities";
import { QUERY_KEYS } from "@/api/entities";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { X, SlidersHorizontal, ListFilter, Grid3X3, Package, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import ProductFilter from "@/components/ProductFilter";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SupplierCard from "@/components/SupplierCard";
import PageMeta from "@/components/PageMeta";
import { useProductSearch, useProducts, useUsers, useProductsByCategory, useProductsBySupplier } from "@/api/hooks";
import { createPageUrl } from "@/utils";

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

// הגדרת מפתח המטמון עבור localStorage
const SEARCH_CACHE_KEY = "sitonim_search_cache";

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
  const [viewMode, setViewMode] = useState(() => {
    // שחזור תצוגה אחרונה מה-localStorage
    return localStorage.getItem("sitonim_view_mode") || "grid";
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Filter state - מיכאל את מצב הסינון מה-localStorage בטעינה ראשונית
  const [filterOptions, setFilterOptions] = useState(() => {
    // נסה לשחזר את הסינון האחרון מה-localStorage
    try {
      const savedFilters = localStorage.getItem(SEARCH_CACHE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        // אם יש קטגוריה ב-URL, נשתמש בה במקום הקטגוריה השמורה
        if (categoryParam) {
          return {
            ...parsed,
            categories: categoryParam ? [categoryParam] : []
          };
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error loading saved filters:", e);
    }
    
    // ברירת מחדל אם אין מידע שמור או שיש שגיאה
    return {
      ...initialFilterOptions,
      categories: categoryParam ? [categoryParam] : []
    };
  });

  // שמירת הסינון ל-localStorage בכל שינוי
  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(filterOptions));
    } catch (e) {
      console.error("Error saving filters to localStorage:", e);
    }
  }, [filterOptions]);

  // שמירת מצב התצוגה ל-localStorage
  useEffect(() => {
    localStorage.setItem("sitonim_view_mode", viewMode);
  }, [viewMode]);

  // שימוש בהוקים המתאימים של React Query בהתאם לפרמטרים, עם מניעת רענון מיותר
  const {
    data: productsData = [],
    isLoading: productsLoading,
  } = query && query.length > 2
    ? useProductSearch(query)
    : categoryParam
      ? useProductsByCategory(categoryParam)
      : supplierParam
        ? useProductsBySupplier(supplierParam)
        : useProducts();

  // השתמש ב-React Query כדי לטעון משתמשים, עם מניעת רענון מיותר
  const {
    data: usersList = [],
    isLoading: usersLoading,
  } = useUsers();

  // עיבוד רשימת הספקים מתוך רשימת המשתמשים המלאה
  const { suppliersMap, suppliersList } = useMemo(() => {
    const suppliersMap = {};
    const suppliersList = [];
    
    usersList.forEach(user => {
      suppliersMap[user.id] = user;
      
      if (user.business_type === "supplier" && user.company_name) {
        suppliersList.push(user);
      }
    });
    
    return { suppliersMap, suppliersList };
  }, [usersList]);

  // חישוב המוצרים המסוננים באמצעות useMemo
  const filteredProducts = useMemo(() => {
    // אם הנתונים עדיין טוענים, נחזיר מערך ריק
    if (productsLoading) return [];
    
    // סינון מוצרים לא תקינים
    const validProducts = productsData.filter(product => 
      product && product.title && product.price !== undefined
    );
    
    return filterAndSortProducts(validProducts, filterOptions, query);
  }, [productsData, filterOptions, query, productsLoading]);

  // חיפוש ספקים
  const filteredSuppliers = useMemo(() => {
    if (!query || usersLoading) return suppliersList;
    
    return suppliersList.filter(supplier => {
      const companyName = supplier.company_name?.toLowerCase() || '';
      const description = supplier.description?.toLowerCase() || '';
      const address = supplier.address?.toLowerCase() || '';
      const searchQuery = query.toLowerCase();
      
      return companyName.includes(searchQuery) || 
             description.includes(searchQuery) || 
             address.includes(searchQuery);
    });
  }, [suppliersList, query, usersLoading]);
  
  // חישוב המוצרים לעמוד הנוכחי
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);
  
  // חישוב מספר העמודים הכולל
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts]);

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
    if (isNewProduct && newProducts.length > 0 && !productsLoading) {
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
  }, [isNewProduct, newProducts.length, productsLoading]);

  // Pagination navigation
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // פונקציה להטמנה מוקדמת של הדף הבא והקודם
  const prefetchAdjacentPages = () => {
    if (!query && !categoryParam && !supplierParam) {
      return; // אם אין חיפוש, אין צורך בהטמנה מוקדמת של דפים נוספים
    }
    
    // הטמן מראש את הדף הבא
    if (currentPage < totalPages) {
      const nextPageParams = new URLSearchParams(searchParams);
      nextPageParams.set("page", (currentPage + 1).toString());
      // שמור את הפרמטרים כדי לדעת מה להטמין
      const nextPageQuery = nextPageParams.toString();
      
      // קבע את הדף הבא במטמון
      if (query && query.length > 2) {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.PRODUCT.SEARCH(query),
          queryFn: () => Product.search(query)
        });
      } else if (categoryParam) {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.PRODUCT.BY_CATEGORY(categoryParam), 
          queryFn: () => Product.getByCategory(categoryParam)
        });
      } else if (supplierParam) {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.PRODUCT.BY_SUPPLIER(supplierParam),
          queryFn: () => Product.getBySupplier(supplierParam)
        });
      }
    }
  };

  // בצע הטמנה מוקדמת כאשר המשתמש נמצא בדף למשך זמן מה
  useEffect(() => {
    const timer = setTimeout(prefetchAdjacentPages, 1000);
    return () => clearTimeout(timer);
  }, [currentPage, query, categoryParam, supplierParam]);

  // Function to refresh product data
  const refreshProducts = () => {
    // Invalidate and refetch all relevant queries based on current search parameters
    if (query && query.length > 2) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT.SEARCH(query) });
    } else if (categoryParam) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT.BY_CATEGORY(categoryParam) });
    } else if (supplierParam) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT.BY_SUPPLIER(supplierParam) });
    } else {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT.ALL });
    }
    
    toast({
      description: "מרענן נתונים...",
      duration: 1500,
    });
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

  // Generate ItemList schema for structured data
  const itemListSchema = useMemo(() => {
    if (!paginatedProducts || paginatedProducts.length === 0) {
      return null;
    }

    const items = paginatedProducts.map((product, index) => ({
      "@type": "ListItem",
      position: (currentPage - 1) * PRODUCTS_PER_PAGE + index + 1,
      item: {
        "@type": "Product",
        url: `${window.location.origin}${createPageUrl("Product")}?id=${product.id}`,
        name: product.title,
        ...(product.images && product.images.length > 0 && { image: product.images[0] }),
      
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: items,
      // Optional: Add name and description for the ItemList itself
      name: query ? `תוצאות חיפוש עבור "${query}"` : categoryParam ? `מוצרים בקטגוריית ${getCategoryLabel(categoryParam)}` : "רשימת מוצרים",
      description: `עמוד ${currentPage} מתוך ${totalPages} של ${query ? `תוצאות חיפוש עבור "${query}"` : categoryParam ? `מוצרים בקטגוריית ${getCategoryLabel(categoryParam)}` : "מוצרים"}`
    };
  }, [paginatedProducts, currentPage, totalPages, query, categoryParam]);

  // Render the main content of the search page
  const renderContent = () => {
    if (productsLoading || usersLoading) {
      return <ProductGrid products={[]} loading={true} viewMode={viewMode} />;
    }
    
    return (
      <>
        {/* תצוגת טאבים */}
        <Tabs 
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-2"
        >
        
          
          <TabsContent value="products">
          
            <div>
            
              {filteredProducts.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-1">
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
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
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
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">לא נמצאו מוצרים מתאימים לחיפוש שלך</p>
                  <Button 
                    variant="link" 
                    onClick={clearFilters}
                    className="mt-1 text-blue-600"
                  >
                    נקה סינון ונסה שוב
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="suppliers">
            <h2 className="text-xl font-bold mb-2">
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
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
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
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">לא נמצאו ספקים מתאימים לחיפוש שלך</p>
                {query && (
                  <Button 
                    variant="link" 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete("q");
                      setSearchParams(params);
                    }}
                    className="mt-1 text-blue-600"
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

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-4 mb-4 gap-1">
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
    <div className="min-h-screen bg-gray-50 pt-12 md:pt-18 pb-6">
      <PageMeta
        title={
          query
            ? `חיפוש "${query}" | Sitonim-il`
            : categoryParam
              ? `קטגוריית ${getCategoryLabel(categoryParam)} | Sitonim-il`
              : supplierParam
                ? `מוצרי ${suppliersMap[supplierParam]?.company_name || 'ספק'} | Sitonim-il`
                : `כל המוצרים | Sitonim-il`
        }
        description={`חיפוש ${activeTab === "products" ? "מוצרים" : "ספקים"} באתר Sitonim-il${query ? ` - "${query}"` : ""}${categoryParam ? ` בקטגוריית ${getCategoryLabel(categoryParam)}` : ''}. מצא את המוצרים או הספקים הטובים ביותר בקטגוריה שלך.`}
        schema={itemListSchema}
      />

      <div className="max-w-[1600px] mx-auto px-3 md:px-4">
        {/* Breadcrumbs and Back Button */}
        <div className="flex justify-between items-center mb-2 text-sm">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-gray-500">
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  דף הבית
                </Link>
              </li>
              {(categoryParam || supplierParam || query) && (
                <li className="flex items-center gap-1.5">
                  <span className="text-gray-400">/</span>
                  {categoryParam ? (
                    <span>קטגוריה: {getCategoryLabel(categoryParam)}</span>
                  ) : supplierParam ? (
                    <span>ספק: {suppliersMap[supplierParam]?.company_name || 'ספק לא ידוע'}</span>
                  ) : (
                    <span>חיפוש: "{query}"</span>
                  )}
                </li>
              )}
            </ol>
          </nav>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            חזור לדף הבית
          </Button>
        </div>

        <div className="max-w-8xl mx-auto mb-1">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-xl font-bold text-right">
              {categoryParam ? `קטגוריית ${getCategoryLabel(categoryParam)}` : supplierParam ? `מוצרי ${suppliersMap[supplierParam]?.company_name || 'ספק'}` : query ? `תוצאות חיפוש עבור "${query}"` : "כל המוצרים"}
            </h1>
          </div>
          <SearchBar 
            initialQuery={query}
            initialCategory={categoryParam}
            onSearch={handleSearch}
            className="mb-2 pt-2"
          />
          
          {/* תצוגת סינונים פעילים */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1 mt-1 p-1.5 bg-blue-50/50 rounded-lg justify-end border border-blue-100 mb-1">
              <span className="text-xs font-medium text-blue-700">סינון פעיל:</span>
              
              {filterOptions.categories.map(category => (
                <Badge key={category} variant="secondary" className="gap-1 bg-white border border-blue-100 text-blue-700 h-6 px-2" >
                  {getCategoryLabel(category)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3.5 w-3.5 p-0 hover:bg-gray-200 text-gray-700"
                    onClick={() => handleFilterChange({
                      categories: filterOptions.categories.filter(c => c !== category)
                    })}
                    aria-label={`הסר סינון קטגוריה ${getCategoryLabel(category)}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              ))}
              
              {filterOptions.rating > 0 && (
                <Badge variant="secondary" className="gap-1 bg-white border border-blue-100 text-blue-700 h-6 px-2">
                  דירוג: {filterOptions.rating}+
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3.5 w-3.5 p-0 hover:bg-gray-200 text-gray-700"
                    onClick={() => handleFilterChange({ rating: 0 })}
                    aria-label="הסר סינון דירוג"
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )}
              
              {(filterOptions.priceRange[0] > 0 || filterOptions.priceRange[1] < 500) && (
                <Badge variant="secondary" className="gap-1 bg-white border border-blue-100 text-blue-700 h-6 px-2">
                  מחיר: ₪{filterOptions.priceRange[0]}-₪{filterOptions.priceRange[1]}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3.5 w-3.5 p-0 hover:bg-gray-200 text-gray-700"
                    onClick={() => handleFilterChange({ priceRange: [0, 500] })}
                    aria-label="הסר סינון טווח מחירים"
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-0 h-6 px-1 font-medium text-xs"
                onClick={clearFilters}
                aria-label="נקה את כל הסינונים"
              >
                נקה הכל
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-1 gap-2">
          <div className="flex items-center gap-1.5">
            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1.5 p-6 text-2xl border-gray-300 rounded-full text-gray-700" aria-label="פתח אפשרויות סינון">
                  <SlidersHorizontal className="w-4 h-4" />
                  סינון 
                  {hasActiveFilters && (
                    <Badge variant="default" className="h-5 ml-1.5 bg-blue-600 text-xs">
                      {filterOptions.categories.length + (filterOptions.rating > 0 ? 1 : 0) + 
                       ((filterOptions.priceRange[0] > 0 || filterOptions.priceRange[1] < 500) ? 1 : 0) +
                       ((filterOptions.minOrderRange[0] > 0 || filterOptions.minOrderRange[1] < 200) ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  
                  
                  <div className="flex-1 overflow-y-auto p-4 pb-24">
                    <div className="text-sm text-blue-700 mb-3 font-medium" dir="rtl">
                      נמצאו {filteredProducts.length} מוצרים
                    </div>
                    <ProductFilter
                      options={filterOptions}
                      onChange={handleFilterChange}
                      onReset={clearFilters}
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end">
                    <Button 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700 min-w-[150px] " 
                      onClick={() => setIsMobileFilterOpen(false)}
                    >
                      הצג תוצאות ({filteredProducts.length})
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
         
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon"
              className={`rounded-full h-7 w-7 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setViewMode('grid')}
              aria-label="החלף לתצוגת רשת"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={`rounded-full h-7 w-7 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setViewMode('list')}
              aria-label="החלף לתצוגת רשימה"
              aria-pressed={viewMode === 'list'}
            >
              <ListFilter className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex relative mt-0.5">          
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}