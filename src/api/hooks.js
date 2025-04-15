import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './entities';
import { User, Product, Message } from './entities';

// ========== User Hooks ==========

// קבלת פרטי משתמש מחובר
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.USER.ME,
    queryFn: User.me,
    retry: 1,
  });
}

// קבלת כל המשתמשים
export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.USER.ALL,
    queryFn: User.list,
  });
}

// קבלת כל הספקים
export function useSuppliers() {
  return useQuery({
    queryKey: QUERY_KEYS.USER.SUPPLIERS,
    queryFn: User.getSuppliers,
  });
}

// קבלת משתמש לפי ID
export function useUser(userId) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.DETAIL(userId),
    queryFn: () => User.getById(userId),
    enabled: !!userId, // יופעל רק אם userId קיים
  });
}

// עדכון פרטי משתמש
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: User.updateMyUserData,
    onSuccess: (data) => {
      // עדכון המטמון
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.ME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.ALL });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.DETAIL(data.id) });
      }
    },
  });
}

// ========== Product Hooks ==========

// קבלת כל המוצרים
export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT.ALL,
    queryFn: Product.list,
  });
}

// קבלת מוצר לפי ID
export function useProduct(productId) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT.DETAIL(productId),
    queryFn: () => Product.getById(productId),
    enabled: !!productId, // יופעל רק אם productId קיים
  });
}

// קבלת מוצרים לפי קטגוריה
export function useProductsByCategory(category) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT.BY_CATEGORY(category),
    queryFn: () => Product.getByCategory(category),
    enabled: !!category, // יופעל רק אם קטגוריה קיימת
  });
}

// קבלת מוצרים של ספק מסוים
export function useProductsBySupplier(supplierId) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT.BY_SUPPLIER(supplierId),
    queryFn: () => Product.getBySupplier(supplierId),
    enabled: !!supplierId, // יופעל רק אם supplierId קיים
  });
}

// חיפוש מוצרים
export function useProductSearch(searchTerm) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT.SEARCH(searchTerm),
    queryFn: () => Product.search(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2, // יופעל רק אם יש לפחות 3 תווים בחיפוש
  });
}

// הוספת מוצר חדש
export function useAddProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: Product.add,
    onSuccess: (data) => {
      // עדכון המטמון
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT.ALL });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.PRODUCT.BY_SUPPLIER(data.supplier_id) 
      });
      if (data.category) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PRODUCT.BY_CATEGORY(data.category)
        });
      }
    },
  });
}

// עדכון מוצר קיים
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: Product.update,
    onSuccess: (data) => {
      // עדכון המטמון
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT.ALL });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.PRODUCT.DETAIL(data.id) 
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCT.BY_SUPPLIER(data.supplier_id)
      });
      if (data.category) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PRODUCT.BY_CATEGORY(data.category)
        });
      }
    },
  });
}

// מחיקת מוצר
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: Product.remove,
    onSuccess: (_, variables) => {
      // עדכון המטמון - המשתנה variables כאן הוא ה-ID של המוצר
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT.ALL });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.PRODUCT.DETAIL(variables) 
      });
      
      // במקרה זה אנחנו לא יודעים את הספק או הקטגוריה, אז נעדכן את הכל
      queryClient.invalidateQueries({ 
        queryKey: ['products'] 
      });
    },
  });
} 