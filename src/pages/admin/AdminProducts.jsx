import React, { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Trash2, CircleCheck, CircleX, Pencil, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, users(full_name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("שגיאה בטעינת המוצרים");
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error("Exception while fetching products:", err);
      toast.error("שגיאה בטעינת המוצרים");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם למחוק מוצר זה?")) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.error("Error deleting product:", error);
        toast.error("שגיאה במחיקת המוצר");
      } else {
        toast.success("המוצר נמחק בהצלחה");
        fetchProducts();
      }
    } catch (err) {
      console.error("Exception while deleting product:", err);
      toast.error("שגיאה במחיקת המוצר");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (productId) => {
    if (!productId) {
      toast.error("מזהה מוצר חסר");
      return;
    }

    setActionLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      
      if (error || !data) {
        console.error("Error fetching product details:", error);
        toast.error("שגיאה בטעינת פרטי המוצר");
        setActionLoading(false);
        return;
      }
      
      sessionStorage.setItem('editProductData', JSON.stringify(data));
      navigate(`/admin/products/edit/${productId}`);
      
    } catch (err) {
      console.error("Error in admin product edit process:", err);
      toast.error("שגיאה בתהליך עריכת המוצר");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'out_of_stock': return 'warning';
      default: return 'default';
    }
  };
  
  const getStatusText = (status) => {
     switch (status?.toLowerCase()) {
      case 'active': return 'פעיל';
      case 'inactive': return 'לא פעיל';
      case 'out_of_stock': return 'אזל מהמלאי';
      default: return status || 'לא ידוע';
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">ניהול מוצרים</h2>
        <Button 
          className="flex items-center gap-2" 
          onClick={() => navigate('/UploadProduct')}
        >
          <Plus size={16} />
          הוסף מוצר חדש (דף ספק)
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-gray-800/50">
                <TableRow>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">שם מוצר</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">מחיר</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">קטגוריה</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">סטטוס</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">ספק</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400">פעולות</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
                      לא נמצאו מוצרים
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-right font-medium text-gray-800 text-sm dark:text-white/90">
                        {p.title}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-gray-500 text-sm dark:text-gray-400">
                        {p.contact_for_price ? 'צור קשר למחיר' : p.price ? `${p.price.toFixed(2)} ₪` : 'לא הוגדר'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-gray-500 text-sm dark:text-gray-400">
                        {p.category || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-sm">
                        <Badge variant={getStatusBadgeVariant(p.status)} size="sm">
                           {p.status === 'active' && <CircleCheck size={14} className="ml-1"/>}
                           {p.status !== 'active' && <CircleX size={14} className="ml-1"/>}
                           {getStatusText(p.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-gray-500 text-sm dark:text-gray-400">
                        {p.users?.full_name || "—"} 
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                         <div className="flex justify-center gap-1">
                           <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(p.id)}
                            disabled={actionLoading}
                            title="ערוך מוצר"
                            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(p.id)}
                            disabled={actionLoading}
                            title="מחק מוצר"
                            className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
