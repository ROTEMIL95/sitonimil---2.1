import React, { useState, useEffect } from "react";
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
import { motion } from "framer-motion";
import CategoryBanner from "../components/CategoryBanner";
import ExpandedCategoryBanner from "../components/ExpandedCategoryBanner";
import { supabase } from "@/api/supabaseClient";

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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
     <section data-section="hero" className={`relative transition-opacity duration-500 ${isContentVisible.hero ? 'opacity-100' : 'opacity-0'}`}>
  {/* רקע עדין עם gradient */}
  <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50"></div>

  <div className="relative container mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16">
    <motion.div 
      className="max-w-4xl mx-auto text-center md:text-right"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* כותרת ראשית */}
      <motion.h1 variants={fadeIn} className="text-blue-600 leading-tight text-4xl sm:text-5xl lg:text-6xl font-extrabold">
        הפלטפורמה <span className="text-blue-500">הראשונה והגדולה</span> בישראל  
        <br className="hidden md:inline" /> לחיבור <span className="text-[rgba(41,110,145,0.86)]">סיטונאים וסוחרים</span>
        <span className="block h-1 bg-blue-300 w-24 mt-2 mx-auto md:mx-0"></span>
      </motion.h1>

      {/* תת-כותרת */}
      <motion.h2 variants={fadeIn} className="text-lg text-gray-700 font-semibold mt-3">
        מצאו מוצרים וספקים וגלו <span className="text-blue-600">הזדמנויות עסקיות חדשות</span> עכשיו!  
      </motion.h2>

      {/* שדה חיפוש */}
      <motion.div variants={fadeIn} className="mt-6">
  <div className="relative w-full max-w-2xl">
    {/* שדה החיפוש עם עיצוב מתקדם */}
    <div className="bg-white p-3 rounded-full shadow-lg flex items-center border border-gray-200 focus-within:border-blue-500 transition">
      

      {/* שדה החיפוש עם אפקטים מתקדמים */}
      <input
        type="text"
        placeholder=" חפשו מוצרים, קטגוריות או ספקים..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent border-none py-2 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
      />

      {/* כפתור חיפוש מעוגל עם אייקון */}
      <Button
        type="submit"
        className="bg-[rgb(2,132,199)] hover:bg-[rgb(2,132,299)] text-white px-5 py-2 rounded-full flex items-center transition-all"
      >
        <span className="hidden sm:inline">חיפוש</span>
        <Search className="w-5 h-5 ml-2 sm:ml-3" />
      </Button>
    </div>
  </div>
</motion.div>

      {/* כפתורי הרשמה */}
      <motion.div 
        variants={fadeIn} 
        className="mt-8 md:mt-10"
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-lg font-medium text-gray-800 mb-4">הצטרפו לקהילה שלנו</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
          <motion.div 
            variants={fadeIn} 
            custom={0} 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="shadow-md rounded-lg overflow-hidden"
          >
            <Link 
              to={createPageUrl("Auth") + "?tab=register"}
              className="block h-full"
              onClick={() => localStorage.setItem("preferredUserType", "buyer")}
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors p-4 flex flex-col items-center text-center h-full border border-blue-200 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2 border-2 border-blue-300">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-base font-semibold mb-1 text-gray-800">הרשמה כקונה</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">הרשם כקונה כדי לחפש ולרכוש מוצרים מספקים מובילים</p>
                <div className="mt-auto bg-blue-600 text-white py-1.5 px-3 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 hover:bg-blue-700 transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span>הרשם עכשיו</span>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div 
            variants={fadeIn} 
            custom={1} 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="shadow-md rounded-lg overflow-hidden"
          >
            <Link 
              to={createPageUrl("Auth") + "?tab=register"}
              className="block h-full"
              onClick={() => localStorage.setItem("preferredUserType", "supplier")}
            >
              <div className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-colors p-4 flex flex-col items-center text-center h-full border border-green-200 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2 border-2 border-green-300">
                  <Store className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-base font-semibold mb-1 text-gray-800">הרשמה כספק</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">הצג את המוצרים שלך וחבר בין העסק שלך לקונים פוטנציאליים</p>
                <div className="mt-auto bg-green-600 text-white py-1.5 px-3 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 hover:bg-green-700 transition-colors">
                  <Building className="h-4 w-4" />
                  <span>הרשם כספק</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  </div>
