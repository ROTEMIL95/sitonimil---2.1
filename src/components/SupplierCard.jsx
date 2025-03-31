import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, MapPin, ShieldCheck, Send, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

// Contact popup component
function ContactPopup({ isOpen, onClose, supplier }) {
  if (!isOpen) return null;
  
  const formatPhoneForWhatsApp = (phone) => {
    // Remove any non-digit characters
    let cleaned = (phone || "").replace(/\D/g, "");
    
    // If number starts with 0, replace it with 972
    if (cleaned.startsWith("0")) {
      cleaned = "972" + cleaned.substring(1);
    }
    
    // If number doesn't start with 972, add it
    if (!cleaned.startsWith("972")) {
      cleaned = "972" + cleaned;
    }
    
    return cleaned;
  };

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
            const phoneNumber = formatPhoneForWhatsApp(supplier.phone || "0500000000");
            const message = `שלום, אני מעוניין ליצור קשר בנוגע למוצרים שלך`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
          }} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>וואטסאפ</span>
          </Button>
          <Button onClick={(e) => {
            e.preventDefault();
            window.location.href = createPageUrl("Messages") + `?supplier_id=${supplier.id}&guest=true`;
          }} variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>הודעה באתר</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SupplierCard({ supplier, className = "" }) {
  const [showContactPopup, setShowContactPopup] = useState(false);

  return (
    <>
      <Card className={`overflow-hidden transition-all hover:shadow-md ${className}`}>
        <div className="relative h-48 sm:h-56 md:h-64">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          {supplier.image_url ? (
            <img
              src={supplier.image_url}
              alt={supplier.name}
              className="w-full h-full object-cover aspect-[2/1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Building2 className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {supplier.verified && (
            <Badge className="absolute top-2 left-2 bg-white text-blue-600 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>מאומת</span>
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 w-auto p-4 text-white" >
            <div className="flex items-center gap-2">
              <span className="text-sm" >{supplier.address || "ישראל"}</span>
              <MapPin className="h-4 w-4" />
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 pt-10 relative">
          <Avatar className="absolute -top-8 right-4 border-4 border-white w-16 h-16">
            {supplier.logo_url ? (
              <AvatarImage src={supplier.logo_url} alt={supplier.company_name} />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {supplier.company_name?.charAt(0) || "S"}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center text-amber-500">
                <Star className="fill-current h-4 w-4" />
                <span className="text-sm mr-1">4.5</span>
                <span className="text-xs text-gray-500 mr-1">(24)</span>
              </div>

              <Link to={createPageUrl("Supplier") + `?id=${supplier.id}`}>
                <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors text-right">
                  {supplier.company_name}
                </h3>
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 mb-3 text-right">
              {supplier.description || "אין תיאור זמין"}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4 justify-end">
              {supplier.categories?.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              )) || (
                <Badge variant="outline" className="text-xs">
                  ספק סיטונאי
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs rounded-full bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowContactPopup(true);
                  }}
                >
                  <MessageSquare className="h-3 w-3 ml-1" />
                  יצירת קשר
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs rounded-full"
                  asChild
                >
                  <Link to={createPageUrl("Supplier") + `?id=${supplier.id}`}>הצגת פרופיל</Link>
                </Button>
              </div>
              
           
            </div>
          </div>
        </CardContent>
      </Card>

      <ContactPopup 
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        supplier={supplier}
      />
    </>
  );
}