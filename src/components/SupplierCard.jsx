import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, MapPin, ShieldCheck, Send, Building2, Truck, Calendar, BadgeCheck } from "lucide-react";
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
    let cleaned = (phone || "").replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "972" + cleaned.substring(1);
    }
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

  // Don't render if the supplier is an admin
  if (supplier.role === "admin") {
    return null;
  }

  return (
    <>
      <Card className={`w-full max-w-2xl mx-auto bg-white shadow-md border rounded-2xl p-4 text-right flex flex-col h-[400px] ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="w-16 h-16">
              {supplier.logo_url ? (
                <AvatarImage src={supplier.logo_url} alt={supplier.company_name} />
              ) : (
                <AvatarFallback className="bg-blue-50 text-blue-600" >
                  {supplier.company_name?.charAt(0) || "S"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-1 mt-2">
                {supplier.company_name}
                {supplier.verified && <BadgeCheck className="text-blue-600 w-3 h-3" />}
              </h2>
              <p className="text-xs text-blue-600  px-2 py-0.9 rounded-full inline-block">
                {supplier.categories?.[0] || "ספק סיטונאי"}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-6"></div>

        {/* Description */}
        <div className="mt-4">
          <p className="text-sm text-black leading-snug line-clamp-2">
            {supplier.description || "אין תיאור זמין"}
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm text-black mt-10">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            {supplier.address || "תל אביב, ישראל"}
          </div>
          <div className="flex items-center gap-1">
            <Truck className="w-3 h-3 text-gray-400" />
            משלוחים לכל הארץ
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            פעיל מאז {supplier.since || "2010"}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500" />
            <span className="font-bold">4.5</span> (24)
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 text-xs text-black mt-6">
          {supplier.categories?.map((category, index) => (
            <span key={index} className="bg-gray-100 px-2 py-0.5 rounded-full">
              {category}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t mt-auto gap-3">
          <Button 
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white rounded-md px-4 py-2 text-sm font-medium"
            onClick={() => setShowContactPopup(true)}
          >
            <MessageSquare className="h-4 w-4 ml-2" />
            יצירת קשר
          </Button>
          <Button 
            variant="outline"
            className="flex-1 rounded-md px-4 py-2 text-sm font-medium"
            asChild
          >
            <Link to={createPageUrl("Search") + `?supplier=${supplier.id}`}>
              קטלוג מוצרים
            </Link>
          </Button>
        </div>
      </Card>

      <ContactPopup 
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        supplier={supplier}
      />
    </>
  );
}