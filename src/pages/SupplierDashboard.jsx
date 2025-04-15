// src/pages/SupplierDashboard.jsx - Dashboard for suppliers
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { Message } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Package,
  Plus,
  MessageSquare,
  Settings,
  FileText,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  ShoppingBag,
  Badge,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    pendingMessages: 0,
  });
  
  // Profile settings state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    company_name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    logo_url: "",
  });
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userData = await User.me();
        if (!userData) {
          navigate(createPageUrl("Home"));
          return;
        }
        
        // Check if user is a supplier
        const isSupplier = (userData.user_metadata?.business_type === "supplier") || (userData.business_type === "supplier");
        
        if (!isSupplier) {
          console.log("User is not a supplier:", userData);
          navigate(createPageUrl("Home"));
          return;
        }
        
        // Ensure business_type is set in both places
        if (userData.business_type !== "supplier" || userData.user_metadata?.business_type !== "supplier") {
          // Update both the database record and user metadata
          await User.updateMyUserData({ business_type: "supplier" });
          
          if (userData.user_metadata?.business_type !== "supplier") {
            await User.updateUserMetadata({ business_type: "supplier" });
          }
          
          // Update local state
          userData.business_type = "supplier";
          userData.user_metadata = { 
            ...(userData.user_metadata || {}), 
            business_type: "supplier" 
          };
        }
        
        setUser(userData);
        setProfileData({
          company_name: userData.company_name || "",
          description: userData.description || "",
          address: userData.address || "",
          phone: userData.phone || "",
          website: userData.website || "",
          logo_url: userData.logo_url || "",
        });
        
        await loadData(userData.id);
      } catch (error) {
        console.error("Not authenticated:", error);
        navigate(createPageUrl("Home"));
      }
    };
    
    checkAccess();
  }, [navigate]);
  
  const loadData = async (userId) => {
    setLoading(true);
    try {
      // Load products
      const allProducts = await Product.list();
      const myProducts = allProducts.filter(p => p.supplier_id === userId);
      setProducts(myProducts);
      
      // Load messages
      const allMessages = await Message.list();
      const myMessages = allMessages.filter(m => m.receiver_id === userId);
      setMessages(myMessages);
      
      // Calculate stats
      setStats({
        totalProducts: myProducts.length,
        activeProducts: myProducts.filter(p => p.status === "active").length,
        lowStock: myProducts.filter(p => p.stock < p.minimum_order).length,
        pendingMessages: myMessages.filter(m => !m.read).length,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };
  
  const handleProfileUpdate = async () => {
    try {
      await User.updateMyUserData(profileData);
      setEditingProfile(false);
      alert("הפרופיל עודכן בהצלחה!");
      
      // Update local user data
      setUser({ ...user, ...profileData });
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("אירעה שגיאה בעדכון הפרופיל");
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מוצר זה?")) return;
    
    try {
      // Find the product before deletion to check its status and details
      const productToDelete = products.find(p => p.id === productId);
      if (!productToDelete) {
        throw new Error("המוצר לא נמצא");
      }

      // Delete from database first
      await Product.delete(productId);
      
      // If deletion was successful, update the UI
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      
      // Update all relevant stats
      setStats(prev => ({
        ...prev,
        totalProducts: prev.totalProducts - 1,
        activeProducts: productToDelete.status === "active" ? prev.activeProducts - 1 : prev.activeProducts,
        lowStock: productToDelete.stock < productToDelete.minimum_order ? prev.lowStock - 1 : prev.lowStock
      }));
      
      alert("המוצר נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("אירעה שגיאה במחיקת המוצר: " + (error.message || "אנא נסה שוב מאוחר יותר"));
    }
  };
  
  const handleToggleProductStatus = async (product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    
    try {
      await Product.update(product.id, { status: newStatus });
      
      // Update local state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, status: newStatus } : p
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeProducts: newStatus === "active" 
          ? prev.activeProducts + 1 
          : prev.activeProducts - 1
      }));
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("אירעה שגיאה בעדכון סטטוס המוצר");
    }
  };

  const handleMarkMessageAsRead = async (messageId) => {
    try {
      await Message.update(messageId, { read: true });
      
      // Update local state
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, read: true } : m
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingMessages: prev.pendingMessages - 1
      }));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };
  
  if (loading && !user) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">לוח בקרה לספק</h1>
        <p className="text-gray-500">נהל את המוצרים, הזמנות וההודעות שלך</p>
      </div>
      
      {!user?.company_name && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>השלם את פרופיל העסק שלך</AlertTitle>
          <AlertDescription>
            כדי שקונים יוכלו למצוא אותך בקלות, אנא השלם את פרטי העסק שלך בלשונית "הגדרות".
          </AlertDescription>
        </Alert>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">סה"כ מוצרים</p>
              <h4 className="text-2xl font-bold">{stats.totalProducts}</h4>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">מוצרים פעילים</p>
              <h4 className="text-2xl font-bold">{stats.activeProducts}</h4>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">מלאי נמוך</p>
              <h4 className="text-2xl font-bold">{stats.lowStock}</h4>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">הודעות חדשות</p>
              <h4 className="text-2xl font-bold">{stats.pendingMessages}</h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" dir="rtl">
        <TabsList className="mb-6 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger 
            value="products" 
            className="flex items-center gap-2 rounded-lg font-medium transition-all py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-[rgb(2,132,199)] data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[rgb(2,132,199)]"
          >
            <ShoppingBag className="h-4 w-4" />
            מוצרים
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="flex items-center gap-2 rounded-lg font-medium transition-all py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-[rgb(2,132,199)] data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[rgb(2,132,199)]"
          >
            <MessageSquare className="h-4 w-4" />
            הודעות
            {stats.pendingMessages > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">{stats.pendingMessages}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 rounded-lg font-medium transition-all py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-[rgb(2,132,199)] data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[rgb(2,132,199)]"
          >
            <Settings className="h-4 w-4" />
            הגדרות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">המוצרים שלי</h2>
            <Button onClick={() => navigate(createPageUrl("UploadProduct"))}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף מוצר חדש
            </Button>
          </div>
          
          {products.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                <Package className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">אין לך מוצרים עדיין</h3>
              <p className="text-gray-500 mb-4">התחל למכור על ידי הוספת המוצר הראשון שלך</p>
              <Button onClick={() => navigate(createPageUrl("UploadProduct"))}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף מוצר חדש
              </Button>
            </Card>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-sm font-medium text-gray-700 bg-gray-50">
                    <th className="py-3 px-4 text-right">מוצר</th>
                    <th className="py-3 px-4 text-right">מחיר</th>
                    <th className="py-3 px-4 text-right">קטגוריה</th>
                    <th className="py-3 px-4 text-right">מלאי</th>
                    <th className="py-3 px-4 text-right">סטטוס</th>
                    <th className="py-3 px-4 text-center">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex-shrink-0 mr-3">
                            <img
                              src={product.images?.[0] || "https://via.placeholder.com/100"}
                              alt={product.title}
                              className="w-full h-full rounded-md object-cover"
                            />
                          </div>
                          <div className="max-w-xs truncate">{product.title}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-blue-600 font-medium">
                        ₪{product.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        {product.category.replace(/_/g, " ")}
                      </td>
                      <td className="py-4 px-4">
                        <div className={`font-medium ${
                          product.stock <= product.minimum_order ? "text-red-600" : "text-gray-900"
                        }`}>
                          {product.stock}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Switch
                            checked={product.status === "active"}
                            onCheckedChange={() => handleToggleProductStatus(product)}
                          />
                          <span className="mr-2 text-sm">
                            {product.status === "active" ? "פעיל" : "לא פעיל"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(createPageUrl("Product") + `?id=${product.id}`)}
                            title="צפה במוצר"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(createPageUrl("UploadProduct") + `?edit=${product.id}`)}
                            title="ערוך מוצר"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="מחק מוצר"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <h2 className="text-xl font-semibold">הודעות מלקוחות</h2>
          
          {messages.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                <MessageSquare className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">אין הודעות חדשות</h3>
              <p className="text-gray-500">התראות יופיעו כאן כאשר תקבל הודעות מלקוחות</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`p-4 transition-colors ${!message.read ? "border-blue-300 bg-blue-50" : ""}`}
                >
                  <div className="flex justify-between mb-3">
                    <div className="font-semibold">
                      מאת: {message.sender_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(message.created_date).toLocaleString("he-IL")}
                    </div>
                  </div>
                  
                  {message.product_id && (
                    <div className="text-sm text-gray-600 mb-2">
                      בנוגע למוצר: {products.find(p => p.id === message.product_id)?.title || message.product_id}
                    </div>
                  )}
                  
                  <p className="text-gray-800 mb-3">{message.content}</p>
                  
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm">הגב</Button>
                    
                    {!message.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkMessageAsRead(message.id)}
                      >
                        סמן כנקרא
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold">הגדרות פרופיל</h2>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">פרטי העסק שלך</h3>
              <Button 
                variant={editingProfile ? "default" : "outline"}
                onClick={() => setEditingProfile(!editingProfile)}
              >
                {editingProfile ? "ביטול" : "ערוך"}
              </Button>
            </div>
            
            {editingProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">שם העסק</Label>
                    <Input
                      id="company_name"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData({...profileData, company_name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">קישור ללוגו</Label>
                    <Input
                      id="logo_url"
                      value={profileData.logo_url}
                      onChange={(e) => setProfileData({...profileData, logo_url: e.target.value})}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">תיאור העסק</Label>
                    <Textarea
                      id="description"
                      value={profileData.description}
                      onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                      placeholder="תאר את העסק שלך, המוצרים שאתה מציע והיתרונות שלך כספק..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">כתובת</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">אתר אינטרנט</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button onClick={handleProfileUpdate}>שמור שינויים</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.logo_url ? (
                      <img 
                        src={profileData.logo_url} 
                        alt="לוגו" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">
                      {profileData.company_name || user.full_name}
                    </h4>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-sm text-gray-500">תיאור</p>
                    <p className="font-medium">{profileData.description || "לא הוגדר"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">כתובת</p>
                    <p className="font-medium">{profileData.address || "לא הוגדר"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">טלפון</p>
                    <p className="font-medium">{profileData.phone || "לא הוגדר"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">אתר אינטרנט</p>
                    <p className="font-medium">
                      {profileData.website ? (
                        <a 
                          href={profileData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profileData.website}
                        </a>
                      ) : (
                        "לא הוגדר"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 