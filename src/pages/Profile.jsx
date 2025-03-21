import React, { useState, useEffect } from "react";
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
  Globe,
  ShoppingBag,
  AlertCircle,
  Check,
  Pencil,
  UserPlus,
  Settings,
  Star,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    company_name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
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
          website: userData.website || "",
          logo_url: userData.logo_url || "",
          business_type: userData.user_metadata?.business_type || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("User not authenticated:", error);
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
      
      // Also update user metadata with business_type if it has changed
      if (user.user_metadata?.business_type !== profileData.business_type) {
        try {
          await User.updateUserMetadata({
            business_type: profileData.business_type
          });
          console.log("User metadata updated with business_type:", profileData.business_type);
        } catch (err) {
          console.error("Failed to update user metadata:", err);
        }
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
      toast({
        title: "הפרופיל עודכן בהצלחה",
        description: "השינויים שלך נשמרו",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בעדכון הפרופיל",
        description: "אנא נסה שוב מאוחר יותר",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isBusiness = user.business_type === "supplier";

  return (
    <div className="space-y-8" >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">הפרופיל שלי</h1>
        <Button 
          onClick={() => setEditMode(!editMode)}
          variant={editMode ? "outline" : "default"}
        >
          {editMode ? (
            <>בטל עריכה</>
          ) : (
            <>
              <Pencil className="ml-2 h-4 w-4" />
              ערוך פרופיל
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full" dir="rtl">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>פרופיל</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>הגדרות</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6" dir="rtl">
          {!editMode ? (
            // View Mode
            <div className="space-y-6">
              <Card>
                <CardHeader className="relative">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg"></div>
                  <div className="relative mt-12 flex flex-col items-center">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      {profileData.logo_url ? (
                        <AvatarImage src={profileData.logo_url} alt={profileData.full_name} />
                      ) : (
                        <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                          {profileData.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="mt-4 text-center">
                      <CardTitle className="text-2xl">
                        {isBusiness ? profileData.company_name : profileData.full_name}
                      </CardTitle>
                      <CardDescription className="text-sm">{user.email}</CardDescription>
                      
                      <div className="flex justify-center mt-2">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {isBusiness ? "ספק" : "קונה"}
                        </Badge>
                        {isBusiness && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 mr-2 flex items-center">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
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
                      
                      {isBusiness && profileData.website && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-2 bg-blue-50 rounded-full">
                            <Globe className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">אתר אינטרנט</p>
                            <a 
                              href={profileData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {profileData.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {!isBusiness && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">חיפוש ספקים</CardTitle>
                      <CardDescription>מצא ספקים מתאימים לעסק שלך</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-10">
                        <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">מחפשים ספקים?</h3>
                        <p className="text-gray-500 mb-6">
                          גלו ספקים איכותיים שיכולים לעזור לעסק שלך לצמוח
                        </p>
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (user) {
                              window.location.href = createPageUrl("Search");
                            } else {
                              window.location.href = createPageUrl("Auth") + "?tab=login&redirect=Search";
                            }
                          }}
                        >
                          חפש ספקים
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {isBusiness && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">חוות דעת מלקוחות</CardTitle>
                    <CardDescription>מה לקוחות אומרים על העסק שלך</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">אין חוות דעת עדיין</h3>
                      <p className="text-gray-500 mb-6">
                        עדיין אין חוות דעת על העסק שלך
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Edit Mode
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
                  
                  {isBusiness && (
                    <div className="space-y-2">
                      <Label htmlFor="website">אתר אינטרנט</Label>
                      <Input
                        id="website"
                        name="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">קישור לתמונת פרופיל/לוגו</Label>
                    <Input
                      id="logo_url"
                      name="logo_url"
                      value={profileData.logo_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
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
                <h3 className="text-lg font-medium">שינוי סיסמה</h3>
                <p className="text-gray-500 text-sm">
                  התכונה לשינוי סיסמה אינה זמינה כעת, שינוי סיסמה מתבצע דרך התחברות חדשה
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">הודעות והתראות</h3>
                <p className="text-gray-500 text-sm">
                  הגדרות להודעות מייל והתראות אינן זמינות כעת
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-red-600">מחיקת חשבון</h3>
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
                <Button variant="destructive" className="mt-2">
                  מחק את החשבון שלי
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 