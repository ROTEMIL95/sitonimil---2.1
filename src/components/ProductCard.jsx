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

export default function ProductCard({ product, variant = "default" }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
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

  const handleProductClick = () => {
    navigate(createPageUrl("Product") + `?id=${product.id}`);
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="h-40 overflow-hidden relative cursor-pointer"
        onClick={handleProductClick}
      >
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between">
          <h3 className="font-medium mb-1 truncate cursor-pointer hover:text-blue-600"
            onClick={handleProductClick}>
            {product.title}
          </h3>
          {product.customActions}
        </div>
        <div className="flex items-center text-sm">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="font-medium mr-1">{product.rating?.toFixed(1) || "0.0"}</span>
        </div>
        <p className="text-gray-500 text-sm mt-2 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-blue-600">₪{product.price?.toFixed(2) || "0.00"}+</span>
          <span className="text-xs text-gray-500">MOQ: {product.minimum_order || 1}</span>
        </div>
      </div>
    </Card>
  );
}
