import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Shield, Package, Search, UserPlus, LogIn, ShoppingBag, Store, Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl, redirectToLogin } from "@/utils";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { Category } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import ProductCard from "../components/ProductCard";
import SupplierCard from "../components/SupplierCard";
import { motion, AnimatePresence } from "framer-motion";
import CategoryBanner from "../components/CategoryBanner";
import ExpandedCategoryBanner from "../components/ExpandedCategoryBanner";
import { supabase } from "@/api/supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  fontWeight: '800',
  fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', // responsive text size without media queries
  lineHeight: '1.2',
  textAlign: 'center',
  marginTop: '0',
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [isContentVisible, setIsContentVisible] = useState({
    hero: false,
    products: false,
    suppliers: false,
    features: false
  });
  const [popularCategories, setPopularCategories] = useState([]);
  const navigate = useNavigate();
  const headingRef = useRef(null);

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
        features: true 
      }));
    };
    
    // Use a short timeout to prioritize the hero rendering first
    setTimeout(deferLoad, 100);
  }, []);

  // Fetch categories from Supabase
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

  // We'll use the categories fetched from the server
  // No local fallback needed

  useEffect(() => {
    const loadData = async () => {
      try {
        try {
          const userData = await User.me();
          setCurrentUser(userData);
        } catch (error) {
          console.log("User not logged in");
        }

        try {
          console.log("Starting to fetch products...");
          const allProducts = await Product.list();
          console.log("Raw products from backend:", allProducts);
          
          // Filter and sort products
          const validProducts = allProducts.filter(product => 
            product && 
            product.title && 
            product.price !== undefined && 
            product.status !== "inactive"
          );
          console.log("Valid products after filtering:", validProducts);
          
          const sortedProducts = validProducts
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4);
          console.log("Final sorted products:", sortedProducts);
          
          setFeaturedProducts(sortedProducts);
        } catch (error) {
          console.error("Error loading products:", error);
          setFeaturedProducts([]); // Set empty array instead of placeholder
        }

        try {
          const usersData = await User.list();
          const suppliers = usersData
            .filter(u => u.business_type === "supplier" && u.company_name)
            .slice(0, 3);
          setTopSuppliers(suppliers.length > 0 ? suppliers : fallbackSuppliers);
        } catch (error) {
          console.error("Error loading suppliers:", error);
          setTopSuppliers(fallbackSuppliers);
        }

      } catch (error) {
        console.error("Error loading data:", error);
      }
      setLoading(false);
    };

    loadData();

    const updateTimer = setTimeout(() => {
      setLastUpdated(new Date());
      toast({
        title: "עדכון אחרון",
        description: "האתר עודכן כעת!",
        duration: 3000,
      });
    }, 60000);

    return () => clearTimeout(updateTimer);
  }, [lastUpdated, toast]);

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

  const formattedLastUpdate = lastUpdated.toLocaleString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      window.location.href = createPageUrl("Search") + `?q=${encodeURIComponent(searchQuery)}`;
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
     <section 
       data-section="hero" 
       className="relative"
       aria-label="הקדמה ופתיחה"
     >
  {/* Simplified gradient background */}
  <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50"></div>

  <div className="relative container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8">
    <div className="max-w-3xl mx-auto text-center md:text-right ">
      {/* Main heading with class connecting to the critical CSS in index.html */}
      <h1 
          ref={headingRef}
            className="relative mb-4 text-4xl md:text-5xl lg:text-6xl font-extrabold 
            text-blue-600 bg-gradient-to-r from-blue-700 to-blue-500 
            bg-clip-text text-transparent drop-shadow-sm font-['Arial'] "
          suppressHydrationWarning
        >
          פלטפורמת הסיטונאות המובילה בישראל
          <span 
            className="block h-1 bg-blue-500 w-20 md:w-24 mt-1 mx-auto md:mx-0" 
            aria-hidden="true"
          ></span>
        </h1>

        {/* Enhanced Subheading with Improved Styling */}
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold 
          text-transparent bg-clip-text 
          bg-gradient-to-r from-gray-800 to-gray-600 
          mb-4 tracking-wide leading-relaxed
          hover:from-blue-700 hover:to-blue-500 
          transition-all duration-300 ease-in-out ">
          מחברים בין ספקים איכותיים לסוחרים בכל רחבי הארץ 
        </h2>
      
      {/* Search input - using simple div instead of motion.div */}
      <div className="mt-4">
        <div className="relative w-full max-w-xl sm:max-w-2xl mx-auto">
          {/* Search field with advanced styling */}
          <div className="bg-white p-1.5 rounded-full shadow-md flex items-center border border-gray-200 focus-within:border-blue-500 transition" role="search" aria-label="חיפוש באתר">
            
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
              aria-label="חיפוש מוצרים"
            >
              <span className="hidden sm:inline">חיפוש</span>
              <Search className="w-3 h-3 sm:w-4 sm:h-4 ml-0 sm:ml-1"  />
            </Button>
          </div>
        </div>
      </div>
      
      {/* כפתורי הרשמה */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3">הצטרפו לקהילה שלנו עכשיו:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl mx-auto">
          <div className="shadow-sm rounded-lg overflow-hidden">
            <Link 
              to={createPageUrl("Auth") + "?tab=register"}
              className="block h-full"
              onClick={() => localStorage.setItem("preferredUserType", "buyer")}
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors p-3 flex flex-col items-center text-center h-full border border-blue-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-1 border border-blue-300">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium mb-1 text-gray-800">הרשמה כקונה</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">הרשם כקונה כדי לחפש ולרכוש מוצרים מספקים מובילים</p>
                <div className="mt-auto bg-blue-700 text-white py-1 px-2 rounded-md text-xs font-medium inline-flex items-center gap-1 hover:bg-blue-800 transition-colors">
                  <UserPlus className="h-3 w-3" />
                  <span>הרשם עכשיו</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="shadow-sm rounded-lg overflow-hidden">
            <Link 
              to={createPageUrl("Auth") + "?tab=register"}
              className="block h-full"
              onClick={() => localStorage.setItem("preferredUserType", "supplier")}
            >
              <div className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-colors p-3 flex flex-col items-center text-center h-full border border-green-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-1 border border-green-300">
                  <Store className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-sm font-medium mb-1 text-gray-800">הרשמה כספק</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">הצג את המוצרים שלך וחבר בין העסק שלך לקונים פוטנציאליים</p>
                <div className="mt-auto bg-green-600 text-white py-1 px-2 rounded-md text-xs font-medium inline-flex items-center gap-1 hover:bg-green-700 transition-colors">
                  <Building className="h-3 w-3" />
                  <span>הרשם כספק</span>
                </div>
              </div>
            </Link>
          </div>
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
            <motion.div className="flex justify-between items-center mb-8" variants={fadeIn}>
              <div>
                <h2 id="most-viewed-products-heading" className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">המוצרים הנצפים ביותר :</h2>
              </div>
              <div>
                <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus-visible:ring-offset-2 transition-colors">
                  <Link to={createPageUrl("Search")} className="flex items-center gap-1 group">
                    <span className="text-sm sm:text-base font-medium">צפייה בכל המוצרים</span>
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              variants={staggerContainer}
            >
              {loading
                ? Array(4).fill(0).map((_, i) => (
                    <motion.div
                      key={i}
                      variants={fadeIn}
                      className="bg-white p-4 rounded-lg shadow-sm animate-pulse"
                    >
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </motion.div>
                  ))
                : featuredProducts.length > 0 ? (
                    featuredProducts.map((product, index) => (
                      <motion.div 
                        key={product.id}
                        variants={fadeIn}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      אין מוצרים זמינים כרגע
                    </div>
                  )}
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
              <motion.div className="flex justify-between items-center mb-3" variants={fadeIn}>
                <div>
                  <h2 id="top-suppliers-heading" className="text-lg font-bold text-gray-900">ספקים מובילים</h2>
                </div>
                <div>
                  <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 focus:ring-1 focus:ring-blue-500 focus-visible:ring-offset-1 transition-colors text-xs py-1 px-2">
                    <Link to={createPageUrl("Suppliers")} className="flex items-center gap-1 group">
                      <span className="text-xs">צפייה בכל הספקים</span>
                      <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                variants={staggerContainer}
              >
                {loading
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
                <Card className="border-none shadow-sm hover:shadow focus-within:ring-1 focus-within:ring-blue-500">
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
                <Card className="border-none shadow-sm hover:shadow focus-within:ring-1 focus-within:ring-blue-500">
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
                <Card className="border-none shadow-sm hover:shadow focus-within:ring-1 focus-within:ring-blue-500">
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
                      התחברות
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