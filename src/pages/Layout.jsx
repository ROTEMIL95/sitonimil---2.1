import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Product, Message, Review } from "@/api/entities";
import { 
  Search, 
  Menu, 
  X, 
  ShoppingBag, 
  MessageSquare, 
  User as UserIcon,
  Bell,
  LogIn,
  UserPlus,
  Building,
  Settings,
  HelpCircle,
  LogOut,
  ShoppingCart,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/api/supabaseClient";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get the authenticated user
        const userData = await User.me();
        console.log("Auth user data:", userData);
        
        // Get the full user record from the database
        if (userData) {
          try {
            const { data: userRecord } = await supabase
              .from("users")
              .select("*")
              .eq("id", userData.id)
              .single();
              
            console.log("User DB record:", userRecord);
            
            // Merge auth user with DB record to ensure business_type is available
            if (userRecord) {
              const mergedUser = { ...userData, ...userRecord };
              console.log("Merged user data:", mergedUser);
              setUser(mergedUser);
            } else {
              setUser(userData);
            }
          } catch (dbError) {
            console.error("Error fetching user record:", dbError);
            setUser(userData);
          }
        }
      } catch (error) {
        console.log("User not logged in", error);
      }
    };
    loadUser();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      window.location.href = createPageUrl("Search") + `?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: "דף הבית", path: createPageUrl("Home") },
    { name: "מוצרים", path: createPageUrl("Search") },
    { name: "ספקים", path: createPageUrl("Suppliers") },
  ];

  // Supplier-specific navigation links
  const supplierLinks = [
    { name: "המוצרים שלי", path: createPageUrl("MyProducts") },
  ];

  // Get all navigation links based on user role
  const getAllNavLinks = () => {
    // Basic links for everyone
    let links = [...navLinks];
    
    // Add supplier-specific links if the user is a supplier
    if (user) {
      const isSupplier = 
        (user.user_metadata?.business_type === "supplier") || 
        (user.business_type === "supplier");
        
      if (isSupplier) {
        links = [...links, ...supplierLinks];
      }
    }
    
    return links;
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handlePublishProductClick = (e) => {
    e.preventDefault();
    console.log("Current user data:", user);
    
    // First check if user exists
    if (!user) {
      window.location.href = createPageUrl("Auth") + "?tab=login&redirect=UploadProduct";
      return;
    }
    
    // Check business_type from user metadata first
    if (user.user_metadata && user.user_metadata.business_type === "supplier") {
      console.log("User is a supplier based on auth metadata");
      window.location.href = createPageUrl("UploadProduct");
      return;
    }
    
    // Fallback to DB record business_type
    if (user.business_type === "supplier") {
      console.log("User is a supplier based on DB record");
      window.location.href = createPageUrl("UploadProduct");
      return;
    }
    
    // If we get here, user is not a supplier
    console.log("User is not a supplier:", user);
    toast.error("רק ספקים יכולים לפרסם מוצרים");
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                      'Noto Color Emoji';
        }
      `}</style>
      
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-white"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              
              <Link to={createPageUrl("Home")} className="flex items-center gap-4">
                <ShoppingBag className="w-10 h-10 text-blue-600" />
                <span className="font-bold text-xl tracking-tight">Sitonim<span className="text-blue-600">il</span></span>
              </Link>
              
              <div className="hidden mr-20 md:flex items-center">
                {getAllNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`hover:text-blue-600 text-sm font-medium transition-colors mx-8 relative ${
                      isActive(link.path)
                        ? "text-blue-600 after:content-[''] after:absolute after:bottom-[-10px] after:right-0 after:w-full after:h-0.5 after:bg-blue-600"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <Link
                  to={createPageUrl("UploadProduct")}
                  className="mr-4 flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 transition-colors"
                  onClick={handlePublishProductClick}
                >
                  <PlusCircle className="h-4 w-4" />
                  פרסום מוצר
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 p-0 flex items-center justify-center">3</Badge>
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={createPageUrl("Messages")}>
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-9 w-9 transition-transform hover:scale-105">
                          {user.logo_url ? (
                            <AvatarImage src={user.logo_url} alt={user.company_name || user.full_name} />
                          ) : (
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {(user.company_name || user.full_name)?.charAt(0) || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mr-1 bg-white rounded-xl shadow-lg p-1" align="end" dir="rtl">
                      <DropdownMenuLabel className="font-normal px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {user.logo_url ? (
                              <AvatarImage src={user.logo_url} alt={user.company_name || user.full_name} />
                            ) : (
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {(user.company_name || user.full_name)?.charAt(0) || "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">{user.company_name || user.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem asChild className="hover:bg-gray-50 cursor-pointer px-2 py-1.5">
                        <Link to={createPageUrl("Profile")} className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span>הפרופיל שלי</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="hover:bg-gray-50 cursor-pointer px-2 py-1.5">
                        <Link to={createPageUrl("Settings")} className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <span>הגדרות</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="hover:bg-gray-50 cursor-pointer px-2 py-1.5">
                        <Link to={createPageUrl("Help")} className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          <span>עזרה ותמיכה</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="hover:bg-red-50 text-red-600 cursor-pointer px-2 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="h-4 w-4" />
                          <span>התנתקות</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" 
                    asChild
                  >
                    <Link to={createPageUrl("Auth") + "?tab=login"}>
                      <LogIn className="h-4 w-4" />
                      <span>התחברות</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-600 text-blue-600 flex items-center gap-2" 
                    asChild
                  >
                    <Link to={createPageUrl("Auth") + "?tab=register"}>
                      <UserPlus className="h-4 w-4" />
                      <span>הרשמה</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl overflow-y-auto"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-lg">התפריט</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {user && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        {user.logo_url ? (
                          <AvatarImage src={user.logo_url} alt={user.company_name || user.full_name} />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {(user.company_name || user.full_name)?.charAt(0) || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.company_name || user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  )}
                
                  {getAllNavLinks().map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-4 py-2 rounded-md text-sm font-medium ${
                        isActive(link.path)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  <Link
                    to={createPageUrl("UploadProduct")}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-600"
                    onClick={(e) => {
                      handlePublishProductClick(e);
                      setIsMenuOpen(false);
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    פרסום מוצר
                  </Link>
                  
                  <div className="pt-2 border-t border-gray-200">
                    {user ? (
                      <>
                        <Link
                          to={createPageUrl("Messages")}
                          className="flex items-center px-4 py-2 rounded-md hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <MessageSquare className="w-5 h-5 ml-3" />
                          <span>הודעות</span>
                        </Link>
                        <Link
                          to={createPageUrl("Profile")}
                          className="flex items-center px-4 py-2 rounded-md hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UserIcon className="w-5 h-5 ml-3" />
                          <span>הפרופיל שלי</span>
                        </Link>
                        <Link
                          to={createPageUrl("Settings")}
                          className="flex items-center px-4 py-2 rounded-md hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5 ml-3" />
                          <span>הגדרות</span>
                        </Link>
                        <Link
                          to={createPageUrl("Help")}
                          className="flex items-center px-4 py-2 rounded-md hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <HelpCircle className="w-5 h-5 ml-3" />
                          <span>עזרה ותמיכה</span>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full mt-2 border-red-600 text-red-600"
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 ml-2" />
                          התנתקות
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2 justify-center" 
                          asChild
                        >
                          <Link 
                            to={createPageUrl("Auth") + "?tab=login"}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <LogIn className="h-4 w-4" />
                            להתחברות
                          </Link>
                        </Button>
                        <Button 
                          className="w-full border-blue-600 text-blue-600" 
                          variant="outline" 
                          asChild
                        >
                          <Link 
                            to={createPageUrl("Auth") + "?tab=register"}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <UserPlus className="h-4 w-4 ml-2" />
                            הרשמה
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-8xl mx-auto px-4 sm:px-6 py-8 pt-24">{children}</main>

      <footer className="bg-gray-100 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-lg tracking-tight">
                  Sitonim<span className="text-blue-600">il</span>
                </span>
              </Link>
              <p className="text-gray-500 text-sm">
                מחברים סיטונאים וסוחרים ברחבי העולם באמצעות פלטפורמה מאובטחת וידידותית למשתמש.
              </p>
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4">קישורים מהירים</h4>
              <ul className="space-y-2">
                <li>
                  <Link to={createPageUrl("Home")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    דף הבית
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Search")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    חיפוש מוצרים
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Suppliers")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    מציאת ספקים
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Auth")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    התחברות / הרשמה
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4">עזרה ותמיכה</h4>
              <ul className="space-y-2">
                <li>
                  <Link to={createPageUrl("Help")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    איך זה עובד
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Help") + "?tab=faq"} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    שאלות נפוצות
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Help") + "?tab=contact"} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    צור קשר
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Help") + "?tab=terms"} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Help") + "?tab=privacy"} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    מדיניות פרטיות
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4">הרשמה לניוזלטר</h4>
              <p className="text-sm text-gray-500 mb-4">
                הישארו מעודכנים במוצרים החדשים ובמגמות בתעשייה
              </p>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="האימייל שלך" 
                  className="h-10 bg-white text-right" 
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Sitonimil. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

