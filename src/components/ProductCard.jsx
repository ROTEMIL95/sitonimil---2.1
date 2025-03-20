
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, MessageSquare, Heart, Send, Phone, Mail, ArrowRight } from "lucide-react";
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
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";

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

export default function ProductCard({ product, variant = "default", className = "" }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

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
    
    setIsContactDialogOpen(true);
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

  if (variant === "compact") {
    return (
      <Card className={`group overflow-hidden transition-all hover:shadow-md h-full ${className}`}>
        <Link to={createPageUrl("Product") + `?id=${product.id}`} className="block h-full">
          <div className="relative aspect-[4/3]">
            <ProductImage 
              src={product.images?.[0]}
              alt={product.title || "מוצר"} 
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            <Button
              size="icon"
              variant="ghost"
              className={`absolute top-2 left-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${
                isLiked ? "text-red-500" : "text-gray-500"
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm mb-1 line-clamp-1">{product.title}</h3>
            <div className="flex items-center mb-2">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium mr-1">{product.rating?.toFixed(1) || "N/A"}</span>
            </div>
            <p className="text-gray-700 font-bold">{formatPrice(product.price)}+</p>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-md h-full ${className}`}>
      <Link to={createPageUrl("Product") + `?id=${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProductImage 
            src={product.images?.[0]}
            alt={product.title || "מוצר"} 
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          
          <div className="absolute top-0 left-0 p-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${
                isLiked ? "text-red-500" : "text-gray-500"
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <Link to={createPageUrl("Product") + `?id=${product.id}`}>
              <h3 className="font-medium mb-1 line-clamp-1 hover:text-blue-600 transition-colors">
                {product.title}
              </h3>
            </Link>
            
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium mr-1">{product.rating?.toFixed(1) || "N/A"}</span>
              <Badge variant="outline" className="mr-2 text-xs">
                {getCategoryLabel(product.category)}
              </Badge>
            </div>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mb-3 h-10 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="font-semibold text-blue-600">{formatPrice(product.price)}+</div>
          <div className="text-sm text-gray-500">מינימום: {product.minimum_order}</div>
        </div>
        
        <div className="mt-4">
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-sm"
            onClick={handleContactClick}
          >
            <MessageSquare className="h-4 w-4 ml-2" />
            יצירת קשר עם הספק
          </Button>
        </div>
      </CardContent>
      
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="bg-white p-6 rounded-xl max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-2 text-center">יצירת קשר עם הספק</DialogTitle>
            <DialogDescription className="text-center">
              בחר את דרך התקשורת המועדפת עליך
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 my-4">
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white h-12"
              onClick={handleContactWhatsapp}
            >
              <Phone className="ml-2 h-5 w-5" />
              וואטסאפ
            </Button>
            
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white h-12"
              onClick={handleContactMessages}
            >
              <Mail className="ml-2 h-5 w-5" />
              הודעה פנימית
            </Button>
            
            <Link 
              to={createPageUrl("Product") + `?id=${product.id}`}
              className="block text-center text-blue-600 hover:text-blue-700 mt-2"
              onClick={() => setIsContactDialogOpen(false)}
            >
              פרטים נוספים על המוצר
              <ArrowRight className="inline mr-1 h-4 w-4" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
