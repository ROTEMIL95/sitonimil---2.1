import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Shield, Package, Search, UserPlus, LogIn, ShoppingBag, Store, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl, redirectToLogin } from "@/utils";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { Category } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import SupplierCard from "../components/SupplierCard";
import { motion, AnimatePresence } from "framer-motion";
import CategoryBanner from "../components/CategoryBanner";
import ExpandedCategoryBanner from "../components/ExpandedCategoryBanner";
import { supabase } from "@/api/supabaseClient";

import PageMeta from "@/components/PageMeta";
import ProductGrid from "../components/ProductGrid";
import { useProducts, useUsers, useCurrentUser } from "@/api/hooks";
import { QUERY_KEYS } from "@/api/entities";
import { prefetchData } from "@/api/queryClient";

// Optimized staggered animation settings
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Optimized fade-in animation with no motion (just opacity)
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Critical CSS styles for the hero heading - applied immediately
const criticalHeadingStyles = {
  display: 'block',
  color: '#2563EB', // text-blue-600
  fontWeight: '600',
  fontSize: 'clamp(3rem, 8vw, 5rem)', // responsive text size without media queries
  lineHeight: '1.2',
  textAlign: 'center',
  marginTop: '0',
};


export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isContentVisible, setIsContentVisible] = useState({
    hero: false,
    products: false,
    suppliers: false,
    features: false,
    recentProducts: false
  });
  const [popularCategories, setPopularCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const { toast } = useToast();

  // Define fallbackSuppliers before it's used in the useMemo hooks
  const fallbackSuppliers = [
    {
      id: "supplier1",
      company_name: "אלקטרוניקה בע\"מ",
      description: "ספק מוביל למוצרי אלקטרוניקה.",
      address: "תל אביב",
      verified: true
    },
    {
      id: "supplier2",
      company_name: "טקסטיל ישראל",
      description: "מגוון רחב של מוצרי טקסטיל איכותיים.",
      address: "חיפה",
      verified: true
    },
    {
      id: "supplier3",
      company_name: "בית וגן",
      description: "מוצרים לבית ולגינה במחירים סיטונאיים.",
      address: "ירושלים",
      verified: false
    }
  ];

  // React Query hooks
  const { data: currentUser } = useCurrentUser();
  const { data: productsData, isLoading: isProductsLoading } = useProducts();
  const { data: usersData, isLoading: isUsersLoading } = useUsers();
  
  // Derived states from React Query data
  const featuredProducts = React.useMemo(() => {
    if (!productsData) return [];
    
    // Filter and sort products
    const validProducts = productsData.filter(product => 
      product && 
      product.title && 
      product.price !== undefined && 
      product.status !== "inactive"
    );
    
    // Sort products to prioritize specific product ID
    return validProducts
      .sort((a, b) => {
        if (a.id === "efee1a4c-088d-4553-8738-77acc836e686") return -1;
        if (b.id === "efee1a4c-088d-4553-8738-77acc836e686") return 1;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 4);
  }, [productsData]);

  // Get recently added products
  const recentProducts = React.useMemo(() => {
    if (!productsData) return [];
    
    // Filter valid products
    const validProducts = productsData.filter(product => 
      product && 
      product.title && 
      product.price !== undefined && 
      product.status !== "inactive"
    );
    
    // Sort by created_at date (newest first)
    return validProducts
      .sort((a, b) => {
        // Fallback to IDs if created_at is not available
        const dateA = a.created_at ? new Date(a.created_at) : 0;
        const dateB = b.created_at ? new Date(b.created_at) : 0;
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [productsData]);

  const topSuppliers = React.useMemo(() => {
    if (!usersData) return fallbackSuppliers;
    
    const suppliers = usersData
      .filter(u => u.business_type === "supplier" && u.company_name)
      .slice(0, 3);
    
    return suppliers.length > 0 ? suppliers : fallbackSuppliers;
  }, [usersData]);

  // Prioritize rendering immediately without waiting for animation framework
  useEffect(() => {
    // Apply immediate visibility to hero section
    setIsContentVisible(prev => ({ ...prev, hero: true }));
    
    // Defer non-critical rendering
    const deferLoad = () => {
      setIsContentVisible(prev => ({ 
        ...prev, 
        products: true,
        suppliers: true,
        features: true,
        recentProducts: true
      }));
    };
    
    // Use a short timeout to prioritize the hero rendering first
    setTimeout(deferLoad, 100);
    
    // Prefetch data that might be needed on subsequent pages
    // This reduces load times when navigating to product or supplier pages
    prefetchData(QUERY_KEYS.PRODUCT.ALL, Product.list);
    prefetchData(QUERY_KEYS.USER.SUPPLIERS, User.getSuppliers);
  }, []);

  // Fetch categories from Supabase - keeping this outside React Query for now
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");

      if (error) {
        console.error("❌ Error fetching categories:", error);
        return;
      }

      const formattedCategories = data.map(category => ({
        value: category.value,
        label: category.label,
        image: category.image || "https://via.placeholder.com/150"
      }));

      setCategories(formattedCategories);
    };

    fetchCategories();
  }, []);

  // Fetch popular categories
  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const categories = await Category.getRandomCategories(5);
        setPopularCategories(categories);
      } catch (error) {
        console.error("Error fetching popular categories:", error);
        // Fallback categories if the API call fails
        setPopularCategories([
          { value: "electronics", label: "אלקטרוניקה", image: "https://via.placeholder.com/150" },
          { value: "clothing", label: "ביגוד", image: "https://via.placeholder.com/150" },
          { value: "home_goods", label: "מוצרי בית", image: "https://via.placeholder.com/150" },
          { value: "food_beverage", label: "מזון ומשקאות", image: "https://via.placeholder.com/150" },
          { value: "health_beauty", label: "בריאות ויופי", image: "https://via.placeholder.com/150" }
        ]);
      }
    };

    fetchPopularCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(createPageUrl("Search") + `?q=${encodeURIComponent(searchQuery)}&searchType=all`);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsContentVisible(prev => ({
              ...prev,
              [entry.target.dataset.section]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-section]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <PageMeta
        title="מסחר סיטונאי בישראל: מצא ספקים וקונים | Sitonim-il"
        description="Sitonim-il: פלטפורמת B2B המובילה בישראל למסחר סיטונאי. חבר בין ספקים לקונים, פרסם מוצרים, הרחב את העסק שלך וגלה הזדמנויות חדשות."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "name": "Sitonim-il",
              "url": "https://sitonimil.co.il", 
              "logo": "https://sitonimil.co.il/icons/icon-512x512.png", 
              "description": "פלטפורמת B2B המובילה בישראל למסחר סיטונאי, המחברת בין ספקים לקונים."
            },
            {
              "@type": "WebSite",
              "url": "https://sitonimil.co.il", 
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://sitonimil.co.il/products?q={search_term_string}" 
                },
                "query-input": "required name=search_term_string"
              }
            }
          ]
        }}
      />
      
      {/* קו הפרדה ושאדו מתחת להדר - מסגרת תחתונה אפורה ברוחב מלא */}
      <div className="w-full border-b border-gray-200 shadow-sm"></div>
      
      {/* תפריט קטגוריות - מוצג רק במחשב */}
      <nav className="hidden md:block bg-white border-t border-b py-4 px-6 overflow-x-auto whitespace-nowrap shadow-sm">
        <ul className="flex gap-8 text-sm font-medium text-gray-700 justify-center">
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <li key={cat.value} className="px-2">
                <Link
                  to={createPageUrl("Products") + `?category=${cat.value}`}
                  className="hover:text-blue-600 transition py-1 px-0.5 hover:bg-blue-50 rounded-md"
                >
                  {cat.label}
                </Link>
              </li>
            ))
          ) : (
            <li className="px-2">
              <span className="text-gray-400">טוען קטגוריות...</span>
            </li>
          )}
        </ul>
      </nav>
      
      <section 
        data-section="hero" 
        className="relative"
        aria-label="הקדמה ופתיחה"
      >
    {/* Simplified gradient background */}
    <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50"></div>

    <div className="relative container mx-auto px-3 md:px-3 md:py-2 lg:py-2 mt-5">
      <div className="max-w-3xl mx-auto text-center md:text-right ">
        {/* Main heading with class connecting to the critical CSS in index.html */}
        <h1 
            ref={headingRef}
              // className="relative mb-4 text-4xl md:text-5xl lg:text-6xl font-extrabold 
              // text-blue-500 bg-gradient-to-r from-blue-800 to-blue-500 
              // bg-clip-text text-transparent drop-shadow-sm font-['Arial'] "
              className="relative mb-4 text-6xl md:text-7xl lg:text-8xl font-extrabold 
              text-blue-500 bg-gradient-to-r from-blue-800 to-blue-500 
              bg-clip-text text-transparent drop-shadow-sm font-['Rubik']"
              style={criticalHeadingStyles}
            suppressHydrationWarning
          >
            פלטפורמת הסיטונאות המובילה בישראל
            <span 
              className="block h-1 bg-blue-400 w-24 md:w-32 mt-2 mx-auto rounded-full" 
              aria-hidden="true"
            ></span>
          </h1>

          {/* Enhanced Subheading with Improved Styling */}
          <h3 className="text-xl md:text-sm lg:text-lg font-semibold text-gray-800 text-center">
          מחפשים קונים? צריכים ספק? הכל מחכה לכם כאן
          </h3>
        
        {/* Search input - using simple div instead of motion.div */}
        <div className="mt-4">
          <div className="relative w-full max-w-xl sm:max-w-2xl mx-auto">
            {/* Search field with advanced styling */}
            <form onSubmit={handleSearch} className="bg-white p-1.5 rounded-full shadow-md flex items-center border border-gray-200 focus-within:border-blue-500 transition" role="search" aria-label="חיפוש באתר">
              
              {/* Search input with advanced effects */}
              <input
                type="text"
                placeholder=" חפשו מוצרים או ספקים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-1 px-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                aria-label="חיפוש מוצרים או ספקים"
              />

              {/* Search button with icon */}
              <Button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded-full flex items-center transition-all text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
                aria-label="חיפוש מוצרים וספקים"
              >
                <span className="hidden sm:inline">חיפוש</span>
                <Search className="w-3 h-3 sm:w-4 sm:h-4 ml-0 sm:ml-1"  />
              </Button>
            </form>
          </div>
        </div>
        
        {/* כפתורי הרשמה */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
            {/* ספק */}
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-right">
              <h2 className="text-green-700 font-bold text-xl mb-2">הרשמה כספק</h2>
              <ul className="text-sm text-gray-700 leading-relaxed">
                <li>✔️ פרסם מוצרים בחינם</li>
                <li>✔️ חיבור לקונים פוטנציאליים</li>
                <li>✔️ הגדל את החשיפה העסקית שלך</li>
              </ul>
              <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700" onClick={() => {
                localStorage.setItem("preferredUserType", "supplier");
                navigate(createPageUrl("Auth") + "?tab=register");
              }}>
              הצטרף כספק
              </button>
            </div>
            {/* קונה */}
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-right">
              <h2 className="text-blue-700 font-bold text-xl mb-2">הרשמה כקונה</h2>
              <ul className="text-sm text-gray-700 leading-relaxed">
                <li>✔️ מצא ספקים אמינים</li>
                <li>✔️ גש למוצרים סיטונאיים</li>
                <li>✔️ נהל קשר ישיר עם ספקים אמיתיים</li>
              </ul>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700" onClick={() => {
                localStorage.setItem("preferredUserType", "buyer");
                navigate(createPageUrl("Auth") + "?tab=register");
              }}>
             הצטרף כקונה
              </button>
            </div>
          </div>
        </div>
        
     
    </div>
  </section>
        
        <CategoryBanner />
        
        <section data-section="products" className={`transition-opacity duration-500 ${isContentVisible.products ? 'opacity-100' : 'opacity-0'}`} aria-labelledby="most-viewed-products-heading">
          <motion.section 
            className="container mx-auto px-4 md:px-6 py-8 bg-gradient-to-b from-gray-50 to-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div className="flex justify-between items-center mb-6" variants={fadeIn}>
                <div className="w-full sm:w-auto text-center sm:text-right">
                  <h2 id="most-viewed-products-heading" className="text-xl sm:text-xl md:text-2xl font-bold text-gray-900">המוצרים הנצפים ביותר</h2>
                </div>
                <div className="hidden sm:block">
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all px-4 py-2 rounded-full shadow-sm hover:shadow"
                  >
                    <Link to={createPageUrl("Products")} className="flex items-center gap-2 group">
                      <span className="text-sm font-medium">צפייה בכל המוצרים</span>
                      <div className="bg-blue-500 rounded-full p-1 transform group-hover:-translate-x-1 transition-all duration-200">
                        <ArrowLeft className="h-3 w-3 text-white" />
                      </div>
                    </Link>
                  </Button>
                </div>
              </motion.div>
              
              {/* כפתור לכל המוצרים למובייל - מוצג מתחת לכותרת */}
              <motion.div className="block sm:hidden text-center mb-6" variants={fadeIn}>
                <Button 
                  variant="ghost" 
                  asChild 
                  className="mx-auto border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all px-4 py-2 rounded-full shadow-sm hover:shadow"
                >
                  <Link to={createPageUrl("Search")} className="flex items-center gap-2 group">
                    <span className="text-sm font-medium">צפייה בכל המוצרים</span>
                    <div className="bg-blue-500 rounded-full p-1 transform group-hover:-translate-x-1 transition-all duration-200">
                      <ArrowLeft className="h-3 w-3 text-white" />
                    </div>
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <ProductGrid 
                  products={featuredProducts}
                  loading={isProductsLoading}
                  viewMode="grid"
                  className="mt-6"
                />
              </motion.div>
            </div>
          </motion.section>
        </section>
        
        <ExpandedCategoryBanner />

        <motion.section 
          className="py-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                className="flex flex-col items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-xl shadow-xl"
                variants={fadeIn}
              >
                <div className="bg-blue-500 p-2 sm:p-3 rounded-full shadow-md">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                  <span>ספקים?</span>
                  <span className="animate-bounce">🚀</span>
                  <span className="text-blue-600">זה הזמן שלכם לפרוץ</span>
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-gray-600">
                  פרסמו את המוצרים שלכם והגיעו לאלפי סוחרים בישראל – תוך דקות!
                </p>

                <Button 
                  size="lg"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={(e) => {
                    if (!currentUser) {
                      toast({
                        title: "נדרשת התחברות",
                        description: "עליך להתחבר או להירשם לפני פרסום מוצר",
                        duration: 5000,
                      });
                      localStorage.setItem("preferredUserType", "supplier");
                      localStorage.setItem("redirectAfterAuth", createPageUrl("UploadProduct"));
                      navigate(createPageUrl("Auth") + "?tab=register");
                    } else {
                      navigate(createPageUrl("UploadProduct"));
                    }
                  }}
                  aria-label="פרסום מוצר חדש"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    פרסום מוצר חדש
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.section>
        <section data-section="suppliers" className={`transition-opacity duration-500 ${isContentVisible.suppliers ? 'opacity-100' : 'opacity-0'}`} aria-labelledby="top-suppliers-heading">
          <motion.section 
            className="bg-blue-50 py-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-7xl mx-auto">
                <motion.div className="flex justify-between items-center mb-6" variants={fadeIn}>
                  <div className="w-full sm:w-auto">
                    <h2 id="top-suppliers-heading" className="text-lg font-bold text-gray-900 text-center sm:text-right">ספקים מובילים</h2>
                  </div>
                  <div className="hidden sm:block">
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all px-4 py-2 rounded-full shadow-sm hover:shadow"
                    >
                      <Link to={createPageUrl("Suppliers")} className="flex items-center gap-2 group">
                        <span className="text-sm font-medium">צפייה בכל הספקים</span>
                        <div className="bg-blue-500 rounded-full p-1 transform group-hover:-translate-x-1 transition-all duration-200">
                          <ArrowLeft className="h-3 w-3 text-white" />
                        </div>
                      </Link>
                    </Button>
                  </div>
                </motion.div>
                
                <div className="mb-3 flex justify-center sm:hidden">
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="mx-auto border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all px-4 py-2 rounded-full shadow-sm hover:shadow"
                  >
                    <Link to={createPageUrl("Suppliers")} className="flex items-center gap-2 group">
                      <span className="text-sm font-medium">צפייה בכל הספקים</span>
                      <div className="bg-blue-500 rounded-full p-1 transform group-hover:-translate-x-1 transition-all duration-200">
                        <ArrowLeft className="h-3 w-3 text-white" />
                      </div>
                    </Link>
                  </Button>
                </div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                  variants={staggerContainer}
                >
                  {isUsersLoading
                    ? Array(3).fill(0).map((_, i) => (
                        <motion.div 
                          key={i}
                          variants={fadeIn}
                          className="bg-white animate-pulse"
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 bg-gray-200 rounded-full" />
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                              </div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                            <div className="h-3 bg-gray-200 rounded w-full" />
                          </CardContent>
                        </motion.div>
                      ))
                    : topSuppliers.map((supplier, index) => (
                        <motion.div 
                          key={supplier.id}
                          variants={fadeIn}
                        >
                          <SupplierCard supplier={supplier} />
                        </motion.div>
                      ))}
                </motion.div>
              </div>
            </div>
          </motion.section>
        </section>
        
        <section data-section="features" className={`transition-opacity duration-500 ${isContentVisible.features ? 'opacity-100' : 'opacity-0'}`} aria-labelledby="why-join-heading">
          <motion.section 
            className="container mx-auto px-4 md:px-6 py-8 bg-gradient-to-b from-white to-gray-50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div 
                className="text-center max-w-3xl mx-auto mb-12"
                variants={fadeIn}
              >
                <h2 id="why-join-heading" className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">למה להצטרף לקהילת Sitonimil ?</h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">
                  הצטרפו לאלפי סוחרים וספקים שכבר נהנים מחיבורים, הזדמנויות עסקיות ומכירות בקנה מידה ארצי
                </p>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                variants={staggerContainer}
              >
                <motion.div variants={fadeIn}>
                  <Card className="border-none shadow-lg hover:shadow focus-within:ring-1 focus-within:ring-blue-500">
                    <CardContent className="p-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-700" />
                      </div>
                      <h3 className="font-medium text-sm mb-1 text-gray-900">ספקים מאומתים</h3>
                      <p className="text-xs text-gray-700">
                        כל הספקים שלנו עוברים תהליך אימות קפדני כדי להבטיח שאתם עובדים רק עם ספקים אמינים ואיכותיים.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeIn}>
                  <Card className="border-none shadow-lg hover:shadow focus-within:ring-1 focus-within:ring-blue-500">
                    <CardContent className="p-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <Shield className="h-4 w-4 text-blue-700" />
                      </div>
                      <h3 className="font-medium text-sm mb-1 text-gray-900">פרסום מוצרים בקנה מידה ארצי</h3>
                      <p className="text-xs text-gray-700">
                      פרסום חופשי, חשיפה אמיתית – Sitonimil זה המקום להתחיל בו
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeIn}>
                  <Card className="border-none shadow-lg hover:shadow focus-within:ring-1 focus-within:ring-blue-500">
                    <CardContent className="p-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <Package className="h-4 w-4 text-blue-700" />
                      </div>
                      <h3 className="font-medium text-sm mb-1 text-gray-900"> כל מה שצריך בעסק הסיטונאי שלך</h3>
                      <p className="text-xs text-gray-700">
                      מערכת מתקדמת שתוכננה במיוחד למסחר סיטונאי – פשוטה, מהירה ונגישה                
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        
          {/* New section: Recently added products */}
          <section data-section="recentProducts" className={`transition-opacity duration-500 ${isContentVisible.recentProducts ? 'opacity-100' : 'opacity-0'}`} aria-labelledby="recently-added-products-heading">
            <motion.section 
              className="container mx-auto px-4 md:px-6 py-10 bg-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              <div className="max-w-7xl mx-auto">
                <motion.div className="flex justify-between items-center mb-6" variants={fadeIn}>
                  <div className="w-full sm:w-auto text-center sm:text-right">
                    <h2 id="recently-added-products-heading" className="text-xl sm:text-xl md:text-2xl font-bold text-gray-900">הועלו לאחרונה</h2>
                    <p className="text-sm text-gray-500 mt-1">המוצרים החדשים ביותר באתר</p>
                  </div>
                  <div className="hidden sm:block">
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all px-4 py-2 rounded-full shadow-sm hover:shadow"
                    >
                      <Link to={createPageUrl("Products") + "?sort=newest"} className="flex items-center gap-2 group">
                        <span className="text-sm font-medium">צפייה בכל המוצרים החדשים</span>
                        <div className="bg-green-500 rounded-full p-1 transform group-hover:-translate-x-1 transition-all duration-200">
                          <ArrowLeft className="h-3 w-3 text-white" />
                        </div>
                      </Link>
                    </Button>
                  </div>
                </motion.div>
                
                {/* כפתור למובייל */}
                <motion.div className="block sm:hidden text-center mb-6" variants={fadeIn}>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="mx-auto border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all px-4 py-2 rounded-full shadow-sm hover:shadow"
                  >
                    <Link to={createPageUrl("Products") + "?sort=newest"} className="flex items-center gap-2 group">
                      <span className="text-sm font-medium">צפייה בכל המוצרים החדשים</span>
                      <div className="bg-green-500 rounded-full p-1 transform group-hover:-translate-x-1 transition-all duration-200">
                        <ArrowLeft className="h-3 w-3 text-white" />
                      </div>
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div variants={fadeIn}>
                  <ProductGrid 
                    products={recentProducts}
                    loading={isProductsLoading}
                    viewMode="grid"
                    className="mt-6"
                  />
                </motion.div>
              </div>
            </motion.section>
          </section>
          
          <motion.section 
            className="bg-gradient-to-r from-blue-800 to-indigo-900 py-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            aria-labelledby="cta-heading"
          >
            <div className="container mx-auto px-4 md:px-6 text-center">
              <div className="max-w-7xl mx-auto">
                <motion.h2 
                  id="cta-heading"
                  className="text-xl font-bold text-white mb-3"
                  variants={fadeIn}
                >
                  מוכנים להתחיל?
                </motion.h2>
                <motion.p 
                  className="text-white/90 text-sm max-w-3xl mx-auto mb-4"
                  variants={fadeIn}
                >
                  הצטרפו לאלפי ספקים וסוחרים אחרים בפלטפורמה הסיטונאית המובילה. מחכים לכם!
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap gap-2 justify-center"
                  variants={fadeIn}
                >
                  {currentUser ? (
                    <Button
                      className="bg-white text-blue-700 hover:bg-gray-100 border border-white hover:border-gray-200 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 font-medium text-xs py-1 px-3"
                      onClick={() => navigate(redirectToLogin("Home"))}
                    >
                      <Search className="ml-1 h-3 w-3" />
                      התחל לחפש מוצרים
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="bg-white text-blue-700 hover:bg-gray-100 border border-white hover:border-gray-200 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 font-medium text-xs py-1 px-3"
                        onClick={() => navigate(redirectToLogin("Home"))}
                      >
                        <LogIn className="ml-1 h-3 w-3" />
                        התחבר
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.section>
        </section>
      </>
    );
  }