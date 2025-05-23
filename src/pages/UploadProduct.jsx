import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadProduct as UploadProductAPI } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ImagePlus, X, AlertCircle, Plus, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/api/supabaseClient";
import { toast } from "sonner";

export default function UploadProduct() {
  const navigate = useNavigate();
  const params = useParams();
  const productId = params.id;
  const editMode = !!productId;
  
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    price: 0,
    minimum_order: 1,
    stock: 0,
    category: "",
    images: [],
    specifications: {},
    status: "active",
    contact_for_price: false
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  
  // Add validation state
  const [errors, setErrors] = useState({
    title: false,
    price: false,
    category: false,
    minimum_order: false,
    stock: false
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check for product data in sessionStorage first (from admin edit)
        const storedProductData = sessionStorage.getItem('editProductData');
        
        // Load user data
        const userData = await User.me();
        setUser(userData);
        
        // If we have stored product data from admin section, use that
        if (storedProductData) {
          try {
            const parsedData = JSON.parse(storedProductData);
            console.log("Loading product data from sessionStorage:", parsedData);
            setProductData(parsedData);
            // Clear sessionStorage after use
            sessionStorage.removeItem('editProductData');
            setLoading(false);
            return;
          } catch (e) {
            console.error("Error parsing stored product data:", e);
            // Continue with normal flow if parsing fails
          }
        }
        
        // Check if user is a supplier using consistent approach
        const isSupplier = (userData?.user_metadata?.business_type === "supplier") || (userData?.business_type === "supplier");
        
        if (!isSupplier) {
          console.log("User is not a supplier:", userData);
          toast.error("רק ספקים יכולים לפרסם מוצרים");
          navigate(createPageUrl("Home"));
          return;
        }

        // Ensure business_type is set in both places if user is a supplier
        if (userData && isSupplier && (userData.business_type !== "supplier" || userData.user_metadata?.business_type !== "supplier")) {
          try {
            // Update the database record if needed
            if (userData.business_type !== "supplier") {
              await User.updateMyUserData({ business_type: "supplier" });
            }
            
            // Update the metadata if needed
            if (userData.user_metadata?.business_type !== "supplier") {
              await User.updateUserMetadata({ business_type: "supplier" });
            }
            
            console.log("Synchronized supplier status in both places");
          } catch (syncError) {
            console.error("Failed to synchronize supplier status:", syncError);
            // Continue anyway since user is already identified as a supplier
          }
        }

        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        // If editing from URL parameter
        if (editId) {
          const product = await Product.getById(editId);
          
          // Verify this product belongs to this user or user is admin
          if (product.supplier_id !== userData.id && userData.role !== 'admin') {
            toast.error("אין לך הרשאה לערוך מוצר זה");
            navigate(createPageUrl("AdminDashboard"));
            return;
          }
          
          setProductData(product);
        } else if (editMode) {
          // If editing using route parameter
          const product = await Product.getById(productId);
          
          // Verify this product belongs to this user or user is admin
          if (product.supplier_id !== userData.id && userData.role !== 'admin') {
            toast.error("אין לך הרשאה לערוך מוצר זה");
            navigate(createPageUrl("AdminAdminDashboard"));
            return;
          }
          
          setProductData(product);
        }
        
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("התרחשה שגיאה בטעינת הנתונים");
        navigate(createPageUrl("Home"));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [productId, editMode, navigate]);
  
  const handleInputChange = (field, value) => {
    setProductData({
      ...productData,
      [field]: value
    });
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("יש להעלות תמונה בפורמט תקין (JPEG, PNG, GIF)");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setImageError("התמונה חייבת להיות קטנה מ-5MB");
      return;
    }
    
    setUploadingImage(true);
    setImageError("");
    
    try {
      const safeFileName = file.name.replace(/[^\w.]/gi, "_");
      // Generate a unique file path
      const filePath = `products/${Date.now()}-${safeFileName}`;
      console.log("🔍 file:", file);
      console.log("📏 size:", file.size);
      
      // Upload the file to Supabase storage using the expected format
      const { data, error } = await supabase
        .storage
        .from("product-image")
        .upload(filePath, file);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from("product-image")
        .getPublicUrl(filePath);
      
      setProductData({
        ...productData,
        images: [...(productData.images || []), publicUrl]
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageError("אירעה שגיאה בהעלאת התמונה");
    } finally {
      setUploadingImage(false);
    }
  };
  
  const removeImage = (index) => {
    const newImages = [...productData.images];
    newImages.splice(index, 1);
    setProductData({
      ...productData,
      images: newImages
    });
  };
  
  const addSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    
    setProductData({
      ...productData,
      specifications: {
        ...productData.specifications,
        [newSpecKey]: newSpecValue
      }
    });
    
    setNewSpecKey("");
    setNewSpecValue("");
  };
  
  const removeSpecification = (key) => {
    const newSpecs = { ...productData.specifications };
    delete newSpecs[key];
    
    setProductData({
      ...productData,
      specifications: newSpecs
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    const newErrors = {
      title: !productData.title,
      price: !productData.price && !productData.contact_for_price,
      category: !productData.category,
      minimum_order: !productData.minimum_order,
      stock: productData.stock === undefined || productData.stock === null
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      toast.error("נא למלא את כל שדות החובה המסומנים");
      return;
    }
    
    // Format numeric fields
    const formattedData = {
      ...productData,
      price: productData.contact_for_price ? null : Number(productData.price),
      minimum_order: Number(productData.minimum_order),
      stock: Number(productData.stock),
      supplier_id: user.id,
      created_at: new Date(),
      images: Array.isArray(productData.images) ? productData.images : [],
      specifications: productData.specifications || {}
    };
    
    setSaving(true);
    
    try {
      if (editMode) {
        // Log product update attempt
        logInfo(LogModule.PRODUCTS, "Product update attempt", {
          productId: productData.id,
          userId: user.id,
          title: productData.title
        });
        
        await Product.update(productData.id, formattedData);
        
        // Log successful product update
        logInfo(LogModule.PRODUCTS, "Product updated successfully", {
          productId: productData.id,
          userId: user.id,
          title: productData.title,
          category: productData.category
        });
        
        toast.success("המוצר עודכן בהצלחה");
        navigate(createPageUrl("AdminDashboard"));
      } else {
        // Log product creation attempt
        logInfo(LogModule.PRODUCTS, "Product creation attempt", {
          userId: user.id,
          title: productData.title,
          category: productData.category
        });
        
        let result;
        if (typeof UploadProductAPI === 'function') {
          result = await UploadProductAPI(formattedData);
        } else {
          result = await Product.create(formattedData);
        }
        
        // Log successful product creation
        logInfo(LogModule.PRODUCTS, "Product created successfully", {
          productId: result?.id,
          userId: user.id,
          title: productData.title,
          category: productData.category
        });
        
        toast.success("המוצר נוצר בהצלחה");
        navigate(createPageUrl("Search") + `?supplier=${user.id}&new=true`);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      
      // Log product creation/update failure
      logError(LogModule.PRODUCTS, editMode ? "Product update failed" : "Product creation failed", {
        userId: user.id,
        title: productData.title,
        error: error.message || "Unknown error"
      });
      
      toast.error("אירעה שגיאה בשמירת המוצר: " + (error.message || ""));
    } finally {
      setSaving(false);
    }
  };
  
  const categoryOptions = [
    { value: "electronics", label: "אלקטרוניקה" },
    { value: "clothing", label: "ביגוד" },
    { value: "home_goods", label: "מוצרי בית" },
    { value: "food_beverage", label: "מזון ומשקאות" },
    { value: "health_beauty", label: "בריאות ויופי" },
    { value: "industrial", label: "ציוד תעשייתי" },
    { value: "automotive", label: "רכב" },
    { value: "sports", label: "ספורט" },
    { value: "toys", label: "צעצועים" },
  ];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(createPageUrl("AdminDashboard"))}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          חזרה ללוח הבקרה
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {editMode ? "עריכת מוצר" : "הוספת מוצר חדש"}
        </h1>
        <p className="text-gray-500">
          {editMode ? "ערוך את פרטי המוצר" : "הזן את פרטי המוצר שברצונך למכור"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className={`text-base flex items-center gap-1 ${errors.title ? 'text-red-500' : ''}`}>
                    שם המוצר
                    {errors.title && (
                      <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full border border-red-200 font-medium">
                        שדה חובה
                      </span>
                    )}
                  </Label>
                  <Input
                    id="title"
                    value={productData.title}
                    onChange={(e) => {
                      handleInputChange("title", e.target.value);
                      setErrors({ ...errors, title: false });
                    }}
                    placeholder="שם מלא של המוצר"
                    className={errors.title ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {errors.title && (
                    <div className="flex items-center gap-1 mt-1.5 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <p>נא למלא את שם המוצר</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-base">תיאור המוצר</Label>
                  <Textarea
                    id="description"
                    value={productData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="תאר את המוצר בפירוט כולל מאפיינים, יתרונות ושימושים"
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className={`text-base flex items-center gap-1 ${errors.price ? 'text-red-500' : ''}`}>
                      מחיר ליחידה (₪)
                      {errors.price && !productData.contact_for_price && (
                        <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full border border-red-200 font-medium">
                          שדה חובה
                        </span>
                      )}
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productData.price}
                          onChange={(e) => {
                            handleInputChange("price", e.target.value);
                            setErrors({ ...errors, price: false });
                          }}
                          placeholder="0.00"
                          className={errors.price && !productData.contact_for_price ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}
                          required={!productData.contact_for_price}
                          disabled={productData.contact_for_price}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="contact_for_price"
                          checked={productData.contact_for_price}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setProductData({
                              ...productData,
                              contact_for_price: isChecked,
                              price: isChecked ? null : productData.price
                            });
                            if (isChecked) {
                              setErrors({ ...errors, price: false });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <Label htmlFor="contact_for_price" className="text-sm font-medium text-gray-700">
                          פנה לקבלת הצעת מחיר
                        </Label>
                      </div>
                    </div>
                    {errors.price && !productData.contact_for_price && (
                      <div className="flex items-center gap-1 mt-1.5 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>נא להזין מחיר למוצר או לסמן "פנה לקבלת הצעת מחיר"</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="minimum_order" className={`text-base flex items-center gap-1 ${errors.minimum_order ? 'text-red-500' : ''}`}>
                      כמות מינימום להזמנה
                      {errors.minimum_order && (
                        <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full border border-red-200 font-medium">
                          שדה חובה
                        </span>
                      )}
                    </Label>
                    <Input
                      id="minimum_order"
                      type="number"
                      min="1"
                      value={productData.minimum_order}
                      onChange={(e) => {
                        handleInputChange("minimum_order", e.target.value);
                        setErrors({ ...errors, minimum_order: false });
                      }}
                      placeholder="1"
                      className={errors.minimum_order ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : '' }
                      required
                    />
                    {errors.minimum_order && (
                      <div className="flex items-center gap-1 mt-1.5 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>נא להזין כמות מינימום להזמנה</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className={`text-base flex items-center gap-1 ${errors.category ? 'text-red-500' : ''}`}>
                      קטגוריה
                      {errors.category && (
                        <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full border border-red-200 font-medium">
                          שדה חובה
                        </span>
                      )}
                    </Label>
                    <Select
                      value={productData.category}
                      onValueChange={(value) => {
                        handleInputChange("category", value);
                        setErrors({ ...errors, category: false });
                      }}
                      required
                    >
                      <SelectTrigger id="category" className={errors.category ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}>
                        <SelectValue placeholder="בחר קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <div className="flex items-center gap-1 mt-1.5 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>נא לבחור קטגוריה למוצר</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="subcategory" className="text-base">תת-קטגוריה (אופציונלי)</Label>
                    <Input
                      id="subcategory"
                      value={productData.subcategory}
                      onChange={(e) => handleInputChange("subcategory", e.target.value)}
                      placeholder="תת-קטגוריה"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock" className={`text-base flex items-center gap-1 ${errors.stock ? 'text-red-500' : ''}`}>
                      כמות במלאי
                      {errors.stock && (
                        <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full border border-red-200 font-medium">
                          שדה חובה
                        </span>
                      )}
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={productData.stock}
                      onChange={(e) => {
                        handleInputChange("stock", e.target.value);
                        setErrors({ ...errors, stock: false });
                      }}
                      placeholder="0"
                      className={errors.stock ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}
                      required
                    />
                    {errors.stock && (
                      <div className="flex items-center gap-1 mt-1.5 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>נא להזין כמות במלאי</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lead_time" className="text-base">זמן אספקה</Label>
                    <Input
                      id="lead_time"
                      value={productData.lead_time}
                      onChange={(e) => handleInputChange("lead_time", e.target.value)}
                      placeholder="לדוגמה: 3-5 ימי עסקים"
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">מפרט טכני</h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(productData.specifications || {}).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="flex items-center bg-gray-100 rounded-lg px-3 py-1"
                    >
                      <span className="font-medium">{key}:</span>
                      <span className="mr-1">{value}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="mr-2 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="spec_key">מאפיין</Label>
                    <Input
                      id="spec_key"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="לדוגמה: משקל, צבע, מידות"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="spec_value">ערך</Label>
                    <Input
                      id="spec_value"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="לדוגמה: 2 ק״ג, כחול, 10x15 ס״מ"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSpecification}
                      disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">תמונות המוצר</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {productData.images?.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={image} 
                        alt={`תמונת מוצר ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 left-1 bg-black bg-opacity-60 rounded-full p-1 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {(productData.images?.length || 0) < 6 && (
                    <div>
                      <Label htmlFor="image_upload" className="block w-full h-full cursor-pointer">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md aspect-square text-gray-400 hover:text-gray-500 hover:border-gray-400">
                          {uploadingImage ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : (
                            <>
                              <ImagePlus className="h-8 w-8 mb-2" />
                              <span className="text-sm">העלה תמונה</span>
                            </>
                          )}
                        </div>
                        <input
                          id="image_upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="sr-only"
                        />
                      </Label>
                    </div>
                  )}
                </div>
                
                {imageError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{imageError}</AlertDescription>
                  </Alert>
                )}
                
                <p className="text-sm text-gray-500">
                  העלה עד 6 תמונות. תמונה ראשונה תוצג כתמונה הראשית.
                </p>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">סטטוס המוצר</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status" className="text-base">סטטוס פרסום</Label>
                  <Select
                    value={productData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="בחר סטטוס" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">פעיל (מוצג לקונים)</SelectItem>
                      <SelectItem value="inactive">לא פעיל (מוסתר מקונים)</SelectItem>
                      <SelectItem value="out_of_stock">אזל מהמלאי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {productData.status === "active" 
                      ? "המוצר יהיה זמין לקונים מיד לאחר השמירה"
                      : "המוצר לא יוצג לקונים עד שתשנה את הסטטוס ל'פעיל'"
                    }
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(createPageUrl("AdminDashboard"))}
              >
                ביטול
              </Button>

              {editMode && (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={async (e) => {
                    e.preventDefault();
                    
                    // Reset errors
                    const newErrors = {
                      title: !productData.title,
                      price: !productData.price && !productData.contact_for_price,
                      category: !productData.category,
                      minimum_order: !productData.minimum_order,
                      stock: productData.stock === undefined || productData.stock === null
                    };
                    
                    setErrors(newErrors);
                    
                    // Check if there are any errors
                    if (Object.values(newErrors).some(error => error)) {
                      toast.error("נא למלא את כל שדות החובה המסומנים");
                      return;
                    }
                    
                    // Format numeric fields
                    const formattedData = {
                      ...productData,
                      price: productData.contact_for_price ? null : Number(productData.price),
                      minimum_order: Number(productData.minimum_order),
                      stock: Number(productData.stock),
                      supplier_id: user.id,
                      updated_at: new Date(),
                      images: Array.isArray(productData.images) ? productData.images : [],
                      specifications: productData.specifications || {}
                    };
                    
                    setSaving(true);
                    
                    try {
                      // שמור את המוצר אבל הישאר בדף
                      await Product.update(productData.id, formattedData);
                      toast.success("השינויים נשמרו בהצלחה");
                    } catch (error) {
                      console.error("Error saving product:", error);
                      toast.error("אירעה שגיאה בשמירת המוצר: " + (error.message || ""));
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-4 w-4 ml-2"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      שמור והמשך עריכה
                    </>
                  )}
                </Button>
              )}

              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    שומר...
                  </>
                ) : (
                  <>
                    {editMode ? (
                      <>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="h-4 w-4 ml-2"
                        >
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                        </svg>
                        שמור וחזור
                      </>
                    ) : (
                      <>
                        פרסם מוצר
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}