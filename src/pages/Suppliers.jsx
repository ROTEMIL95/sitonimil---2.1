import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Building } from "lucide-react";
import SupplierCard from "../components/SupplierCard";

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    locations: [],
    minProducts: 0,
    establishedBefore: null
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const getCategoryLabel = (categoryValue) => {
    if (!categoryValue) return "כללי";
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        try {
          const allUsers = await User.list();
          
          const suppliersList = allUsers.filter(user => 
            user.business_type === "supplier" && user.company_name
          );
          
          setSuppliers(suppliersList);
        } catch (error) {
          console.error("Error loading suppliers:", error);
          setSuppliers([
            {
              id: "supplier1",
              company_name: "אלקטרוניקה בע\"מ",
              description: "ספק מוביל למוצרי אלקטרוניקה.",
              address: "תל אביב",
              verified: true
            },
            {
              id: "supplier2",
              company_name: "טקסטיל ישראל",
              description: "מגוון רחב של מוצרי טקסטיל איכותיים.",
              address: "חיפה",
              verified: true
            },
            {
              id: "supplier3",
              company_name: "בית וגן",
              description: "מוצרים לבית ולגינה במחירים סיטונאיים.",
              address: "ירושלים",
              verified: false
            },
            {
              id: "supplier4",
              company_name: "מזון טרי בע\"מ",
              description: "ספק מזון ומשקאות סיטונאי.",
              address: "באר שבע",
              verified: true
            },
            {
              id: "supplier5",
              company_name: "יופי ובריאות",
              description: "מוצרי קוסמטיקה ובריאות במחירים מיוחדים.",
              address: "רמת גן",
              verified: true
            }
          ]);
        }
        
        try {
          const productList = await Product.list();
          setProducts(productList);
        } catch (error) {
          console.error("Error loading products:", error);
          setProducts([
            {
              id: "product1",
              supplier_id: "supplier1",
              category: "electronics"
            },
            {
              id: "product2",
              supplier_id: "supplier2",
              category: "clothing"
            },
            {
              id: "product3",
              supplier_id: "supplier3",
              category: "home_goods"
            },
            {
              id: "product4",
              supplier_id: "supplier4",
              category: "food_beverage"
            },
            {
              id: "product5",
              supplier_id: "supplier5",
              category: "health_beauty"
            }
          ]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setLoading(false);
    };
    
    loadData();
  }, []);

  const getSupplierCategories = (supplierId) => {
    const supplierProducts = products.filter(p => p.supplier_id === supplierId);
    const categories = new Set(supplierProducts.map(p => p.category));
    return Array.from(categories);
  };

  const allCategories = Array.from(
    new Set(
      products
        .map(product => product.category)
        .filter(category => category)
    )
  ).sort();

  const allLocations = Array.from(
    new Set(
      suppliers
        .map(supplier => supplier.address)
        .filter(address => address)
    )
  ).sort();

  const filteredSuppliers = suppliers.filter(supplier => {
    const supplierCategories = getSupplierCategories(supplier.id);
    
    const matchesSearch = !searchQuery || 
      supplier.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.description && supplier.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (supplier.address && supplier.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || 
      supplierCategories.includes(selectedCategory);
    
    const matchesVerified = !filters.verifiedOnly || supplier.verified === true;
    
    const matchesLocation = filters.locations.length === 0 || 
      (supplier.address && filters.locations.includes(supplier.address));
    
    const supplierProductCount = products.filter(p => p.supplier_id === supplier.id).length;
    const matchesMinProducts = supplierProductCount >= filters.minProducts;
    
    const matchesEstablished = !filters.establishedBefore || 
      (supplier.established && supplier.established <= filters.establishedBefore);
    
    return matchesSearch && matchesCategory && matchesVerified && 
           matchesLocation && matchesMinProducts && matchesEstablished;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setFilters({
      verifiedOnly: false,
      locations: [],
      minProducts: 0,
      establishedBefore: null
    });
  };

  const toggleLocation = (location) => {
    setFilters(prev => {
      const newLocations = [...prev.locations];
      if (newLocations.includes(location)) {
        return {
          ...prev,
          locations: newLocations.filter(loc => loc !== location)
        };
      } else {
        return {
          ...prev,
          locations: [...newLocations, location]
        };
      }
    });
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-right">ספקים</h1>
        <p className="text-gray-500 text-right">
          מצא ספקים מהימנים מרחבי העולם לעסק שלך
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="חפש לפי שם, מיקום או תיאור..."
            className="pr-10 text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex gap-2 md:w-auto"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>{showFilters ? "הסתר מסננים" : "הצג מסננים"}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex gap-2 md:w-auto"
            onClick={() => navigate(createPageUrl("Search"))}
          >
            <Search className="h-4 w-4" />
            <span>חפש מוצרים</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm border border-gray-100">
          <h3 className="font-medium mb-4 text-right">סינון מתקדם</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium block text-right">אימות ספק</label>
              <div className="flex items-center justify-end">
                <label className="text-sm text-gray-700 cursor-pointer">
                  הצג רק ספקים מאומתים
                </label>
                <input 
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-blue-600 rounded" 
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium block text-right">מיקום</label>
              <div className="max-h-20 overflow-y-auto text-right">
                {allLocations.length > 0 ? (
                  allLocations.map(location => (
                    <div key={location} className="flex items-center justify-end mb-1">
                      <label className="text-sm text-gray-700 cursor-pointer">
                        {location}
                      </label>
                      <input 
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-blue-600 rounded" 
                        checked={filters.locations.includes(location)}
                        onChange={() => toggleLocation(location)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">אין מיקומים זמינים</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium block text-right">מספר מוצרים מינימלי</label>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{filters.minProducts}</span>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1"
                  className="w-full" 
                  value={filters.minProducts}
                  onChange={(e) => setFilters({...filters, minProducts: parseInt(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium block text-right">שנת הקמה</label>
              <select
                className="w-full border border-gray-300 rounded-md text-right px-3 py-2 text-sm"
                value={filters.establishedBefore || ""}
                onChange={(e) => setFilters({
                  ...filters, 
                  establishedBefore: e.target.value ? parseInt(e.target.value) : null
                })}
              >
                <option value="">כל השנים</option>
                {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>
                    לפני {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm" 
              onClick={handleClearFilters}
            >
              נקה את כל המסננים
            </Button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Tabs defaultValue="all" className="w-full" dir="rtl">
          <TabsList className="mb-4 h-auto flex flex-wrap w-full justify-start overflow-auto">
            <TabsTrigger 
              value="all" 
              onClick={() => setSelectedCategory(null)}
              className={!selectedCategory ? "bg-blue-600 text-white" : ""}
            >
              הכל
            </TabsTrigger>
            
            {allCategories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-blue-600 text-white" : ""}
              >
                {getCategoryLabel(category)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {(searchQuery || selectedCategory || 
        filters.verifiedOnly || 
        filters.locations.length > 0 || 
        filters.minProducts > 0 || 
        filters.establishedBefore) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-gray-500">מסננים פעילים:</span>
          
          {searchQuery && (
            <Badge variant="outline" className="flex items-center gap-1">
              חיפוש: {searchQuery}
            </Badge>
          )}
          
          {selectedCategory && (
            <Badge variant="outline" className="flex items-center gap-1">
              קטגוריה: {getCategoryLabel(selectedCategory)}
            </Badge>
          )}
          
          {filters.verifiedOnly && (
            <Badge variant="outline" className="flex items-center gap-1">
              ספקים מאומתים בלבד
            </Badge>
          )}
          
          {filters.locations.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              מיקומים: {filters.locations.length}
            </Badge>
          )}
          
          {filters.minProducts > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              מינימום {filters.minProducts} מוצרים
            </Badge>
          )}
          
          {filters.establishedBefore && (
            <Badge variant="outline" className="flex items-center gap-1">
              הוקם לפני: {filters.establishedBefore}
            </Badge>
          )}
          
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-blue-600"
            onClick={handleClearFilters}
          >
            נקה הכל
          </Button>
        </div>
      )}

      <div className="mb-6 text-right">
        <p className="text-sm text-gray-500">
          {filteredSuppliers.length} ספקים נמצאו
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-6">
              <div className="relative h-32 bg-gray-200 rounded-t-xl mb-10"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier) => {
                const supplierWithCategories = {
                  ...supplier,
                  categories: getSupplierCategories(supplier.id)
                };
                
                return (
                  <SupplierCard 
                    key={supplier.id} 
                    supplier={supplierWithCategories} 
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">לא נמצאו ספקים</h3>
              <p className="text-gray-500 mb-4">
                נסה לשנות את מונחי החיפוש או לבטל את המסננים
              </p>
              <Button onClick={handleClearFilters}>
                הצג את כל הספקים
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
