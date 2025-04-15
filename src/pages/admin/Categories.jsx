import React, { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Trash2, Loader2, Plus, Tag } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      console.log("Fetching categories...");
      const { data, error } = await supabase
        .from("categories")
        .select("id, label, value")
        .order("label", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        toast.error(`שגיאה בטעינת קטגוריות: ${error.message || 'לא ידוע'}`);
        setCategories([]);
      } else {
        console.log("Categories loaded:", data);
        setCategories(data || []);
      }
    } catch (err) {
      console.error("Exception fetching categories:", err);
      toast.error("שגיאה בטעינת קטגוריות");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const label = newCategoryLabel.trim();
    let value = newCategoryValue.trim();

    if (!label) {
      toast.error("נא להזין שם קטגוריה (Label)");
      return;
    }
    
    if (!value) {
      value = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setNewCategoryValue(value);
      toast.info(`ערך (Value) נוצר אוטומטית: ${value}`);
    } else if (!/^[a-z0-9-]+$/.test(value)) {
      toast.error("ערך (Value) יכול להכיל רק אותיות קטנות באנגלית, מספרים ומקפים (-)");
      return;
    }

    setSaving(true);
    try {
      const { data: labelExists, error: labelError } = await supabase
        .from("categories")
        .select("id")
        .eq("label", label)
        .maybeSingle();

      if (labelError) {
        console.error("Error checking existing category label:", labelError);
        toast.error("שגיאה בבדיקת שם קטגוריה קיים");
        setSaving(false);
        return;
      }
      if (labelExists) {
        toast.error("קטגוריה עם שם זה כבר קיימת");
        setSaving(false);
        return;
      }

      const { data: valueExists, error: valueError } = await supabase
        .from("categories")
        .select("id")
        .eq("value", value)
        .maybeSingle();
        
      if (valueError) {
        console.error("Error checking existing category value:", valueError);
        toast.error("שגיאה בבדיקת ערך קטגוריה קיים");
        setSaving(false);
        return;
      }
      if (valueExists) {
        toast.error("קטגוריה עם ערך (value) זה כבר קיימת");
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([{ label: label, value: value }])
        .select();

      if (error) {
        console.error("Error adding category:", error);
        toast.error(`שגיאה בהוספת קטגוריה: ${error.message || 'שגיאה לא ידועה'}`);
      } else {
        toast.success(`קטגוריה "${label}" נוספה בהצלחה`);
        setNewCategoryLabel("");
        setNewCategoryValue("");
        setIsDialogOpen(false);
        fetchCategories();
      }
    } catch (err) {
      console.error("Exception adding category:", err);
      toast.error("שגיאה בהוספת קטגוריה");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id, label) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${label}"?`)) return;
    
    setLoading(true);
    try {
      const { count, error: checkError } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category", label);

      if (checkError) {
        console.error("Error checking linked products:", checkError);
        toast.error("שגיאה בבדיקת מוצרים מקושרים");
        setLoading(false);
        return;
      }

      if (count > 0) {
        toast.error(`לא ניתן למחוק קטגוריה "${label}" מכיוון שיש ${count} מוצרים המשויכים אליה`);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting category:", error);
        toast.error("שגיאה במחיקת הקטגוריה");
      } else {
        toast.success(`קטגוריה "${label}" נמחקה בהצלחה`);
        fetchCategories();
      }
    } catch (err) {
      console.error("Exception deleting category:", err);
      toast.error("שגיאה במחיקת הקטגוריה");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ניהול קטגוריות</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={18} />
              הוסף קטגוריה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl" dir="rtl">
            <DialogHeader className="p-4 border-b dark:border-gray-700">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">הוספת קטגוריה חדשה</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                הזן את שם הקטגוריה (Label) ואת הערך הייחודי (Value/Slug).
                אם הערך יישאר ריק, הוא ייווצר אוטומטית מהשם.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="category-label" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  שם הקטגוריה (Label)
                </Label>
                <Input
                  id="category-label"
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  placeholder="לדוגמה: אלקטרוניקה"
                  required
                />
              </div>
              <div className="space-y-1.5">
                 <Label htmlFor="category-value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                   ערך / Slug (Value)
                 </Label>
                 <Input
                   id="category-value"
                   value={newCategoryValue}
                   onChange={(e) => setNewCategoryValue(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                   className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:text-white ltr"
                   placeholder="לדוגמה: electronics (אותיות קטנות, מספרים ומקפים)"
                 />
                 <p className="text-xs text-gray-500 dark:text-gray-400">יכול להכיל רק אותיות קטנות באנגלית, מספרים ומקפים (-). אם ישאר ריק ייווצר אוטומטית.</p>
              </div>
              <DialogFooter className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                  ביטול
                </Button>
                <Button type="submit" disabled={saving || !newCategoryLabel.trim()} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin inline-flex ml-2" /> : <Plus className="h-4 w-4 inline-flex ml-2" />}
                  {saving ? "שומר..." : "הוסף קטגוריה"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                <TableRow>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right text-xs">שם קטגוריה (Label)</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right text-xs">ערך (Value)</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center text-xs">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                      לא נמצאו קטגוריות
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                      <TableCell className="px-5 py-4 text-right font-medium text-gray-800 dark:text-white text-sm">
                        <span className="flex items-center gap-2">
                          <Tag size={16} className="text-gray-400 dark:text-gray-500" />
                          {category.label}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right text-gray-600 dark:text-gray-300 text-sm font-mono">
                        {category.value}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id, category.label)}
                          title="מחק קטגוריה"
                          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
