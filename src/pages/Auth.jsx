import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Phone 
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/api/supabaseClient";

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    businessType: "buyer",
    agreeTerms: false,
    companyName: "",
    description: "",
    address: "",
    phone: "",
  });
  const [redirectTo, setRedirectTo] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    const redirect = urlParams.get("redirect");
    
    if (tab === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
    
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, []);

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

      // Show success message
      toast.success("ההרשמה הושלמה בהצלחה! אנא התחבר כדי להמשיך.");
      
      // Switch to login tab
      setActiveTab("login");
      
      // Sign out the user if they were automatically signed in
      await supabase.auth.signOut();

    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.message || "אירעה שגיאה בתהליך ההרשמה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
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
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-base py-3">התחברות</TabsTrigger>
              <TabsTrigger value="register" className="text-base py-3">הרשמה</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">ברוכים הבאים</h2>
                  <p className="text-gray-500">התחבר כדי להמשיך</p>
                </div>
                
                <div className="max-w-md mx-auto space-y-5" dir="rtl">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">כתובת אימייל</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="pr-10 text-right h-12 border-blue-200 focus-visible:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                        שכחת סיסמה?
                      </Link>
                      <Label htmlFor="password" className="text-base">סיסמה</Label>
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
                        className="text-right h-12 border-blue-200 focus-visible:ring-blue-500"
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
                    className="w-full h-12 mt-6 bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
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
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0" dir="rtl" >
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">הרשמה לאתר</h2>
                  <p className="text-gray-500">צור חשבון חדש בסיטונאות ישראל</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-base text-right">שם מלא</Label>
                      <div className="relative">
                        <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                        <Input 
                          id="fullName" 
                          placeholder="ישראל ישראלי" 
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="pr-10 text-right h-12 border-blue-200 focus-visible:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-base text-right">אימייל</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                        <Input 
                          id="register-email" 
                          type="email" 
                          placeholder="email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="pr-10 text-right h-12 border-blue-200 focus-visible:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
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
                          className="text-right h-12 border-blue-200 focus-visible:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2" >
                      <Label htmlFor="businessType" className="text-base text-right">סוג עסק</Label>
                      <div className="relative">
                        <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                        <Select 
                          value={formData.businessType}
                          onValueChange={(value) => setFormData({...formData, businessType: value})}
                          disabled={loading}
                        >
                          <SelectTrigger id="businessType" className="text-right pr-10 h-12 border-blue-200 focus-visible:ring-blue-500" dir="rtl">
                            <SelectValue placeholder="בחר סוג עסק" />
                          </SelectTrigger>
                          <SelectContent dir="rtl">
                            <SelectItem value="buyer">קמעונאי / רוכש</SelectItem>
                            <SelectItem value="supplier">ספק / סיטונאי</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse mt-4">
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
                  </div>

                  {formData.businessType === "supplier" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-base text-right">שם העסק</Label>
                        <div className="relative">
                          <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                          <Input 
                            id="companyName" 
                            placeholder="שם העסק המלא" 
                            value={formData.companyName}
                            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                            className="pr-10 text-right h-12 border-blue-200 focus-visible:ring-blue-500"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-base text-right">תיאור העסק</Label>
                        <Textarea 
                          id="description" 
                          placeholder="תאר את העסק שלך, המוצרים שאתה מציע והיתרונות שלך כספק..." 
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={4}
                          className="text-right border-blue-200 focus-visible:ring-blue-500"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-base text-right">כתובת העסק</Label>
                        <div className="relative">
                          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                          <Input 
                            id="address" 
                            placeholder="כתובת מלאה" 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="pr-10 text-right h-12 border-blue-200 focus-visible:ring-blue-500"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base text-right">טלפון</Label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
                          <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="מספר טלפון" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="pr-10 text-right h-12 border-blue-200 focus-visible:ring-blue-500"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md mt-4 text-center font-medium">
                    {error}
                  </div>
                )}

                <div className="mt-6">
                  <Button 
                    onClick={handleRegister}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
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
                  
                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                      כבר יש לך חשבון?{" "}
                      <button 
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                      >
                        התחבר כאן
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
