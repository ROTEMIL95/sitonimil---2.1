import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
import { Star, RotateCcw } from "lucide-react";

// רשימת הקטגוריות
const categories = [
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
  return (
    <div className="space-y-4">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
        <div className="p-4 flex items-center justify-between">
          <h3 className="text-base font-medium">סינון מוצרים</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 p-0 h-6 flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>נקה הכל</span>
          </Button>
        </div>
        <Separator />
        
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["categories", "price", "rating"]} className="space-y-2">
            <AccordionItem value="sort" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <span className="text-sm font-medium">מיון לפי</span>
              </AccordionTrigger>
              <AccordionContent>
                <Select
                  value={options.sortBy}
                  onValueChange={(value) => onChange({ sortBy: value })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="בחר מיון" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">חדש ביותר</SelectItem>
                    <SelectItem value="price-low">מחיר: מהנמוך לגבוה</SelectItem>
                    <SelectItem value="price-high">מחיר: מהגבוה לנמוך</SelectItem>
                    <SelectItem value="popular">פופולריות</SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
  
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <span className="text-sm font-medium">קטגוריות</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={category.value}
                        checked={options.categories.includes(category.value)}
                        onCheckedChange={(checked) => {
                          const newCategories = checked
                            ? [...options.categories, category.value]
                            : options.categories.filter((c) => c !== category.value);
                          onChange({ categories: newCategories });
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor={category.value} className="cursor-pointer text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
  
            <AccordionItem value="price" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <span className="text-sm font-medium">טווח מחירים</span>
              </AccordionTrigger>
              <AccordionContent className="pt-3">
                <div className="mb-6">
                  <Slider
                    value={options.priceRange}
                    min={0}
                    max={500}
                    step={10}
                    className="my-5"
                    onValueChange={(value) => onChange({ priceRange: value })}
                  />
                  <div className="flex justify-between text-sm">
                    <span>₪{options.priceRange[0]}</span>
                    <span>₪{options.priceRange[1]}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
  
            <AccordionItem value="minOrder" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <span className="text-sm font-medium">כמות מינימלית להזמנה</span>
              </AccordionTrigger>
              <AccordionContent className="pt-3">
                <div className="mb-6">
                  <Slider
                    value={options.minOrderRange}
                    min={0}
                    max={200}
                    step={5}
                    className="my-5"
                    onValueChange={(value) => onChange({ minOrderRange: value })}
                  />
                  <div className="flex justify-between text-sm">
                    <span>{options.minOrderRange[0]} יח׳</span>
                    <span>{options.minOrderRange[1]} יח׳</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
  
            <AccordionItem value="rating" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <span className="text-sm font-medium">דירוג מינימלי</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
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
                            className={`h-4 w-4 ${
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