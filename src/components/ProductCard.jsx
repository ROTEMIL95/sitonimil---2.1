import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, MessageSquare, Heart, Send, Phone, Mail, ArrowRight, Package } from "lucide-react";
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
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>יצירת קשר עם הספק</DialogTitle>
          <DialogDescription>
            בחר את אופן יצירת הקשר המועדף עליך
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={(e) => {
            e.preventDefault();
            const phoneNumber = product.supplier_phone || "972500000000"; 
            window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`, '_blank');
          }} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>וואטסאפ</span>
          </Button>
          <Button onClick={(e) => {
            e.preventDefault();
            window.location.href = createPageUrl("Messages") + `?product_id=${product.id}&supplier_id=${product.supplier_id || ""}`;
          }} variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>הודעה באתר</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductCard({ product, variant = "default", className = "" }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  if (!product) {
    return <div>מוצר חסר</div>;
  }

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    
    toast({
      title: isLiked ? "הוסר מהמועדפים" : "נוסף למועדפים",
      description: isLiked 
        ? `${product.title} הוסר מהמועדפים שלך.` 
        : `${product.title} נוסף למועדפים שלך.`,
      duration: 3000,
    });
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      window.location.href = createPageUrl("Auth") + "?tab=login&redirect=" + createPageUrl("Product") + `?id=${product.id}`;
      return;
    }
    
    setShowContactPopup(true);
  };

  const handleContactWhatsapp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsContactDialogOpen(false);
    
    const phoneNumber = product.supplier_phone || "972500000000"; 
    const message = `שלום, אני מעוניין במוצר ${product.title} (מק״ט: ${product.id})`;
    
    window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    
    toast({
      title: "פתיחת וואטסאפ",
      description: "פותח וואטסאפ ליצירת קשר עם הספק",
      duration: 3000,
    });
  };

  const handleContactMessages = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsContactDialogOpen(false);
    
    const messagesUrl = createPageUrl("Messages") + `?product_id=${product.id}&supplier_id=${product.supplier_id || ""}`;
    
    window.location.href = messagesUrl;
    
    toast({
      title: "הודעה לספק",
      description: "מעבר למסך הודעות",
      duration: 3000,
    });
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

  const handleProductClick = () => {
    navigate(createPageUrl("Product") + `?id=${product.id}${product.supplier_id ? `&supplier_id=${product.supplier_id}` : ''}`);
  };

  if (variant === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex">
          <div className="w-1/4">
            <div className="h-full">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onClick={handleProductClick}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center"
                  onClick={handleProductClick}>
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <div className="w-3/4 p-4">
            <div className="flex justify-between">
              <h3 className="font-medium mb-1 text-lg cursor-pointer hover:text-blue-600"
                onClick={handleProductClick}>
                {product.title}
              </h3>
              {product.customActions}
            </div>
            <div className="flex items-center text-sm mb-2">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="font-medium mr-1">{product.rating?.toFixed(1) || "0.0"}</span>
            </div>
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-600">₪{product.price?.toFixed(2) || "0.00"}+</span>
              <span className="text-xs text-gray-500">MOQ: {product.minimum_order || 1}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("group overflow-hidden transition-all hover:shadow-md h-full", className)}>
        <Link 
          to={createPageUrl("Product") + `?id=${product.id}${product.supplier_id ? `&supplier_id=${product.supplier_id}` : ''}`} 
          className="block h-full flex flex-col"
        >
          <div className="relative aspect-video md:aspect-[4/3]">
            <ProductImage 
              src={product.images?.[0] || DEFAULT_PRODUCT_IMAGE} 
              alt={product.title} 
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            {product.category && (
              <Badge className="absolute top-2 right-2 bg-blue-600">{getCategoryLabel(product.category)}</Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "absolute top-2 left-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white",
                isLiked ? "text-red-500" : "text-gray-500"
              )}
              onClick={handleLike}
            >
              <Heart className={cn("h-4 w-4", isLiked ? "fill-current" : "")} />
            </Button>
            {product.discount_percent > 0 && (
              <Badge className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white">
                {product.discount_percent}% הנחה
              </Badge>
            )}
            {product.minimum_order > 1 && (
              <Badge className="absolute bottom-2 left-2 bg-blue-600/85 hover:bg-blue-700 text-white text-xs rounded-full">
                מינימום: {product.minimum_order} יח׳
              </Badge>
            )}
          </div>
          
          <CardContent className="p-4 flex flex-col flex-grow">
            {product.supplier_name && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={product.supplier_logo} alt={product.supplier_name} />
                  <AvatarFallback>{product.supplier_name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">{product.supplier_name}</span>
              </div>
            )}
            
            <h3 className="font-medium line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors text-right">
              {product.title}
            </h3>
            
            {product.description && (
              <p className="text-sm line-clamp-2 text-gray-500 mb-3 text-right">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-amber-500">
                        <Star className="fill-current h-4 w-4" />
                        <span className="text-xs mr-1">
                          {product.rating?.toFixed(1) || "N/A"}{" "}
                          {product.review_count ? `(${product.review_count})` : ""}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{product.review_count || 0} ביקורות</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs rounded-full px-3 py-1.5 ml-2 hover:bg-blue-50 hover:text-blue-600 transition-colors border-blue-200 hover:border-blue-400 shadow-sm"
                  onClick={handleContactClick}
                >
                  <MessageSquare className="h-3.5 w-3.5 ml-1.5" />
                  <span className="mx-0.5">יצירת קשר</span>
                </Button>
              </div>
              
              <div>
                <p className="font-semibold text-right">{formatPrice(product.price)}</p>
                <p className="text-xs text-gray-500 text-right">
                  הזמנה מינימלית: {product.minimum_order || 1} יחידות
                </p>
              </div>
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
