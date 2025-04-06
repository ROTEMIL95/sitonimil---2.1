import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  User as UserIcon,
  Building,
  Phone,
  MapPin,
  Mail,
  AlertCircle,
  Check,
  Pencil,
  Settings,
  Star,
  Upload,
  Loader2,
  Camera,
  Shield,
  Bell,
  Key,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/api/supabaseClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageMeta from "@/components/PageMeta";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    company_name: "",
    description: "",
    address: "",
    phone: "",
    logo_url: "",
    business_type: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        setProfileData({
          full_name: userData.full_name || "",
          company_name: userData.company_name || "",
          description: userData.description || "",
          address: userData.address || "",
          phone: userData.phone || "",
          logo_url: userData.logo_url || "",
          business_type: userData.business_type || userData.user_metadata?.business_type || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("User not authenticated:", error);
        toast.error("נדרשת התחברות לצפייה בפרופיל");
        navigate(createPageUrl("Auth"));
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await User.updateMyUserData(profileData);
      
      if (user.user_metadata?.business_type !== profileData.business_type) {
        await User.updateUserMetadata({
          business_type: profileData.business_type
        });
      }
      
      setUser((prev) => ({
        ...prev,
        ...profileData,
        user_metadata: {
          ...(prev.user_metadata || {}),
          business_type: profileData.business_type
        }
      }));
      
      setEditMode(false);
      toast.success("הפרופיל עודכן בהצלחה");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("שגיאה בעדכון הפרופיל");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("אנא בחר קובץ תמונה (JPG, PNG, GIF)");
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("גודל הקובץ המקסימלי הוא 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const safeFileName = file.name.replace(/[^\w.]/gi, "_");
      const filePath = `${Date.now()}-${safeFileName}`;
      
      const { data, error } = await supabase.storage
        .from("profile-image")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase
        .storage
        .from("profile-image")
        .getPublicUrl(filePath);

      const updatedProfileData = {
        ...profileData,
        logo_url: publicUrl,
        avatar_url: publicUrl
      };

      await User.updateMyUserData(updatedProfileData);
      setProfileData(updatedProfileData);
      setUser(prev => ({
        ...prev,
        logo_url: publicUrl,
        avatar_url: publicUrl
      }));

      // Dispatch custom event for real-time avatar update
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: {
          message: "תמונת הפרופיל עודכנה בהצלחה"
        }
      }));

      toast.success("תמונת הפרופיל עודכנה בהצלחה");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("שגיאה בהעלאת התמונה");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    
    try {
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      
      await supabase.auth.signOut();
      
      toast.success("החשבון נמחק בהצלחה");
      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Error deleting account:", error);
      setLoading(false);
      toast.error("שגיאה במחיקת החשבון");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isBusiness = (user.user_metadata?.business_type === "supplier") || (user.business_type === "supplier");

  return (
    <div className="space-y-8">
      <PageMeta
        title={`הפרופיל של ${user.full_name || "משתמש"} | Sitonim-il`}
        description={`צפייה ועריכת פרטי הפרופיל של ${user.full_name || "המשתמש"}. עדכן פרטים אישיים, תמונת פרופיל, ונתונים נוספים.`}
      />
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">הפרופיל שלי</h1>
        <Button 
          onClick={() => setEditMode(!editMode)}
          variant={editMode ? "outline" : "default"}
        >
          {editMode ? "בטל עריכה" : (
            <>
              <Pencil className="ml-2 h-4 w-4" />
              ערוך פרופיל
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6" dir="rtl">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 rounded-lg font-medium transition-all py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            <UserIcon className="h-4 w-4" />
            פרופיל
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 rounded-lg font-medium transition-all py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4" />
            הגדרות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {!editMode ? (
            <Card>
              <CardHeader className="relative">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg"></div>
                <div className="relative mt-12 flex flex-col items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  
                  <div 
                    className="relative cursor-pointer group"
                    onClick={handleAvatarClick}
                  >
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      {profileData.logo_url ? (
                        <AvatarImage src={profileData.logo_url} alt={profileData.full_name} />
                      ) : (
                        <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                          {profileData.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <CardTitle className="text-2xl">
                      {isBusiness ? profileData.company_name : profileData.full_name}
                    </CardTitle>
                    <CardDescription className="text-sm">{user.email}</CardDescription>
                    
                    <div className="flex justify-center mt-2">
                      <Badge className="bg-blue-100 text-blue-700">
                        {isBusiness ? "ספק" : "קונה"}
                      </Badge>
                      {isBusiness && (
                        <Badge className="bg-green-100 text-green-700 mr-2 flex items-center">
                          <Check className="h-3 w-3 ml-1" />
                          מאומת
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-6">
                  {profileData.description && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">אודות</h3>
                      <p className="text-gray-600">{profileData.description}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-blue-50 rounded-full">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">שם מלא</p>
                        <p className="font-medium">{profileData.full_name || "לא הוגדר"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-blue-50 rounded-full">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">דואר אלקטרוני</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    
                    {isBusiness && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-blue-50 rounded-full">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">שם חברה</p>
                          <p className="font-medium">{profileData.company_name || "לא הוגדר"}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-blue-50 rounded-full">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">טלפון</p>
                        <p className="font-medium">{profileData.phone || "לא הוגדר"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-blue-50 rounded-full">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">כתובת</p>
                        <p className="font-medium">{profileData.address || "לא הוגדר"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>עריכת פרופיל</CardTitle>
                <CardDescription>עדכן את פרטי הפרופיל שלך</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">שם מלא</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {isBusiness && (
                    <div className="space-y-2">
                      <Label htmlFor="company_name">שם חברה</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={profileData.company_name}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">כתובת</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">תיאור</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={profileData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder={isBusiness ? "תאר את העסק שלך והשירותים שאתה מציע..." : "ספר על עצמך..."}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="business_type">סוג עסק</Label>
                    <select
                      id="business_type"
                      name="business_type"
                      value={profileData.business_type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md text-right px-3 py-2"
                    >
                      <option value="">בחר סוג עסק</option>
                      <option value="supplier">ספק</option>
                      <option value="buyer">קונה</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 gap-3">
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    שמור שינויים
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות פרופיל</CardTitle>
              <CardDescription>נהל את הגדרות החשבון שלך</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  שינוי סיסמה
                </h3>
                <p className="text-gray-500 text-sm">
                  התכונה לשינוי סיסמה אינה זמינה כעת, שינוי סיסמה מתבצע דרך התחברות חדשה
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  הודעות והתראות
                </h3>
                <p className="text-gray-500 text-sm">
                  הגדרות להודעות מייל והתראות אינן זמינות כעת
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-red-600 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  מחיקת חשבון
                </h3>
                <p className="text-gray-500 text-sm">
                  מחיקת החשבון היא פעולה בלתי הפיכה שתמחק את כל המידע והתוכן שלך
                </p>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>אזהרה</AlertTitle>
                  <AlertDescription>
                    מחיקת חשבון תסיר לצמיתות את כל הנתונים והמידע האישי שלך ואינה ניתנת לביטול.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="destructive" 
                  className="mt-2"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      מוחק...
                    </>
                  ) : (
                    "מחק את החשבון שלי"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              אזהרה
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              מחיקת חשבון תסיר לצמיתות את כל הנתונים והמידע האישי שלך ואינה ניתנת לביטול.
              <br /><br />
              האם אתה בטוח שברצונך למחוק את החשבון?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse space-x-reverse space-x-2">
            <AlertDialogCancel className="mt-0">ביטול</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
            >
              כן, מחק את החשבון
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 