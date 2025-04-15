import React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/api/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star, RotateCcw, Loader2 } from "lucide-react";

// קטגוריות ברירת מחדל במקרה של כשל בטעינה
const DEFAULT_CATEGORIES = [
  { value: "electronics", label: "אלקטרוניקה" },
  { value: "clothing", label: "ביגוד" },
  { value: "home_goods", label: "מוצרי בית" },
  { value: "food_beverage", label: "מזון ומשקאות" },
  { value: "health_beauty", label: "בריאות ויופי" },
  { value: "industrial", label: "ציוד תעשייתי" },
  { value: "automotive", label: "רכב" },
  { value: "sports", label: "ספורט" },
  { value: "toys", label: "צעצועים" }
];

export default function ProductFilter({ options, onChange, onReset }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // לקבל את הנתונים מטבלת הקטגוריות
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('label', { ascending: true });
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // נרשום לקונסול את הנתונים שקיבלנו כדי לעזור באבחון
        console.log('Categories data from server:', data);
        
        if (!data || data.length === 0) {
          console.log('No categories found in database');
          setCategories(DEFAULT_CATEGORIES);
          return;
        }
        
        // המבנה בדאטהבייס הוא כבר value ו-label, נשתמש בהם ישירות
        // אבל עדיין נבצע בדיקת תקינות
        const formattedCategories = data
          .filter(category => category.value && category.label)
          .map(category => ({
            value: category.value,
            label: category.label
          }));
        
        console.log('Formatted categories:', formattedCategories);
        
        // אם אין קטגוריות תקינות לאחר העיבוד, נשתמש בברירת המחדל
        if (formattedCategories.length === 0) {
          console.log('No valid categories after processing, using defaults');
          setCategories(DEFAULT_CATEGORIES);
        } else {
          setCategories(formattedCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // שיפור הודעת השגיאה עם פרטים נוספים
        setError(`שגיאה בטעינת הקטגוריות: ${err.message || 'Unknown error'}`);
        // במקרה של שגיאה, נשתמש בקטגוריות ברירת המחדל
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <div className="space-y-3">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border" dir="rtl">
        <div className="p-2.5 flex items-center justify-between">
          <h3 className="text-base font-medium text-right">סינון מוצרים</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 p-0 h-6 flex items-center gap-1"
          >
            <span>נקה הכל</span>
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
          </Button>
        </div>
        <Separator />
        
        <div className="p-2.5">
          <Accordion type="multiple" defaultValue={["categories", "price", "rating"]} className="space-y-1">
            <AccordionItem value="sort" className="border-b-0">
              <AccordionTrigger className="py-1.5 hover:no-underline text-right justify-end flex-row-reverse">
                <span className="text-sm font-medium">מיון לפי</span>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-1.5">
                <Select
                  value={options.sortBy}
                  onValueChange={(value) => onChange({ sortBy: value })}
                  dir="rtl"
                >
                  <SelectTrigger className="h-8 text-sm text-right">
                    <SelectValue placeholder="בחר מיון" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="newest">חדש ביותר</SelectItem>
                    <SelectItem value="price-low">מחיר: מהנמוך לגבוה</SelectItem>
                    <SelectItem value="price-high">מחיר: מהגבוה לנמוך</SelectItem>
                    <SelectItem value="popular">פופולריות</SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
  
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="py-1.5 hover:no-underline text-right justify-end flex-row-reverse">
                <span className="text-sm font-medium">קטגוריות</span>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-1.5">
                <div className="space-y-1.5 max-h-32 overflow-y-auto pl-1">
                  {isLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  ) : error ? (
                    <div className="text-sm text-red-500 py-1 text-right">{error}</div>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <div key={category.value} className="flex items-center space-x-reverse space-x-2">
                        <Checkbox
                          id={category.value}
                          checked={options.categories.includes(category.value)}
                          onCheckedChange={(checked) => {
                            const newCategories = checked
                              ? [...options.categories, category.value]
                              : options.categories.filter((c) => c !== category.value);
                            onChange({ categories: newCategories });
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-3.5 w-3.5"
                        />
                        <Label htmlFor={category.value} className="cursor-pointer text-sm text-right">
                          {category.label}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 py-1 text-right">לא נמצאו קטגוריות</div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
  
            <AccordionItem value="price" className="border-b-0">
              <AccordionTrigger className="py-1.5 hover:no-underline text-right justify-end flex-row-reverse">
                <span className="text-sm font-medium">טווח מחירים</span>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-1.5">
                <div className="mb-4">
                  <Slider
                    value={options.priceRange}
                    min={0}
                    max={500}
                    step={10}
                    className="my-3"
                    onValueChange={(value) => onChange({ priceRange: value })}
                    dir="rtl"
                  />
                  <div className="flex justify-between text-sm">
                    <span>₪{options.priceRange[1]}</span>
                    <span>₪{options.priceRange[0]}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
  
            <AccordionItem value="minOrder" className="border-b-0">
              <AccordionTrigger className="py-1.5 hover:no-underline text-right justify-end flex-row-reverse">
                <span className="text-sm font-medium">כמות מינימלית להזמנה</span>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-1.5">
                <div className="mb-4">
                  <Slider
                    value={options.minOrderRange}
                    min={0}
                    max={200}
                    step={5}
                    className="my-3"
                    onValueChange={(value) => onChange({ minOrderRange: value })}
                    dir="rtl"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{options.minOrderRange[1]} יח׳</span>
                    <span>{options.minOrderRange[0]} יח׳</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
  
            <AccordionItem value="rating" className="border-b-0">
              <AccordionTrigger className="py-1.5 hover:no-underline text-right justify-end flex-row-reverse">
                <span className="text-sm font-medium">דירוג מינימלי</span>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-1.5">
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className={`flex items-center p-1.5 rounded-md cursor-pointer transition-colors ${
                        options.rating === rating
                          ? "bg-blue-50/80 text-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => onChange({ rating: options.rating === rating ? 0 : rating })}
                    >
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3.5 w-3.5 ${
                              index < rating
                                ? options.rating === rating
                                  ? "text-blue-500 fill-blue-500"
                                  : "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs mr-1">ומעלה</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}