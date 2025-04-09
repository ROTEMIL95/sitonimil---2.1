import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, MessageSquare, Heart, Send, Phone, Mail, ArrowRight, Package, Eye, ShoppingCart, CircleCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
 
} from "@/components/ui/dialog";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { fetchSupplierById } from "@/api/suppliers";
import { cn } from "@/lib/utils";

// תמונת ברירת מחדל קבועה למוצרים
const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300";

// הוספת קומפוננטת תמונה עם טעינה מושהית וטיפול בשגיאות
function ProductImage({ src, alt, className }) {
  const [imageSrc, setImageSrc] = useState(src || DEFAULT_PRODUCT_IMAGE);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src || DEFAULT_PRODUCT_IMAGE);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setImageSrc(DEFAULT_PRODUCT_IMAGE);
      setHasError(true);
    }
  };

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}

// Contact popup component
function ContactPopup({ isOpen, onClose, product }) {
  if (!isOpen) return null;
  
  // Get supplier details from product
  const supplierName = product?.supplier_name || (product?.supplier?.name) || "";
  const companyName = product?.company_name || (product?.supplier?.company_name) || supplierName || "הספק";
  
  const formatPhoneForWhatsApp = (phone) => {
    // Remove any non-digit characters
    let cleaned = (phone || "").replace(/\D/g, "");
    
    // If empty or invalid, use a default
    if (!cleaned || cleaned.length < 9) {
      return "972500000000"; // Default fallback number
    }
    
    // If number starts with 0, replace it with 972
    if (cleaned.startsWith("0")) {
      cleaned = "972" + cleaned.substring(1);
    }
    
    // If number doesn't have country code and doesn't start with 0
    if (!cleaned.startsWith("972") && !cleaned.startsWith("0")) {
      // If it's likely an Israeli number (9-10 digits)
      if (cleaned.length >= 9 && cleaned.length <= 10) {
        cleaned = "972" + cleaned;
      }
    }
    
    console.log("Formatted WhatsApp number:", cleaned);
    return cleaned;
  };
  
  // Get the supplier phone from all possible sources
  const getSupplierPhone = () => {
    // Check all possible locations for the phone number
    const phone = 
      product.supplier_phone || 
      product.supplier?.phone || 
      product.phone ||
      (product.supplier_data && product.supplier_data.phone) ||
      (window.supplierData && window.supplierData[product.supplier_id] && window.supplierData[product.supplier_id].phone) ||
      "0500000000"; // Default fallback
      
    console.log("Found supplier phone:", phone);
    return phone;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader >
          <DialogTitle className="text-right text-lg">יצירת קשר עם הספק</DialogTitle>
          <DialogDescription className="text-right">
            בחר את אופן יצירת הקשר המועדף עליך
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={(e) => {
            e.preventDefault();
            const supplierPhone = getSupplierPhone();
            const phoneNumber = formatPhoneForWhatsApp(supplierPhone);
            
            // Get the full product URL (current domain + product page path)
            const baseUrl = window.location.origin;
            const productPath = createPageUrl("Product");
            const productUrl = `${baseUrl}${productPath}?id=${product.id}${product.supplier_id ? `&supplier_id=${product.supplier_id}` : ''}`;
            
            const message = `שלום,\n` +
            `אני מתעניין במוצר "${product.title}" שראיתי באתר Sitonim-il \n` +
            `אשמח לקבל פרטים נוספים על המוצר.\n` +
            `קישור למוצר: ${productUrl}`;

            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
          }} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>וואטסאפ</span>
          </Button>
          <Button onClick={(e) => {
            e.preventDefault();
            window.location.href = createPageUrl("Messages") + `?product_id=${product.id}&supplier_id=${product.supplier_id || ""}&guest=true`;
          }} variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>הודעה באתר</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductCard({ 
  product, 
  variant = "default", 
  className = "", 
  hideIfNoSupplier = true,
  onAddToCart,
  onViewDetails,
  onFavorite,
  onMoreOptions
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // טעינת פרטי הספק לפי ID
  useEffect(() => {
    const getSupplierData = async () => {
      // בודק אם יש ID של ספק אבל אין שם ספק כבר
      if (product?.supplier_id && !product.supplier_name) {
        try {
          // Use the imported fetchSupplierById function directly
          const supplier = await fetchSupplierById(product.supplier_id);
          if (supplier) {
            console.log("Loaded supplier:", supplier);
            setSupplierData(supplier);
            
            // Store supplier data globally for access in dialog
            if (!window.supplierData) window.supplierData = {};
            window.supplierData[product.supplier_id] = supplier;
          }
        } catch (error) {
          console.error("Failed to load supplier data:", error);
        }
      }
    };
    
    getSupplierData();
  }, [product]);
  
  // Check if product is in favorites
  useEffect(() => {
    if (product?.id) {
      try {
        const savedFavorites = localStorage.getItem('favoriteProducts');
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          setIsLiked(favorites.includes(product.id));
        }
      } catch (error) {
        console.error("Error checking favorites status:", error);
      }
    }
  }, [product]);
  
  // טעינת משתמש נוכחי
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        console.log("User not logged in");
      }
    };
    
    loadUser();
  }, []);

  // מידע של הספק - כולל בדיקה גם מה-supplier שהוטען מה-API
  const supplierName = product?.supplier_name || (product?.supplier?.name) || supplierData?.name || "";
  const companyName = product?.company_name || (product?.supplier?.company_name) || supplierData?.company_name || supplierName || "הספק";
  const supplierLogo = product?.supplier_logo || (product?.supplier?.logo) || supplierData?.logo || null;
  
  // בדיקות עבור חזרה מוקדמת
  if (!product) {
    return <div>מוצר חסר</div>;
  }
  
  // אם אין שם ספק, לא מציגים את הכרטיס
  if (hideIfNoSupplier && !supplierName) {
    return null;
  }

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // Dispatch custom event for Layout component
    window.dispatchEvent(new CustomEvent('favoriteUpdate', {
      detail: {
        productId: product.id,
        isLiked: newLikedState
      }
    }));
    
    if (onFavorite) {
      onFavorite(product.id);
    }
    
    toast({
      title: isLiked ? "הוסר מהמועדפים" : "נוסף למועדפים",
      description: isLiked 
        ? `${product.title} הוסר מהמועדפים שלך.` 
        : `${product.title} נוסף למועדפים שלך.`,
      duration: 3000,
    });
  };

  const formatPrice = (price) => {
    if (price === 0) return "לקבלת מחיר צור קשר ";
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
  };


  const handleContactClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContactPopup(true);
  };

  const handleProductClick = (e) => {
    if (onViewDetails) {
      e.preventDefault();
      onViewDetails(product.id);
    } else {
      navigate(createPageUrl("Product") + `?id=${product.id}${product.supplier_id ? `&supplier_id=${product.supplier_id}` : ''}`);
    }
  };

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

  if (variant === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow font-['Heebo'] rtl p-1">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-1/4">
            <div className="h-40 sm:h-full p-1 flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="object-contain w-full h-full rounded-lg"
                  loading="lazy"
                  onClick={handleProductClick}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg"
                  onClick={handleProductClick}>
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <div className="w-full sm:w-3/4 p-4 sm:p-5">
            {/* Company Name */}
            <div className="flex items-center justify-end mb-1">
              <span className="text-sm font-medium text-gray-700">{companyName}</span>
            </div>
            
            {/* Rating area - fixed height */}
            <div className="h-6 flex items-center justify-end mb-2.5">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-[500] font-heebo mr-1.5">{product.rating?.toFixed(1) || "0.0"}</span>
              </div>
            </div>
            
            {/* Title area - fixed height */}
            <div className="h-14 mb-1.5">
              <h3 className="font-[700] font-heebo text-base sm:text-xl cursor-pointer hover:text-blue-600 text-right tracking-tight line-clamp-2"
                onClick={handleProductClick}>
                {product.title}
              </h3>
            </div>
            
            <p className="text-sm font-[500] font-heebo text-gray-700 mb-4 line-clamp-2 text-right leading-relaxed h-10">{product.description}</p>
            
            <div className="w-full border-t border-gray-200 mb-4"></div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-[500] font-heebo text-gray-600">מינימום: {product.minimum_order || 1} יח׳</span>
              <span className="font-[900] font-heebo text-gray-900 text-xl sm:text-2xl tracking-tight">{formatPrice(product.price)}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("group overflow-hidden transition-all hover:shadow-lg h-full border border-gray-200 font-['Heebo'] rtl p-1", className)}>
        <Link 
          to={createPageUrl("Product") + `?id=${product.id}${product.supplier_id ? `&supplier_id=${product.supplier_id}` : ''}`} 
          className="h-full flex flex-col"
          onClick={onViewDetails ? (e) => {
            e.preventDefault();
            onViewDetails(product.id);
          } : undefined}
        >
          {/* Card Header with Thumbnail and Brand */}
          <div className="p-5 flex items-center justify-between border-b border-gray-100">
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7 flex-shrink-0 border border-gray-200 rounded-full shadow-sm">
                  <AvatarImage src={supplierLogo} alt={companyName} />
                  <AvatarFallback>{companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-[500] font-heebo text-gray-800">{companyName} </span>
              </div>
              
              {product.category && (
                <span className="text-sm font-[500] font-heebo text-gray-500 mr-9 mt-1">{getCategoryLabel(product.category)}</span>
              )}
            </div>
          </div>
          
          {/* Media - Product Image */}
          <div className="relative px-5 pt-2 pb-1 flex-grow">
            <div className="w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-center">
              <ProductImage 
                src={product.images?.[0] || product.image || DEFAULT_PRODUCT_IMAGE} 
                alt={product.title || product.name || "מוצר"} 
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              
             
            </div>
          </div>
          
          {/* Card Content */}
          <CardContent className="p-5 pb-3 flex flex-col">
            {/* Product Rating - Fixed height area */}
            <div className="h-6 flex items-center justify-start mb-1">
              {product.rating && (
                <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
                  <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                  <span className="text-sm font-[500] font-heebo text-gray-700 mr-1.5">
                    {product.rating?.toFixed(1) || "N/A"}
                  </span>
                </div>
              )}
            </div>
            
            {/* Header - Product Name - Fixed height */}
            <div className="h-16">
              <h3 className="font-[700] font-heebo line-clamp-2 group-hover:text-blue-600 transition-colors text-right text-lg sm:text-xl tracking-tight">
                {product.title || product.name || "מוצר ללא שם"}
              </h3>
            </div>
            
            {/* Supporting Text - Description - Fixed height */}
            <div className="h-10 mb-3">
              {product.description && (
                <p className="text-sm font-[500] font-heebo line-clamp-2 text-gray-600 text-right leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
            
            {/* Divider */}
            <div className="w-full border-t border-gray-200 mb-4"></div>
            
            {/* Price Section */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-end">
                <p className="text-sm font-[500] font-heebo text-gray-600">
                  מינימום הזמנה: {product.minimum_order || 1} יח'
                </p>
              </div>
              <p className={cn(
                "font-heebo text-gray-900 tracking-tight pr-12",
                product.price === 0 
                  ? "text-xs font-[600]" 
                  : "font-[800] text-base sm:text-2xl"
              )}>
                {formatPrice(product.price)}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-auto">
              {/* Primary Action */}
              <Button 
                className="flex-1 text-sm font-[500] font-heebo py-1.5 px-4 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  onViewDetails ? onViewDetails(product.id) : handleProductClick(e);
                }}
              >
                <Eye className="h-4 w-4 ml-1 opacity-90" />
                <span>צפה במוצר</span>
              </Button>
              
              {/* Secondary Actions */}
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 h-10 text-sm font-[500] font-heebo py-1.5 px-4 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-blue-500 rounded-md transition-colors duration-200"
                onClick={handleContactClick}
              >
                <MessageSquare className="h-4 w-4 ml-1 opacity-90" />
                <span>צור קשר</span>
              </Button>
              
              {onAddToCart && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-md border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart(product.id);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                </Button>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
      
      <ContactPopup 
        isOpen={showContactPopup} 
        onClose={() => setShowContactPopup(false)} 
        product={product}
      />
    </>
  );
}