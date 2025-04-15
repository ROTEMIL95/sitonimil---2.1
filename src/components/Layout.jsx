import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { prefetchData } from "@/api/queryClient";
import { QUERY_KEYS } from "@/api/entities";
import { Product, User, Category } from "@/api/entities";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const isRtl = true; // Assuming this is for Hebrew

  // Prefetch common data based on current route to reduce server calls on navigation
  useEffect(() => {
    // Base data that's useful everywhere
    prefetchData(QUERY_KEYS.USER.ME, User.me);
    
    // Route-specific prefetching
    if (pathname === "/" || pathname.includes("/home")) {
      // Home page - prefetch featured products, categories and suppliers
      prefetchData(QUERY_KEYS.PRODUCT.ALL, Product.list);
      prefetchData(QUERY_KEYS.USER.SUPPLIERS, User.getSuppliers);
    } 
    else if (pathname.includes("/search")) {
      // Search page - prefetch categories for filters
      if (window.location.search.includes("category=")) {
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category");
        if (category) {
          prefetchData(QUERY_KEYS.PRODUCT.BY_CATEGORY(category), () => Product.getByCategory(category));
        }
      }
    }
    else if (pathname.includes("/product")) {
      // Product page - get product ID from URL
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("id");
      const supplierId = params.get("supplier_id");
      
      if (productId) {
        prefetchData(QUERY_KEYS.PRODUCT.DETAIL(productId), () => Product.getById(productId));
      }
      
      if (supplierId) {
        prefetchData(QUERY_KEYS.USER.DETAIL(supplierId), () => User.getById(supplierId));
        prefetchData(QUERY_KEYS.PRODUCT.BY_SUPPLIER(supplierId), () => Product.getBySupplier(supplierId));
      }
    }
  }, [pathname]);
  
  // ... existing component code ...
} 