import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductGrid from "@/components/ProductGrid";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, Plus, Loader2, 
  ListFilter, Grid3X3,
  FileEdit, Trash2, Eye 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function MyProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load user data and verify they are a supplier
        const userData = await User.me();
        
        // Check if user is a supplier
        const isSupplier = 
          (userData?.user_metadata?.business_type === "supplier") || 
          (userData?.business_type === "supplier");
        
        if (!isSupplier) {
          console.log("User is not a supplier:", userData);
          toast.error("רק ספקים יכולים לצפות במוצרים שלהם");
          navigate(createPageUrl("Home"));
          return;
        }
        
        setUser(userData);
        
        // Load supplier's products
        const allProducts = await Product.getBySupplier(userData.id);
        console.log(`Loaded ${allProducts.length} products for supplier ${userData.id}`);
        setProducts(allProducts);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("אירעה שגיאה בטעינת המוצרים");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  const handleDeleteProduct = async (productId) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מוצר זה?")) return;
    
    try {
      await Product.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success("המוצר נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("אירעה שגיאה במחיקת המוצר");
    }
  };

  const ProductActions = ({ product }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <ListFilter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => navigate(createPageUrl("Product") + `?id=${product.id}`)}>
          <Eye className="h-4 w-4 ml-2" />
          צפייה
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(createPageUrl("UploadProduct") + `/${product.id}`)}>
          <FileEdit className="h-4 w-4 ml-2" />
          עריכה
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-600">
          <Trash2 className="h-4 w-4 ml-2" />
          מחיקה
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Customize product display to include action buttons
  const enhancedProducts = products.map(product => ({
    ...product,
    customActions: <ProductActions product={product} />
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה
          </Button>
          
          <h1 className="text-2xl font-bold">המוצרים שלי</h1>
          
          <Button 
            onClick={() => navigate(createPageUrl("UploadProduct"))}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            הוספת מוצר
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <p className="text-gray-500">
              {products.length > 0 
                ? `מציג ${products.length} מוצרים שפרסמת`
                : "לא נמצאו מוצרים. התחל להוסיף מוצרים חדשים!"
              }
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {products.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-blue-100 rounded-full p-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium">אין לך מוצרים עדיין</h3>
              <p className="text-gray-500 max-w-md">
                כדי להתחיל למכור, הוסף את המוצר הראשון שלך! מלא את פרטי המוצר ותמונות והתחל למכור.
              </p>
              <Button 
                onClick={() => navigate(createPageUrl("UploadProduct"))}
                className="mt-2"
              >
                הוספת מוצר ראשון
              </Button>
            </div>
          </Card>
        ) : (
          <ProductGrid products={enhancedProducts} loading={false} viewMode={viewMode} />
        )}
      </div>
    </div>
  );
} 