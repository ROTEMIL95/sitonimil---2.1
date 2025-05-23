import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl, redirectToLogin } from "@/utils";
import { Product, Review } from "@/api/entities";
import { useProduct, useProducts, useSuppliers, useCurrentUser } from "@/api/hooks";
import { User } from "@/api/entities";
import { Message } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MessageSquare,
  ShoppingCart,
  Star,
  Truck,
  Package,
  Calendar,
  Building,
  FileBadge,
  ThumbsUp,
  Send,
  LogIn,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { format } from "date-fns";

function ProductImage({ src, alt, className }) {
  const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300";
  const [imageSrc, setImageSrc] = useState(src || DEFAULT_PRODUCT_IMAGE);

  useEffect(() => {
    setImageSrc(src || DEFAULT_PRODUCT_IMAGE);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setImageSrc(DEFAULT_PRODUCT_IMAGE)}
    />
  );
}

export default function ProductPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // קבלת המזהה של המוצר מה-URL
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const productId = useMemo(() => urlParams.get("id"), [urlParams]);
  
  // שימוש ב-React Query לטעינת נתוני המוצר
  const { 
    data: allProducts, 
    isLoading: productsLoading,
    error: productsError
  } = useProducts();
  
  // מציאת המוצר הנוכחי מתוך כל המוצרים
  const currentProduct = useMemo(() => {
    if (allProducts && productId) {
      return allProducts.find(p => p.id === productId);
    }
    return null;
  }, [allProducts, productId]);
  
  // שימוש ב-React Query לטעינת נתוני המשתמשים והספקים
  const { 
    data: suppliers,
    isLoading: suppliersLoading 
  } = useSuppliers();
  
  // מציאת הספק של המוצר
  const supplier = useMemo(() => {
    if (suppliers && currentProduct?.supplier_id) {
      return suppliers.find(s => s.id === currentProduct.supplier_id);
    }
    return null;
  }, [suppliers, currentProduct]);
  
  // שימוש ב-React Query לטעינת נתוני המשתמש המחובר
  const { 
    data: user,
    isLoading: userLoading 
  } = useCurrentUser();
  
  // מצב הטעינה המשולב
  const isLoading = productsLoading || suppliersLoading || userLoading;
  
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    // טעינת ביקורות
    const loadReviews = async () => {
      if (productId) {
        try {
          const reviewsData = await Review.list();
          const productReviews = reviewsData.filter(r => r.product_id === productId);
          setReviews(productReviews);
        } catch (error) {
          console.error("Error loading reviews:", error);
        }
      }
    };
    
    loadReviews();
  }, [productId]);
  
  // עדכון מוצרים דומים כאשר המוצר הנוכחי או כל המוצרים משתנים
  useEffect(() => {
    if (currentProduct && Array.isArray(allProducts)) {
      // מוצרים מאותה קטגוריה
      const similar = allProducts.filter(p => 
        p.category === currentProduct.category && 
        p.id !== currentProduct.id
      ).slice(0, 4);
      
      setRelatedProducts(similar);
      
      // טעינה מוקדמת של תמונות המוצרים הדומים
      similar.forEach(product => {
        if (product.images?.[0]) {
          const img = new Image();
          img.src = product.images[0];
        }
      });
    }
  }, [currentProduct, allProducts]);
  
  // ניווט חזרה לדף החיפוש אם אין מוצר או אם יש שגיאה
  useEffect(() => {
    if ((!productId || productsError) && !isLoading) {
      navigate(createPageUrl("Search"));
    }
  }, [productId, productsError, isLoading, navigate]);
  
  const handleContactWhatsapp = () => {
    const phoneNumber = supplier?.phone || "972500000000";
    
    // Get the full product URL (current domain + product page path)
    const baseUrl = window.location.origin;
    const productPath = createPageUrl("Product");
    const productUrl = `${baseUrl}${productPath}?id=${currentProduct.id}${currentProduct.supplier_id ? `&supplier_id=${currentProduct.supplier_id}` : ''}`;
    
    const message = `שלום,\n` +
    `אני מתעניין במוצר "${currentProduct.title}" שראיתי באתר Sitonim-il\n` +
    `אשמח לקבל פרטים נוספים על המוצר.\n` +
    `קישור למוצר: ${productUrl}`;
    
    // וידוא שמספר הטלפון מתחיל ב-972 ואין בו תווים מיוחדים
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // אם המספר לא מתחיל ב-972, נוסיף אותו (אם מתחיל ב-0, נחליף את ה-0 ב-972)
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '972' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('972')) {
      formattedPhone = '972' + formattedPhone;
    }
    
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleContactSupplier = async () => {
    if (!user || !message.trim()) return;
    
    try {
      await Message.create({
        sender_id: user.id,
        receiver_id: currentProduct.supplier_id,
        content: message,
        product_id: currentProduct.id
      });
      
      setMessage("");
      alert("ההודעה נשלחה בהצלחה!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("אירעה שגיאה בשליחת ההודעה");
    }
  };

  const relatedProductsToDisplay = useMemo(() => {
    return relatedProducts.length > 0 ? relatedProducts : [];
  }, [relatedProducts]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-lg h-96" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return <div className="text-red-500">שגיאה: {productsError.message}</div>;
  }

  if (!currentProduct) return null;
  
  // משתנה עזר שמקל על העדכון - במקום product השתמשנו ב-currentProduct
  const product = currentProduct;

  const getCategoryLabel = (categoryValue) => {
    if (!categoryValue) return "כללי";
    
    const categories = {
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
    
    return categories[categoryValue] || categoryValue;
  };

  const renderProductImages = () => {
    if (productsLoading) {
      return (
        <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
      );
    }

    if (!product.images || product.images.length === 0) {
      return (
        <ProductImage
          src={null}
          alt={product.title || "Product Image"}
          className="w-full h-auto object-cover rounded-lg"
        />
      );
    }

    return (
      <img
        src={product.images[selectedImage] || "https://via.placeholder.com/600"}
        alt={product.title}
        className="max-h-full max-w-full object-contain"
      />
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          חזרה
        </Button>
        <span className="text-gray-400 mx-1">/</span>
        <Link to={createPageUrl("Search")} className="text-gray-500 hover:text-gray-900">
          מוצרים
        </Link>
        <span className="text-gray-400 mx-1">/</span>
        <Link to={createPageUrl("Search") + `?category=${product.category}`} className="text-gray-500 hover:text-gray-900">
          {getCategoryLabel(product.category)}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="bg-white p-4 rounded-lg mb-4 h-96 flex items-center justify-center">
            {renderProductImages()}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${selectedImage === index ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-medium mr-1">{product.rating?.toFixed(1) || "N/A"}</span>
              </div>
              <Badge>{getCategoryLabel(product.category)}</Badge>
              {product.status === "out_of_stock" && (
                <Badge variant="destructive">אזל מהמלאי</Badge>
              )}
            </div>
            
            <div className="flex items-baseline mb-6">
              <div className="text-3xl font-bold text-blue-600">₪{product.price.toFixed(2)}</div>
              <span className="text-gray-500 mr-2">ליחידה</span>
            </div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Package className="h-4 w-4 ml-1" />
                  <span className="text-sm">כמות מינימלית</span>
                </div>
                <div className="font-semibold">{product.minimum_order} יחידות</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 ml-1" />
                  <span className="text-sm">זמן אספקה</span>
                </div>
                <div className="font-semibold">{product.lead_time || "לא צוין"}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Truck className="h-4 w-4 ml-1" />
                  <span className="text-sm">מלאי</span>
                </div>
                <div className="font-semibold">{product.stock || "0"} יחידות</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Building className="h-4 w-4 ml-1" />
                  <span className="text-sm">ספק</span>
                </div>
                <div className="font-semibold truncate">
                  {supplier?.company_name || "ספק לא ידוע"}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    צור קשר עם הספק
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-right">יצירת קשר עם הספק</DialogTitle>
                    <DialogDescription className="text-right">
                      בחר את אופן יצירת הקשר המועדף עליך
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <Button 
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleContactWhatsapp}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      וואטסאפ
                    </Button>
                    
                    {user ? (
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button className="flex items-center justify-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            הודעה באתר
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="max-h-96">
                          <SheetHeader>
                            <SheetTitle>שלח הודעה לספק</SheetTitle>
                            <SheetDescription>
                              ציין את הכמות, דרישות המשלוח ופרטים נוספים על הזמנתך
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-4">
                            <Textarea
                              placeholder="כתוב את הודעתך כאן..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="min-h-32"
                            />
                          </div>
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">ביטול</Button>
                            </SheetClose>
                            <Button
                              onClick={handleContactSupplier}
                              disabled={!message.trim()}
                            >
                              <Send className="h-4 w-4 ml-2" />
                              שלח
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    ) : (
                      <Button 
                        onClick={() => navigate(redirectToLogin(`Product?id=${product.id}`))}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <LogIn className="h-4 w-4 ml-2" />
                        התחברות ליצירת קשר דרך האתר
                      </Button>
                    )}
                  </div>
                  
                  <DialogClose asChild>
                    <Button variant="outline" className="mt-2">ביטול</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="specs" className="mb-10" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger 
            value="specs" 
            className="rounded-lg font-medium transition-all py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-[rgb(2,132,199)] data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[rgb(2,132,199)]"
          >
            מפרט
          </TabsTrigger>
          <TabsTrigger 
            value="supplier" 
            className="rounded-lg font-medium transition-all py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-[rgb(2,132,199)] data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[rgb(2,132,199)]"
          >
            פרטי ספק
          </TabsTrigger>
          <TabsTrigger 
            value="reviews" 
            className="rounded-lg font-medium transition-all py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-[rgb(2,132,199)] data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[rgb(2,132,199)]"
          >
            דירוגים וביקורות
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="specs" className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">מפרט מוצר</h3>
          
          {product.specifications && Object.keys(product.specifications).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b">
                  <span className="font-medium">{key.replace(/_/g, ' ')}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">אין מפרט טכני זמין למוצר זה</p>
          )}
        </TabsContent>
        
        <TabsContent value="supplier" className="bg-white p-6 rounded-lg shadow-sm">
          {supplier ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {supplier.logo_url ? (
                    <img 
                      src={supplier.logo_url} 
                      alt={supplier.company_name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Building className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {supplier.company_name || supplier.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileBadge className="h-4 w-4" />
                    <span>{supplier.verified ? "ספק מאומת" : "ספק"}</span>
                    {supplier.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        מאומת
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">תיאור</h4>
                <p className="text-gray-600">
                  {supplier.description || "אין תיאור זמין"}
                </p>
              </div>
              
              {supplier.address && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">כתובת</h4>
                  <p className="text-gray-600">{supplier.address}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button asChild variant="outline">
                  <Link to={createPageUrl("Supplier") + `?id=${supplier.id}`}>
                    צפה בכל המוצרים של הספק
                  </Link>
                </Button>
                {user && (
                  <Button>
                    <MessageSquare className="h-4 w-4 ml-2" />
                    יצירת קשר
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">פרטי הספק אינם זמינים</p>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">דירוגים וביקורות</h3>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (product.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium mr-2">
                {product.rating?.toFixed(1) || "N/A"}
              </span>
            </div>
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium mr-2 text-sm">
                          {review.reviewer_id}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(review.created_date), "dd/MM/yyyy")}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">אין ביקורות עדיין למוצר זה</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
