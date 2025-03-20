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
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    businessType: "buyer",
    agreeTerms: false
  });
  const [redirectTo, setRedirectTo] = useState("");

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
      await User.login(formData.email, formData.password);
      toast.success("התחברת בהצלחה");
      if (redirectTo) {
        navigate(createPageUrl(redirectTo));
      } else {
        navigate(createPageUrl("Home"));
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.message || "התחברות נכשלה");
    }
    setLoading(false);
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
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("נא לאשר את תנאי השימוש");
      return;
    }
    
    setLoading(true);
    try {
      await User.register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.businessType
      );
      
      toast.success("נרשמת בהצלחה! נא לאשר את כתובת האימייל שלך");
      
      if (redirectTo) {
        navigate(createPageUrl(redirectTo));
      } else {
        navigate(createPageUrl("Home"));
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.message || "הרשמה נכשלה");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
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
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(createPageUrl("ProductPublish"))}
          className="gap-1"
        >
          פרסום מוצר
        </Button>
      </div>
      
      <Card className="shadow-lg border-0">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">התחברות</TabsTrigger>
              <TabsTrigger value="register">הרשמה</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">ברוכים הבאים</h2>
                <p className="text-gray-500">התחבר כדי להמשיך</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">סיסמה</Label>
                      <Link to="/" className="text-sm text-blue-600 hover:underline">
                        שכחת סיסמה?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm">זכור אותי</Label>
                  </div>
                  
                  <Button 
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!formData.email || !formData.password || loading}
                  >
                    התחברות
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">הרשמה לאתר</h2>
                <p className="text-gray-500">צור חשבון חדש בסיטונאות ישראל</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">שם מלא</Label>
                    <Input 
                      id="fullName" 
                      placeholder="ישראל ישראלי" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">אימייל</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">סיסמה</Label>
                    <Input 
                      id="register-password" 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">סוג עסק</Label>
                    <Select 
                      value={formData.businessType}
                      onValueChange={(value) => setFormData({...formData, businessType: value})}
                    >
                      <SelectTrigger id="businessType">
                        <SelectValue placeholder="בחר סוג עסק" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">קמעונאי / רוכש</SelectItem>
                        <SelectItem value="supplier">ספק / סיטונאי</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="terms" 
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, agreeTerms: checked === true})
                      }
                    />
                    <Label htmlFor="terms" className="text-sm">
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
                  
                  <Button 
                    onClick={handleRegister}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={
                      !formData.email || 
                      !formData.password || 
                      !formData.fullName || 
                      !formData.agreeTerms ||
                      loading
                    }
                  >
                    הרשמה
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
