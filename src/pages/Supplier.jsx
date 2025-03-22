import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl, redirectToLogin } from "@/utils";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { Message } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building,
  Check,
  FileText,
  Globe,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  Truck,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SupplierProfile() {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const supplierId = urlParams.get("id");
        
        if (!supplierId) {
          navigate(createPageUrl("Suppliers"));
          return;
        }
        
        // Load supplier data
        const allUsers = await User.list();
        const supplierData = allUsers.find(u => u.id === supplierId);
        
        if (!supplierData) {
          navigate(createPageUrl("Suppliers"));
          return;
        }
        
        setSupplier(supplierData);
        
        // Load supplier's products
        const allProducts = await Product.list();
        const supplierProducts = allProducts.filter(
          p => p.supplier_id === supplierId && p.status === "active"
        );
        setProducts(supplierProducts);
        
        // Try to load current user
        try {
          const userData = await User.me();
          setCurrentUser(userData);
        } catch (error) {
          console.log("User not logged in");
        }
      } catch (error) {
        console.error("Error loading supplier:", error);
        navigate(createPageUrl("Suppliers"));
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [navigate]);
  
  const handleSendMessage = async () => {
    if (!currentUser || !message.trim()) return;
    
    setSendingMessage(true);
    
    try {
      await Message.create({
        sender_id: currentUser.id,
        receiver_id: supplier.id,
        content: message
      });
      
      setMessage("");
      alert("ההודעה נשלחה בהצלחה!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("אירעה שגיאה בשליחת ההודעה");
    }
    
    setSendingMessage(false);
  };
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }
  
  if (!supplier) return null;
  
  const categoryOptions = {
    "electronics": "אלקטרוניקה",
    "clothing": "ביגוד",
    "home_goods": "מוצרי בית",
    "food_beverage": "מזון ומשקאות",
    "health_beauty": "בריאות ויופי",
    "industrial": "ציוד תעשייתי",
    "automotive": "רכב",
    "sports": "ספורט",
    "toys": "צעצועים"
  };

  return (
    <div>
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
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        
        {/* Supplier Info */}
        <div className="p-6 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Logo/Avatar */}
            <div className="w-24 h-24 rounded-xl bg-white shadow-md overflow-hidden border-4 border-white absolute -top-12">
              {supplier.logo_url ? (
                <img 
                  src={supplier.logo_url} 
                  alt={supplier.company_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Building className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="mt-12 md:mt-0 md:mr-28">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{supplier.company_name || supplier.full_name}</h1>
                {supplier.verified && (
                  <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50">
                    <Check className="h-3 w-3" />
                    ספק מאומת
                  </Badge>
                )}
              </div>
              <p className="text-gray-500">
                {supplier.categories?.map(cat => categoryOptions[cat] || cat).join(", ") || "ספק סיטוני"}
              </p>
            </div>
            
            <div className="mr-auto">
              {currentUser && currentUser.id !== supplier.id && (
                <Button>
                  <MessageSquare className="h-4 w-4 ml-2" />
                  יצירת קשר
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Supplier Details */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">פרטי הספק</h2>
            
            <div className="space-y-4">
              {supplier.description && (
                <div>
                  <p className="text-gray-700">{supplier.description}</p>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-3">
                {supplier.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">כתובת</p>
                      <p className="text-gray-600">{supplier.address}</p>
                    </div>
                  </div>
                )}
                
                {supplier.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">טלפון</p>
                      <p className="text-gray-600">{supplier.phone}</p>
                    </div>
                  </div>
                )}
                
                {supplier.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">אתר אינטרנט</p>
                      <a 
                        href={supplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          {currentUser && currentUser.id !== supplier.id && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">שלח הודעה לספק</h2>
              
              {currentUser ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="כתוב את הודעתך כאן..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-32"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!message.trim() || sendingMessage}
                    className="w-full"
                  >
                    שלח הודעה
                  </Button>
                </div>
              ) : (
                <div>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      יש להתחבר כדי לשלוח הודעות לספקים
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={() => navigate(redirectToLogin("Supplier"))} 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="h-5 w-5" />
                      התחברות
                    </span>
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
        
        {/* Main Content - Products */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="products">
            <TabsList className="mb-6">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>מוצרים ({products.length})</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>משלוחים</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>דירוגים וביקורות</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              {products.length === 0 ? (
                <Card className="p-8 text-center">
                  <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">אין מוצרים זמינים</h3>
                  <p className="text-gray-500">
                    לספק זה אין מוצרים פעילים כרגע. בדוק שוב מאוחר יותר.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(product => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <Link to={createPageUrl("Product") + `?id=${product.id}`}>
                        <div className="h-40 overflow-hidden">
                          <img
                            src={product.images?.[0] || "https://via.placeholder.com/300"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium mb-1 truncate">{product.title}</h3>
                          <div className="flex items-center text-sm">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium mr-1">{product.rating?.toFixed(1) || "N/A"}</span>
                          </div>
                          <p className="text-gray-500 text-sm mt-2 mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-blue-600">₪{product.price.toFixed(2)}+</span>
                            <span className="text-xs text-gray-500">MOQ: {product.minimum_order}</span>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shipping">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">מדיניות משלוחים</h3>
                <p className="text-gray-700">
                  מידע על מדיניות המשלוחים של הספק אינו זמין כרגע. אנא צור קשר עם הספק לקבלת פרטים.
                </p>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">דירוגים וביקורות</h3>
                <p className="text-gray-700">
                  אין דירוגים או ביקורות זמינים כרגע לספק זה.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}