import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LogIn, 
  UserPlus, 
  ArrowLeft, 
  Mail, 
  Eye, 
  EyeOff, 
  Building, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Store,
  ShoppingBag,
  Facebook
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/api/supabaseClient";
import { motion } from "framer-motion";

// Google logo SVG component
const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [userType, setUserType] = useState(null); // null, "supplier", or "buyer"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginTab, setShowLoginTab] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    businessType: "",
    agreeTerms: false,
    companyName: "",
    description: "",
    address: "",
    phone: "",
  });
  const [redirectTo, setRedirectTo] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get("tab");
    const redirect = urlParams.get("redirect");
    
    if (tab === "register") {
      setActiveTab("register");
      setShowLoginTab(false);
    } else {
      setActiveTab("login");
      setShowLoginTab(true);
    }
    
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [location.search]);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    setLoading(true);
    try {
      // Login user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;
      
      // Get the updated session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        toast.success("התחברת בהצלחה");
        
        // Navigate to redirect page if provided, otherwise to home page
      if (redirectTo) {
        navigate(createPageUrl(redirectTo));
      } else {
        navigate(createPageUrl("Home"));
        }
        
        // Force a page reload to refresh all components including navbar
        window.location.reload();
      } else {
        throw new Error("לא הצלחנו להתחבר. נא לנסות שוב.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.message || "התחברות נכשלה");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await User.logout();
      toast.success("התנתקת בהצלחה");
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(error.message || "התנתקות נכשלה");
    }
    setLoading(false);
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setFormData({
      ...formData,
      businessType: type
    });
  };

  const handleBackToUserType = () => {
    setUserType(null);
    setError(null);
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.email || !formData.password || !formData.fullName || !formData.businessType) {
        setError("נא למלא את כל השדות החובה");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("כתובת האימייל אינה תקינה");
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        setError("הסיסמה חייבת להכיל לפחות 6 תווים");
        return;
      }

      // Validate terms agreement
    if (!formData.agreeTerms) {
        setError("יש לאשר את תנאי השימוש");
      return;
    }
    
      // Validate supplier fields if business type is supplier
      if (formData.businessType === "supplier") {
        if (!formData.companyName || !formData.description || !formData.address || !formData.phone) {
          setError("נא למלא את כל השדות החובה לספקים");
          return;
        }
      }

      // Prepare supplier data if applicable
      const supplierData = formData.businessType === "supplier" ? {
        company_name: formData.companyName,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
      } : null;

      // Register user
      await User.register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.businessType,
        supplierData
      );

      // Store the email temporarily to populate the login form
      const registeredEmail = formData.email;
      
      // Reset form
      setFormData({
        ...formData,
        email: registeredEmail,
        password: "",
        fullName: "",
        businessType: "",
        agreeTerms: false,
        companyName: "",
        description: "",
        address: "",
        phone: "",
      });

      // Reset user type
      setUserType(null);

      // Show success message
      toast.success("ההרשמה הושלמה בהצלחה! אנא התחבר כדי להמשיך.");
      
      // Navigate to login page
      navigate(createPageUrl("Auth") + "?tab=login");
      
      // Sign out the user if they were automatically signed in
      await supabase.auth.signOut();

    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.message || "אירעה שגיאה בתהליך ההרשמה");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + createPageUrl("Auth") + "?tab=login&redirect=Home"
        }
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      toast.error(error.message || `התחברות באמצעות ${provider} נכשלה`);
      setLoading(false);
    }
  };

  const renderUserTypeSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-1">הרשמה לאתר</h2>
        <p className="text-gray-500 text-sm">בחר את סוג המשתמש שלך להמשך התהליך</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            onClick={() => handleUserTypeSelect("buyer")}
            className="w-full h-48 md:h-60 flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border-2 border-blue-200 hover:border-blue-600 bg-white hover:bg-blue-50 transition-all"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3 md:mb-4">
              <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">אני קונה / קמעונאי</h3>
            <p className="text-gray-500 text-sm text-center">אני מעוניין לחפש ולרכוש מוצרים מסיטונאים</p>
          </button>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            onClick={() => handleUserTypeSelect("supplier")}
            className="w-full h-48 md:h-60 flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border-2 border-blue-200 hover:border-blue-600 bg-white hover:bg-blue-50 transition-all"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3 md:mb-4">
              <Store className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">אני ספק / סיטונאי</h3>
            <p className="text-gray-500 text-sm text-center">אני מעוניין להציע את המוצרים שלי למכירה סיטונאית</p>
          </button>
        </motion.div>
      </div>
    </div>
  );

  const renderBuyerForm = () => (
    <>
      <button onClick={handleBackToUserType} className="text-blue-600 hover:underline mb-3 flex items-center">
        <ArrowLeft className="h-4 w-4 ml-1" />
        חזרה לבחירת סוג משתמש
      </button>
      
      <div className="space-y-4 md:space-y-6">
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-1">הרשמה כקונה</h2>
          <p className="text-gray-500 text-sm">צור חשבון קונה חדש בסיטונאות ישראל</p>
        </div>
        
        <div className="max-w-md mx-auto space-y-3">
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-base text-right">שם מלא</Label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
              <Input 
                id="fullName" 
                placeholder="ישראל ישראלי" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="pr-10 text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="register-email" className="text-base text-right">אימייל</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
              <Input 
                id="register-email" 
                type="email" 
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="pr-10 text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="register-password" className="text-base text-right">סיסמה</Label>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                className="absolute left-0 top-0 h-full px-3 py-2 text-blue-600 hover:text-blue-700"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
              <Input 
                id="register-password" 
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse mt-2">
            <Checkbox 
              id="terms" 
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => 
                setFormData({...formData, agreeTerms: checked === true})
              }
              disabled={loading}
            />
            <Label htmlFor="terms" className="text-sm text-right">
              אני מסכים ל
              <Link to="/" className="text-blue-600 hover:underline mx-1">
                תנאי השימוש
              </Link>
              ו
              <Link to="/" className="text-blue-600 hover:underline mx-1">
                מדיניות הפרטיות
              </Link>
            </Label>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mt-3 text-center text-sm font-medium">
              {error}
            </div>
          )}

          <Button 
            onClick={handleRegister}
            className="w-full h-11 mt-3 bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={
              !formData.email || 
              !formData.password || 
              !formData.fullName || 
              !formData.agreeTerms ||
              loading
            }
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                מבצע הרשמה...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                הרשמה
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">או הרשם באמצעות</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex items-center justify-center gap-2 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-[#4285F4] transition-all rounded-xl"
          // onClick={() => handleSocialLogin('google')}
          disabled={loading}
        >
          <GoogleLogo />
          <span>Google</span>
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex items-center justify-center gap-2 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-[#1877F2] transition-all rounded-xl"
          // onClick={() => handleSocialLogin('facebook')}
          disabled={loading}
        >
          <Facebook className="h-5 w-5 text-blue-600" />
          <span>Facebook</span>
        </Button>
      </div>

      <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              כבר יש לך חשבון?{" "}
              <Link 
                to={createPageUrl("Auth") + "?tab=login"}
                className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
              >
                התחבר כאן
              </Link>
            </p>
          </div>
    </>
  );

  const renderSupplierForm = () => (
    <>
      <button onClick={handleBackToUserType} className="text-blue-600 hover:underline mb-3 flex items-center">
        <ArrowLeft className="h-4 w-4 ml-1" />
        חזרה לבחירת סוג משתמש
      </button>
      
      <div className="space-y-4 md:space-y-6">
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-1">הרשמה כספק / סיטונאי</h2>
          <p className="text-gray-500 text-sm">צור חשבון ספק חדש בסיטונאות ישראל</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-base text-right">שם מלא</Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                <Input 
                  id="fullName" 
                  placeholder="ישראל ישראלי" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="pr-10 text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="register-email" className="text-base text-right">אימייל</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                <Input 
                  id="register-email" 
                  type="email" 
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pr-10 text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="register-password" className="text-base text-right" >סיסמה</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute left-0 top-0 h-full px-3 py-2 text-blue-600 hover:text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
                <Input 
                  id="register-password" 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="companyName" className="text-base text-right">שם העסק</Label>
              <div className="relative">
                <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                <Input 
                  id="companyName" 
                  placeholder="שם העסק המלא" 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="pr-10 text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="description" className="text-base text-right">תיאור העסק</Label>
              <Textarea 
                id="description" 
                placeholder="תאר את העסק שלך, המוצרים שאתה מציע והיתרונות שלך כספק..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="text-right border-blue-200 focus-visible:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-base text-right">כתובת העסק</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                <Input 
                  id="address" 
                  placeholder="כתובת מלאה" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="pr-10 text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-base text-right">טלפון</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="מספר טלפון" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="pr-10 text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse mt-2 md:mt-3 max-w-md mx-auto">
          <Checkbox 
            id="supplier-terms" 
            checked={formData.agreeTerms}
            onCheckedChange={(checked) => 
              setFormData({...formData, agreeTerms: checked === true})
            }
            disabled={loading}
          />
          <Label htmlFor="supplier-terms" className="text-sm text-right">
            אני מסכים ל
            <Link to="/" className="text-blue-600 hover:underline mx-1">
              תנאי השימוש
            </Link>
            ו
            <Link to="/" className="text-blue-600 hover:underline mx-1">
              מדיניות הפרטיות
            </Link>
          </Label>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mt-3 text-center text-sm font-medium max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="mt-4 max-w-md mx-auto">
          <Button 
            onClick={handleRegister}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={
              !formData.email || 
              !formData.password || 
              !formData.fullName || 
              !formData.companyName ||
              !formData.description ||
              !formData.address ||
              !formData.phone ||
              !formData.agreeTerms ||
              loading
            }
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                מבצע הרשמה...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                הרשמה כספק
              </span>
            )}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              כבר יש לך חשבון?{" "}
              <Link 
                to={createPageUrl("Auth") + "?tab=login"}
                className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
              >
                התחבר כאן
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">או הרשם באמצעות</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex items-center justify-center gap-2 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-[#4285F4] transition-all rounded-lg"
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
        >
          <GoogleLogo />
          <span>Google</span>
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex items-center justify-center gap-2 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-[#1877F2] transition-all rounded-lg"
          onClick={() => handleSocialLogin('facebook')}
          disabled={loading}
        >
          <Facebook className="h-5 w-5 text-blue-600" />
          <span>Facebook</span>
        </Button>
      </div>
    </>
  );

  const renderRegistrationForm = () => {
    if (!userType) {
      return renderUserTypeSelection();
    } else if (userType === "buyer") {
      return renderBuyerForm();
    } else if (userType === "supplier") {
      return renderSupplierForm();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          חזרה
        </Button>
      </div>
      
      <Card className="shadow-lg border-0">
        <CardContent className="pt-4 md:pt-6">
          {activeTab === "login" && (
            <div className="mt-0">
              <div className="space-y-4 md:space-y-6">
                <div className="text-center mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-1">ברוכים הבאים</h2>
                  <p className="text-gray-500 text-sm">התחבר כדי להמשיך</p>
                </div>
                
                <div className="max-w-md mx-auto space-y-4" dir="rtl">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-base">כתובת אימייל</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="pr-10 text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                       <Label htmlFor="password" className="text-base">סיסמה</Label>
                      <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                        שכחת סיסמה?
                      </Link>
                    </div>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute left-0 top-0 h-full px-3 py-2 text-blue-600 hover:text-blue-700"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="text-right h-11 border-blue-200 focus-visible:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm">זכור אותי</Label>
                  </div>
                  
                  <Button 
                    onClick={handleLogin}
                    className="w-full h-11 mt-4 bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    disabled={!formData.email || !formData.password || loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        מתחבר...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        התחבר
                      </span>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">או התחבר באמצעות</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-[#4285F4] transition-all rounded-lg"
                      // onClick={() => handleSocialLogin('google')}
                      disabled={loading}
                    >
                      <GoogleLogo />
                      <span>Google</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-[#1877F2] transition-all rounded-lg"
                      // onClick={() => handleSocialLogin('facebook')}
                      disabled={loading}
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <span>Facebook</span>
                    </Button>
                  </div>

                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                      אין לך חשבון?{" "}
                      <Link 
                        to={`${createPageUrl("Auth")}?tab=register`}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                      >
                        הרשם עכשיו
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "register" && (
            <div className="mt-0" dir="rtl">
              {renderRegistrationForm()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
