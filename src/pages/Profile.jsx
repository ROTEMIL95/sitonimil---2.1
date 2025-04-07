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
import UserInfoCard from "../components/UserInfoCard";

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
    social_links: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: ""
    }
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
          social_links: userData.social_links || {
            facebook: "https://www.facebook.com/", 
            twitter: "https://twitter.com/",
            linkedin: "https://www.linkedin.com/",
            instagram: "https://instagram.com/"
          }
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
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
    <div className="space-y-8" dir="rtl">
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

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 cursor-pointer relative"
                 onClick={handleAvatarClick}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {profileData.logo_url ? (
                <img src={profileData.logo_url} alt={profileData.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-bold">
                  {profileData.full_name?.charAt(0) || "U"}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-right">
                {isBusiness ? profileData.company_name : profileData.full_name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isBusiness ? "ספק" : "קונה"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profileData.address || "ישראל"}
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <a
                href={profileData.social_links?.facebook || "#"}
                target="_blank"
                rel="noopener"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z"
                    fill=""
                  />
                </svg>
              </a>

              <a
                href={profileData.social_links?.twitter || "#"}
                target="_blank"
                rel="noopener"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z"
                    fill=""
                  />
                </svg>
              </a>

              <a
                href={profileData.social_links?.linkedin || "#"}
                target="_blank"
                rel="noopener"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z"
                    fill=""
                  />
                </svg>
              </a>

              <a
                href={profileData.social_links?.instagram || "#"}
                target="_blank"
                rel="noopener"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z"
                    fill=""
                  />
                </svg>
              </a>
            </div>
          </div>
          <Button 
            onClick={() => setEditMode(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            variant="outline"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            ערוך
          </Button>
        </div>
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

        <TabsContent value="profile" className="mt-6">
          <UserInfoCard userData={user} onSave={(updatedData) => handleSaveProfile()} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="border-gray-200 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle>הגדרות פרופיל</CardTitle>
              <CardDescription>נהל את הגדרות החשבון שלך</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
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