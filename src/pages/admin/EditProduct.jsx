import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Define category options (reuse or fetch if dynamic)
  const categoryOptions = [
    { value: "electronics", label: "אלקטרוניקה" },
    { value: "clothing", label: "ביגוד" },
    { value: "home_goods", label: "מוצרי בית" },
    { value: "food_beverage", label: "מזון ומשקאות" },
    { value: "health_beauty", label: "בריאות ויופי" },
    { value: "industrial", label: "ציוד תעשייתי" },
    { value: "automotive", label: "רכב" },
    { value: "sports", label: "ספורט" },
    { value: "toys", label: "צעצועים" },
    // Add other categories as needed
  ];

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        // Check sessionStorage first (from Admin Products page)
        const storedProductData = sessionStorage.getItem('editProductData');
        if (storedProductData) {
          try {
            const parsedData = JSON.parse(storedProductData);
            // Ensure correct data types, especially for potentially null numeric fields
            setProductData({
              ...parsedData,
              price: parsedData.price === null ? '' : parsedData.price, // Handle null price for contact_for_price
              minimum_order: parsedData.minimum_order || 1,
              stock: parsedData.stock || 0,
              category: parsedData.category || "",
              status: parsedData.status || "inactive", // Default status if null
              contact_for_price: parsedData.price === null, // Infer from price
            });
            sessionStorage.removeItem('editProductData'); // Clear after use
            setLoading(false);
            return;
          } catch (e) {
            console.error("Error parsing stored product data:", e);
            // Fallback to fetching if parsing fails
          }
        }

        // Fetch from API if not in sessionStorage or parsing failed
        if (!id) {
          toast.error("מזהה מוצר חסר");
          navigate("/admin/products");
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (!data) {
          toast.error("לא נמצא מוצר עם המזהה שצויין");
          navigate("/admin/products");
          return;
        }

        // Ensure data types are correct when fetching directly
        setProductData({
          ...data,
          price: data.price === null ? '' : data.price,
          minimum_order: data.minimum_order || 1,
          stock: data.stock || 0,
          category: data.category || "",
          status: data.status || "inactive",
          contact_for_price: data.price === null,
        });

      } catch (error) {
        console.error("Error loading product data:", error);
        toast.error("שגיאה בטעינת פרטי המוצר");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id, navigate]);

  const handleInputChange = (field, value) => {
    setProductData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  // Handle checkbox for 'Contact for Price'
  const handleContactForPriceChange = (checked) => {
    setProductData(prevData => ({
      ...prevData,
      contact_for_price: checked,
      // If checked, clear the price; otherwise, keep the existing price or set default if needed
      price: checked ? '' : (prevData.price || ''),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Basic validation
    if (!productData.title || !productData.category) {
        toast.error("נא למלא את שדות החובה: שם מוצר וקטגוריה.");
        setSaving(false);
        return;
    }
    if (!productData.contact_for_price && (productData.price === '' || productData.price === null || isNaN(Number(productData.price)) || Number(productData.price) < 0)) {
        toast.error("נא להזין מחיר תקין או לסמן 'צור קשר למחיר'.");
        setSaving(false);
        return;
    }


    const updateData = {
      title: productData.title,
      description: productData.description,
      price: productData.contact_for_price ? null : Number(productData.price),
      minimum_order: Number(productData.minimum_order) || 1,
      stock: Number(productData.stock) || 0,
      category: productData.category,
      status: productData.status,
    };

    // Remove contact_for_price as it's not a direct DB field
    // delete updateData.contact_for_price;

    try {
      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productData.id);

      if (error) throw error;

      toast.success("פרטי המוצר עודכנו בהצלחה");
      navigate("/admin/products"); // Navigate back to the products list

    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("שגיאה בעדכון פרטי המוצר: " + (error.message || ''));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Ensure productData is loaded before rendering form
  if (!productData) {
     // You might want a better loading state or error message here
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }


  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/products")}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          חזרה לרשימת המוצרים
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-700">עריכת מוצר</h2>
        <p className="text-gray-500">ערוך את פרטי המוצר: {productData.title}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">שם המוצר <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={productData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">תיאור המוצר</Label>
              <Textarea
                id="description"
                value={productData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

             <div>
              <Label htmlFor="price">מחיר (₪)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={productData.contact_for_price ? '' : (productData.price ?? '')} // Use ?? for nullish coalescing
                onChange={(e) => handleInputChange("price", e.target.value)}
                className="mt-1"
                disabled={productData.contact_for_price} // Disable if checkbox is checked
                required={!productData.contact_for_price} // Required only if not 'Contact for Price'
              />
             <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="contact_for_price"
                  checked={productData.contact_for_price || false}
                  onChange={(e) => handleContactForPriceChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="contact_for_price" className="my-0 font-normal text-sm">צור קשר למחיר</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="minimum_order">כמות מינימום להזמנה</Label>
              <Input
                id="minimum_order"
                type="number"
                min="1"
                value={productData.minimum_order || 1}
                onChange={(e) => handleInputChange("minimum_order", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">קטגוריה <span className="text-red-500">*</span></Label>
              <Select
                value={productData.category || ""}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

             <div>
              <Label htmlFor="stock">כמות במלאי</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={productData.stock ?? 0} // Use ?? for nullish coalescing, default to 0
                onChange={(e) => handleInputChange("stock", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">סטטוס פרסום</Label>
              <Select
                value={productData.status || "inactive"}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                  <SelectItem value="out_of_stock">אזל מהמלאי</SelectItem>
                  {/* Add other relevant statuses if needed */}
                </SelectContent>
              </Select>
            </div>

            {/* Placeholder for potential future fields */}
            {/* 
            <div>
              <Label htmlFor="subcategory">תת-קטגוריה</Label>
              <Input id="subcategory" ... />
            </div> 
            */}

          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
            ביטול
          </Button>
          <Button type="submit" disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                שומר...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                שמור שינויים
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 