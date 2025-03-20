import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, MapPin, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";

export default function SupplierCard({ supplier, className = "" }) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${className}`}>
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {supplier.verified && (
          <Badge className="absolute top-2 left-2 bg-white text-blue-600 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span>מאומת</span>
          </Badge>
        )}
        <div className="absolute bottom-0 right-0 w-full p-4 text-white">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{supplier.address || "ישראל"}</span>
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
                asChild
              >
                <Link to={createPageUrl("Messages") + `?supplier=${supplier.id}`}>
                  <MessageSquare className="h-3 w-3 ml-1" />
                  יצירת קשר
                </Link>
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
            
            <div className="text-sm text-right">
              <span className="text-gray-500">משנת </span>
              <span className="font-medium">{supplier.established || new Date().getFullYear() - 3}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}