import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Product, Message, Review } from "@/api/entities";
import { 
  Menu, 
  X, 
  MessageSquare, 
  User as UserIcon,
  Bell,
  LogIn,
  UserPlus,
  Settings,
  HelpCircle,
  LogOut,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  PlusCircle,
  Shield,
  Heart,
  FileText
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
import AccessibilityWidget from "@/components/AccessibilityWidget";


export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to refresh user data
  const refreshUserData = useCallback(async () => {
    try {
      // Get the authenticated user
      const userData = await User.me();
      
      // Get the full user record from the database
      if (userData) {
        try {
          const { data: userRecord } = await supabase
            .from("users")
            .select("*")
            .eq("id", userData.id)
            .single();
            
          // Merge auth user with DB record
          if (userRecord) {
            // Create a new merged user object
            const mergedUser = { ...userData, ...userRecord };
            
            // Force avatar refresh by adding timestamp to URL
            if (mergedUser.avatar_url) {
              // Generate a unique timestamp for cache busting
              const timestamp = Date.now();
              
              // Handle existing query parameters
              const url = new URL(mergedUser.avatar_url, window.location.origin);
              url.searchParams.set('t', timestamp);
              
              // Update the avatar URL with the new timestamped version
              mergedUser.avatar_url = url.toString().replace(window.location.origin, '');
              
              console.log("Updated avatar URL with timestamp:", mergedUser.avatar_url);
            }
            
            // Set the updated user with fresh avatar URL
            setUser({ ...mergedUser });
          } else {
            setUser(userData);
          }
        } catch (dbError) {
          console.error("Error fetching user record:", dbError);
          setUser(userData);
        }
      }
    } catch (error) {
      console.log("Error refreshing user data:", error);
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async (userId) => {
      if (!userId) return;
      
      setNotificationsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('is_read', false)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setNotifications(data || []);
      } catch (error) {
        console.error("Error loading notifications:", error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

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
              
              // Load notifications after setting the user
              loadNotifications(mergedUser.id);
            } else {
              setUser(userData);
              loadNotifications(userData.id);
            }
          } catch (dbError) {
            console.error("Error fetching user record:", dbError);
            setUser(userData);
            loadNotifications(userData.id);
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

  // Listen for avatar update events
  useEffect(() => {
    // Listen for profile/avatar update event
    const handleProfileUpdate = () => {
      refreshUserData();
    };
    
    // Add event listener for custom profile update events
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Set up real-time subscription to user data changes
    let userSubscription;
    
    if (user?.id) {
      userSubscription = supabase
        .channel(`public:users:id=eq.${user.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${user.id}`
        }, () => {
          refreshUserData();
        })
        .subscribe();
    }
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      if (userSubscription) {
        userSubscription.unsubscribe();
      }
    };
  }, [user?.id, refreshUserData]);

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('favoriteProducts');
        if (savedFavorites) {
          setFavoriteProducts(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };
    
    loadFavorites();
    
    // Listen for custom events from ProductCard
    const handleFavoriteUpdate = (event) => {
      const { productId, isLiked } = event.detail;
      
      setFavoriteProducts(current => {
        let updated = [...current];
        
        if (isLiked && !updated.includes(productId)) {
          updated.push(productId);
        } else if (!isLiked) {
          updated = updated.filter(id => id !== productId);
        }
        
        // Save to localStorage
        localStorage.setItem('favoriteProducts', JSON.stringify(updated));
        return updated;
      });
    };
    
    window.addEventListener('favoriteUpdate', handleFavoriteUpdate);
    
    return () => {
      window.removeEventListener('favoriteUpdate', handleFavoriteUpdate);
    };
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
    { name: "לוח הבקרה לספק", path: createPageUrl("Dashboard") },
  ];

  // Get all navigation links based on user role
  const getAllNavLinks = () => {
    const links = [
      { name: "דף הבית", path: createPageUrl("Home") },
      { name: "חיפוש מוצרים", path: createPageUrl("Search") },
      { name: "מציאת ספקים", path: createPageUrl("Suppliers") },
    ];

    // Add admin dashboard link if user is admin
    if (user?.role === 'admin') {
      links.push({ name: "ניהול האתר", path: createPageUrl("AdminDashboard") });
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
    
    // Check if user is a supplier from either metadata or DB record
    const isSupplier = (user.user_metadata?.business_type === "supplier") || (user.business_type === "supplier");
    
    if (isSupplier) {
      console.log("User is a supplier, redirecting to UploadProduct");
      window.location.href = createPageUrl("UploadProduct");
      return;
    }
    
    // If we get here, user is not a supplier
    console.log("User is not a supplier:", user);
    toast.error("רק ספקים יכולים לפרסם מוצרים");
  };

  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Update the local state to remove the read notification
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Function to mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Clear all notifications from the local state
      setNotifications([]);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Inside the Layout component, add a new function to handle link clicks
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                      'Noto Color Emoji';
        }
        .skip-to-content {
          position: absolute;
          top: -100%;
          left: 0;
          z-index: 9999;
          padding: 0.5rem 1rem;
          background: #1d4ed8;
          color: white;
          transition: top 0.2s;
        }
        .skip-to-content:focus {
          top: 0;
        }
      `}</style>
      
     
      
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-white"}`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="py-4 flex items-center justify-between">
            <div className="flex items-center md:flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden focus:ring-2 focus-visible:ring-offset-2 p-2 h-auto w-auto"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "סגור תפריט" : "פתח תפריט"}
              >
                {isMenuOpen ? <X className="h-9 w-9 text-gray-900" /> : <Menu className="h-9 w-9 text-gray-900" />}
              </Button>
              
              <Link 
                to={createPageUrl("Home")} 
                className={`flex items-center gap-4 md:mr-0 absolute left-1/2 transform ${user ? '-translate-x-[10%] md:-translate-x-1/2' : '-translate-x-1/2'} md:relative md:left-0 md:transform-none rounded-md`} 
                onClick={handleLinkClick} 
                aria-label="דף הבית"
              >
                <img 
                  src="/images/logo2.png" 
                  alt="Sitonimil" 
                  className="h-9 md:h-11"
                />
              </Link>
              
              <div className="hidden mr-20 md:flex items-center">
                {getAllNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={`hover:text-blue-600 text-sm font-medium transition-colors mx-8 relative focus:outline-none focus:ring-2  focus:ring-offset-2 rounded-sm ${
                      isActive(link.path)
                        ? "text-blue-600 after:content-[''] after:absolute after:bottom-[-10px] after:right-0 after:w-full after:h-0.5 after:bg-blue-600"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                    aria-current={isActive(link.path) ? "page" : undefined}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <Link
                  to={createPageUrl("UploadProduct")}
                  className="mr-4 flex items-center gap-1 rounded-full bg-blue-700 px-4 py-1.5 text-sm text-gray-50 hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2  focus:ring-offset-2"
                  onClick={(e) => {
                    handlePublishProductClick(e);
                    handleLinkClick();
                  }}
                  aria-label="פרסום מוצר חדש"
                >
                  <PlusCircle className="h-5 w-5" />
                  פרסום מוצר
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Favorites Icon - temporarily removed
                  <Button variant="ghost" size="icon" asChild className="relative focus:ring-2 focus-visible:ring-offset-2">
                    <Link to={createPageUrl("Favorites")} aria-label="מועדפים">
                      <Heart className="w-5 h-5" />
                      {favoriteProducts.length > 0 && (
                        <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 p-0 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm">
                          {favoriteProducts.length > 99 ? "99+" : favoriteProducts.length}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  */}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative focus:ring-2  focus-visible:ring-offset-2" aria-label="התראות">
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 p-0 flex items-center justify-center">
                            {notifications.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 mr-1 bg-white rounded-xl shadow-lg p-1" align="start" dir="rtl">
                      <DropdownMenuLabel className="font-normal px-2 py-2 flex justify-between items-center">
                        <span className="font-medium">התראות</span>
                        {notifications.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-auto py-1 hover:bg-gray-100 text-gray-500 focus:ring-2  focus-visible:ring-offset-2"
                            onClick={markAllNotificationsAsRead}
                          >
                            סמן הכל כנקרא
                          </Button>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1" />
                      
                      {notificationsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto">
                          {notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="px-2 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                              <div className="flex items-start gap-2 w-full" onClick={() => markNotificationAsRead(notification.id)}>
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <Bell className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm line-clamp-2">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.created_at).toLocaleDateString('he-IL', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">אין התראות חדשות</p>
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="ghost" size="icon" asChild className="focus:ring-2 focus-visible:ring-offset-2">
                    <Link to={createPageUrl("Messages")} aria-label="הודעות">
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="relative h-8 w-8 rounded-full focus:ring-2 focus-visible:ring-offset-2 hover:bg-gray-100"
                      >
                        <Avatar className="h-8 w-8 border-2 border-white shadow">
                          <AvatarImage 
                            src={`${user.avatar_url}?v=${Date.now()}`}
                            alt={user.full_name}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600">{user.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl" dir="rtl">
                      <div className="px-3 py-2 mb-1 bg-blue-50 rounded-lg">
                        <DropdownMenuLabel className="flex items-center gap-2 text-sm p-0">
                          <span className="font-semibold text-gray-800">{user.full_name}</span>
                          {user.role === 'admin' && (
                            <Badge variant="secondary" className="font-normal text-xs bg-blue-200 text-blue-800">
                              <Shield className="h-3 w-3 ml-1" />
                              אדמין
                            </Badge>
                          )}
                        </DropdownMenuLabel>
                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator className="my-1" />
                      <div className="py-1">
                        <DropdownMenuItem 
                          onClick={() => {
                            handleLinkClick();
                            if (user) {
                              navigate(createPageUrl("Profile"));
                            } else {
                              navigate(createPageUrl("Auth") + "?tab=login&redirect=Profile");
                              toast({
                                title: "נדרשת התחברות",
                                description: "עליך להתחבר כדי לצפות בפרופיל",
                                duration: 3000,
                              });
                            }
                          }}
                          className="hover:bg-blue-50 cursor-pointer px-3 py-2 rounded-md focus:bg-blue-50 mb-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-1.5 rounded-full">
                              <UserIcon className="h-4 w-4 text-blue-700" />
                            </div>
                            <span className="font-medium text-gray-800">הפרופיל שלי</span>
                          </div>
                        </DropdownMenuItem>
                
                        <DropdownMenuItem asChild className="hover:bg-blue-50 cursor-pointer px-3 py-2 rounded-md focus:bg-blue-50 mb-1">
                          <Link to={createPageUrl("Help")} className="flex items-center gap-3">
                            <div className="bg-green-100 p-1.5 rounded-full">
                              <HelpCircle className="h-4 w-4 text-green-700" />
                            </div>
                            <span className="font-medium text-gray-800">עזרה ותמיכה</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-blue-50 cursor-pointer px-3 py-2 rounded-md focus:bg-blue-50 mb-1">
                          <Link to={createPageUrl("Privacy")} className="flex items-center gap-3">
                            <div className="bg-yellow-100 p-1.5 rounded-full">
                              <Shield className="h-4 w-4 text-yellow-700" />
                            </div>
                            <span className="font-medium text-gray-800">מדיניות פרטיות</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-blue-50 cursor-pointer px-3 py-2 rounded-md focus:bg-blue-50">
                          <Link to={createPageUrl("Terms")} className="flex items-center gap-3">
                            <div className="bg-gray-100 p-1.5 rounded-full">
                              <FileText className="h-4 w-4 text-gray-700" />
                            </div>
                            <span className="font-medium text-gray-800">תנאי שימוש</span>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator className="my-1" />
                      
                      <h3 className="text-sm font-bold mt-2 mb-2 text-gray-500 px-3">עקבו אחרינו</h3>
                      
                      <div className="flex justify-center gap-2 px-3 py-2 mb-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white hover:bg-blue-100 hover:text-blue-700 rounded-full h-9 w-9 shadow-sm border"
                          onClick={() => {
                            window.open('https://www.facebook.com/sitonimil', '_blank');
                            setIsMenuOpen(false);
                          }}
                          aria-label="פייסבוק"
                        >
                          <Facebook className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white hover:bg-pink-100 hover:text-pink-600 rounded-full h-9 w-9 shadow-sm border"
                          onClick={() => {
                            window.open('https://www.instagram.com/sitonimil', '_blank');
                            setIsMenuOpen(false);
                          }}
                          aria-label="אינסטגרם"
                        >
                          <Instagram className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white hover:bg-blue-100 hover:text-blue-800 rounded-full h-9 w-9 shadow-sm border"
                          onClick={() => {
                            window.open('https://www.linkedin.com/company/sitonimil', '_blank');
                            setIsMenuOpen(false);
                          }}
                          aria-label="לינקדאין"
                        >
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="p-2 mt-1">
                        <Button
                          variant="outline"
                          className="w-full border-red-500 text-red-600 hover:bg-red-50 rounded-md"
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 ml-2" />
                          <span className="font-medium">התנתקות</span>
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-blue-700 text-white hover:bg-blue-800 flex items-center gap-2 focus:ring-2  focus:ring-offset-2" 
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
                    className="border-blue-700 text-blue-700 flex items-center gap-2 hover:bg-blue-50 focus:ring-2  focus:ring-offset-2" 
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
              className="md:hidden fixed inset-0 right-0 left-auto z-50 w-72 bg-white shadow-xl"
              style={{ height: '100vh', top: 0 }}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              id="mobile-menu"
              role="navigation"
              aria-label="תפריט נייד"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-white z-10">
                  <h2 className="font-semibold text-lg">תפריט</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                    className="focus:ring-2 focus-visible:ring-offset-2 p-1.5 h-auto w-auto"
                    aria-label="סגור תפריט"
                  >
                    <X className="h-7 w-7 text-blue-700" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 px-4 pb-24 space-y-4">
                  {user && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        {user.logo_url || user.avatar_url ? (
                          <AvatarImage 
                            src={`${user.logo_url || user.avatar_url}?v=${Date.now()}`}
                            alt={user.company_name || user.full_name}
                          />
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
                
                  {/* קישורי ניווט ראשיים */}
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-sm font-bold mb-3 text-gray-500 px-2">ניווט</h3>
                    {getAllNavLinks().map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`block px-4 py-3 mb-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 ${
                          isActive(link.path)
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-800 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          handleLinkClick();
                          setIsMenuOpen(false);
                        }}
                        aria-current={isActive(link.path) ? "page" : undefined}
                      >
                        {link.name}
                      </Link>
                    ))}
                    
                    <Link
                      to={createPageUrl("UploadProduct")}
                      className="flex items-center justify-center gap-1 text-sm font-medium w-full py-2.5 px-4 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 mt-3"
                      onClick={(e) => {
                        handlePublishProductClick(e);
                        handleLinkClick();
                        setIsMenuOpen(false);
                      }}
                      aria-label="פרסום מוצר חדש"
                    >
                      <PlusCircle className="h-6 w-6 "/>
                       פרסם מוצר
                    </Link>
                  </div>
                  
                  {/* קישורים נוספים */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold mb-3 text-gray-500 px-2">פעולות מהירות</h3>
                    {user ? (
                      <>
                        <Link
                          to={createPageUrl("Messages")}
                          className="flex items-center px-4 py-3 mb-1 rounded-md hover:bg-gray-50"
                          onClick={() => {
                            handleLinkClick();
                            setIsMenuOpen(false);
                          }}
                        >
                          <MessageSquare className="w-5 h-5 ml-3" />
                          <span>הודעות</span>
                        </Link>
                        <Button
                          type="button"
                          className="flex items-center px-4 py-3 mb-1 rounded-md h w-full text-right"
                          onClick={() => {
                            handleLinkClick();
                            setIsMenuOpen(false);
                            if (user) {
                              navigate(createPageUrl("Profile"));
                            } else {
                              navigate(createPageUrl("Auth") + "?tab=login&redirect=Profile");
                              toast({
                                title: "נדרשת התחברות",
                                description: "עליך להתחבר כדי לצפות בפרופיל",
                                duration: 3000,
                              });
                            }
                          }}
                        >
                          <UserIcon className="w-5 h-5 ml-3" />
                          <span >הפרופיל שלי</span>
                        </Button>
                        
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          to={createPageUrl("Help") + "?tab=faq"}
                          className="flex items-center px-4 pt-3 pb-1 mb-1 rounded-md hover:bg-gray-50"
                          onClick={() => {
                            handleLinkClick();
                            setIsMenuOpen(false);
                          }}
                        >
                          <HelpCircle className="w-5 h-5 ml-3" />
                          <span> שאלות נפוצות</span>
                        </Link>
                        
                        <Link
                          to={createPageUrl("Help") + "?tab=contact"}
                          className="flex items-center px-4 py-1 mb-1 rounded-md hover:bg-gray-50"
                          onClick={() => {
                            handleLinkClick();
                            setIsMenuOpen(false);
                          }}
                        >
                          <Mail className="w-5 h-5 ml-3" />
                          <span>צור קשר</span>
                        </Link>
                        
                        <h3 className="text-sm font-bold mt-6 mb-4 text-gray-500 px-2 pb-1 pt-3 border-t border-gray-200">התחברות / הרשמה</h3>
                        
                        <Button 
                          className="w-full bg-blue-700 text-white hover:bg-blue-800 flex items-center gap-2 justify-center focus:outline-none focus:ring-2  focus-visible:ring-offset-2" 
                          asChild
                        >
                          <Link 
                            to={createPageUrl("Auth") + "?tab=login"}
                            onClick={() => {
                              handleLinkClick();
                              setIsMenuOpen(false);
                            }}
                          >
                            <LogIn className="h-4 w-4" />
                            התחברות
                          </Link>
                        </Button>
                        <Button 
                          className="w-full border-blue-700 text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2  focus-visible:ring-offset-2" 
                          variant="outline" 
                          asChild
                        >
                          <Link 
                            to={createPageUrl("Auth") + "?tab=register"}
                            onClick={() => {
                              handleLinkClick();
                              setIsMenuOpen(false);
                            }}
                          >
                            <UserPlus className="h-4 w-4 ml-2" />
                            הרשמה
                          </Link>
                        </Button>

                        <h3 className="text-sm font-bold mt-6 mb-3 text-gray-500 px-2 pt-2 border-t border-gray-200">עקבו אחרינו</h3>
                        
                        <div className="flex flex-wrap gap-3 px-4 py-2 mb-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full h-10 w-10"
                            onClick={() => {
                              window.open('https://www.facebook.com/sitonimil', '_blank');
                              setIsMenuOpen(false);
                            }}
                            aria-label="פייסבוק"
                          >
                            <Facebook className="h-5 w-5" />
                          </Button>
                          
                         
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-gray-100 hover:bg-pink-100 hover:text-pink-600 rounded-full h-10 w-10"
                            onClick={() => {
                              window.open('https://www.instagram.com/sitonimil', '_blank');
                              setIsMenuOpen(false);
                            }}
                            aria-label="אינסטגרם"
                          >
                            <Instagram className="h-5 w-5" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-gray-100 hover:bg-blue-100 hover:text-blue-800 rounded-full h-10 w-10"
                            onClick={() => {
                              window.open('https://www.linkedin.com/company/sitonimil', '_blank');
                              setIsMenuOpen(false);
                            }}
                            aria-label="לינקדאין"
                          >
                            <Linkedin className="h-5 w-5" />
                          </Button>
                        </div>
                        
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

      <main id="main-content" className="max-w-8xl mx-auto px-4 sm:px-6 py-8 pt-24">{children}</main>

      <footer className="bg-gray-100 border-t mt-auto" role="contentinfo" aria-label="אזור תחתון">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2" onClick={handleLinkClick} aria-label="דף הבית">
                <img 
                  src="/images/logo2.png" 
                  alt="Sitonimil" 
                  className="h-9 md:h-11"
                />
              </Link>
              <p className="text-gray-700 text-sm">
                מחברים סיטונאים וסוחרים ברחבי הארץ באמצעות פלטפורמה מאובטחת וידידותית למשתמש.
              </p>
              <div className="flex space-x-3" aria-label="קישורים לרשתות חברתיות">
                <Button variant="ghost" size="icon" aria-label="Facebook" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 focus:ring-2  focus-visible:ring-offset-2">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Twitter" className="text-gray-700 hover:text-blue-500 hover:bg-blue-50 focus:ring-2  focus-visible:ring-offset-2">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Instagram" className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 focus:ring-2  focus-visible:ring-offset-2">
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4 text-gray-900">קישורים מהירים</h4>
              <ul className="space-y-3" aria-label="ניווט מהיר">
                <li>
                  <Link to={createPageUrl("Home")} className="text-sm text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2  rounded-sm px-1 py-0.5 inline-block" onClick={handleLinkClick}>
                    דף הבית
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Search")} className="text-sm text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2  rounded-sm px-1 py-0.5 inline-block" onClick={handleLinkClick}>
                    חיפוש מוצרים
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Suppliers")} className="text-sm text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2  rounded-sm px-1 py-0.5 inline-block" onClick={handleLinkClick}>
                    מציאת ספקים
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Auth")} className="text-sm text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2  rounded-sm px-1 py-0.5 inline-block" onClick={handleLinkClick}>
                    התחברות / הרשמה
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4 text-gray-900">עזרה ותמיכה</h4>
              <ul className="space-y-3" aria-label="עזרה ותמיכה">
                <li>
                  <Link to={createPageUrl("Help") + "?tab=faq"} className="text-sm text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2  rounded-sm px-1 py-0.5 inline-block" onClick={handleLinkClick}>
                    שאלות נפוצות
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Help") + "?tab=contact"} className="text-sm text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2  rounded-sm px-1 py-0.5 inline-block" onClick={handleLinkClick}>
                    צור קשר
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Terms")} className="text-sm text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2  rounded-sm px-1 py-0.5 inline-block" onClick={handleLinkClick}>
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Privacy")} className="text-sm text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2  rounded-sm px-1 py-0.5 inline-block" onClick={handleLinkClick}>
                    מדיניות פרטיות
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4 text-gray-900" id="newsletter-heading">הרשמה לניוזלטר</h4>
              <p className="text-sm text-gray-700 mb-4">
                הישארו מעודכנים במוצרים החדשים ובמגמות בתעשייה
              </p>
              <form 
                role="form" 
                aria-labelledby="newsletter-heading" 
                className="flex space-x-2 space-x-reverse rtl:space-x-reverse"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Here you would handle the newsletter submission
                  toast({
                    title: "תודה על ההרשמה",
                    description: "נרשמת בהצלחה לניוזלטר שלנו",
                    duration: 3000,
                  });
                }}
              >
                <div className="relative flex-grow">
                  <Input 
                    type="email" 
                    placeholder="האימייל שלך" 
                    className="h-10 bg-white text-right border-gray-300 focus:border-blue-500  focus:ring-offset-2 text-gray-800" 
                    aria-label="כתובת האימייל שלך"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white focus:ring-2  focus:ring-offset-2"
                  aria-label="הרשמה לניוזלטר"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-800 text-center font-medium">
              © {new Date().getFullYear()} Sitonimil. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
      <AccessibilityWidget />
    </div>
  );
}