</section>
      
      <CategoryBanner />
      
      <section data-section="products" className={`transition-opacity duration-500 ${isContentVisible.products ? 'opacity-100' : 'opacity-0'}`}>
        <motion.section 
          className="container mx-auto px-4 md:px-6 py-16 bg-gradient-to-b from-gray-50 to-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="flex justify-between items-center mb-8" variants={fadeIn}>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">המוצרים הנצפים ביותר :</h2>
              </div>
              <div>
                <Button variant="ghost" asChild>
                  <Link to={createPageUrl("Search")} className="flex items-center gap-1 group">
                    צפייה בכל המוצרים
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-xl"
              variants={fadeIn}
            >
              <div className="bg-blue-500 p-3 rounded-full shadow-md">
                <Package className="h-6 w-6 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                ספקים? 
                <span className="animate-bounce">🚀</span>
                <span className="text-blue-600">זה הזמן שלכם לפרוץ</span>
              </h2>

              <p className="text-base text-gray-600 max-w-xl">
                פרסמו את המוצרים שלכם והגיעו לאלפי סוחרים בישראל – תוך דקות!
              </p>

              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
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
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  פרסום מוצר חדש
                </div>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>
      <section data-section="suppliers" className={`transition-opacity duration-500 ${isContentVisible.suppliers ? 'opacity-100' : 'opacity-0'}`}>
        <motion.section 
          className="bg-blue-50 py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div className="flex justify-between items-center mb-8" variants={fadeIn}>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ספקים מובילים</h2>
                </div>
                <div>
                  <Button variant="ghost" asChild>
                    <Link to={createPageUrl("Suppliers")} className="flex items-center gap-1 group">
                      צפייה בכל הספקים
                      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
              >
                {loading
                  ? Array(3).fill(0).map((_, i) => (
                      <motion.div 
                        key={i}
                        variants={fadeIn}
                        className="bg-white animate-pulse"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full" />
                            <div className="flex-1">
                              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                              <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-full" />
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
      
      <section data-section="features" className={`transition-opacity duration-500 ${isContentVisible.features ? 'opacity-100' : 'opacity-0'}`}>
        <motion.section 
          className="container mx-auto px-4 md:px-6 py-16 bg-gradient-to-b from-white to-gray-50"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">למה להצטרף לקהילת Sitonimil ?</h2>
              <p className="text-lg text-gray-600">
              הצטרפו לאלפי סוחרים וספקים שכבר נהנים מחיבורים, הזדמנויות עסקיות ומכירות בקנה מידה ארצי
</p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">ספקים מאומתים</h3>
                    <p className="text-gray-600">
                      כל הספקים שלנו עוברים תהליך אימות קפדני כדי להבטיח שאתם עובדים רק עם ספקים אמינים ואיכותיים.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">פרסום מוצרים בקנה מידה ארצי</h3>
                    <p className="text-gray-600">
                    פרסום חופשי, חשיפה אמיתית – Sitonimil זה המקום להתחיל בו
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2"> כל מה שצריך בעסק הסיטונאי שלך</h3>
                    <p className="text-gray-600">
                    מערכת מתקדמת שתוכננה במיוחד למסחר סיטונאי – פשוטה, מהירה ונגישה                
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      
        <motion.section 
          className="bg-gradient-to-r from-blue-700 to-indigo-700 py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-7xl mx-auto">
              <motion.h2 
                className="text-2xl font-bold text-white mb-6"
                variants={fadeIn}
              >
                מוכנים להתחיל?
              </motion.h2>
              <motion.p 
                className="text-white/90 text-lg max-w-3xl mx-auto mb-8"
                variants={fadeIn}
              >
                הצטרפו לאלפי ספקים וסוחרים אחרים בפלטפורמה הסיטונאית המובילה. מחכים לכם!
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 justify-center"
                variants={fadeIn}
              >
                {currentUser ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    onClick={() => navigate(redirectToLogin("Home"))}
                  >
                    <Search className="ml-2 h-5 w-5" />
                    התחל לחפש מוצרים
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-gray-100"
                      onClick={() => navigate(redirectToLogin("Home"))}
                    >
                      <LogIn className="ml-2 h-5 w-5" />
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