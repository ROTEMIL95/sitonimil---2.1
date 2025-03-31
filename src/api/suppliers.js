import { supabase } from "./supabaseClient";

/**
 * טוען מידע על ספק לפי ID
 * @param {string} supplierId - המזהה הייחודי של הספק
 * @returns {Promise<Object>} - מידע מלא על הספק
 */
export const fetchSupplierById = async (supplierId) => {
  try {
    console.log("Fetching supplier data for ID:", supplierId);
    
    // מנסה להביא את המידע מטבלת המשתמשים (שם נמצאים הספקים)
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", supplierId)
      .eq("business_type", "supplier")
      .single();
    
    if (error) {
      console.error("Error fetching supplier:", error);
      throw error;
    }
    
    if (!data) {
      console.warn("No supplier found with ID:", supplierId);
      return null;
    }
    
    // מחזיר אובייקט שם עם שדות מותאמים שיתאימו לשימוש ב-ProductCard
    return {
      id: data.id,
      name: data.full_name || data.company_name || "ספק",
      logo: data.logo_url || null,
      company_name: data.company_name || data.full_name || "",
      address: data.address || "",
      phone: data.phone || "",
      verified: data.verified || false,
      description: data.description || ""
    };
  } catch (error) {
    console.error("Failed to fetch supplier data:", error);
    return null;
  }
};

/**
 * מביא רשימת ספקים
 * @param {number} limit - מספר הספקים המקסימלי להחזרה
 * @returns {Promise<Array>} - רשימת ספקים
 */
export const fetchSuppliers = async (limit = 20) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("business_type", "supplier")
      .limit(limit);
    
    if (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
    
    return data.map(supplier => ({
      id: supplier.id,
      name: supplier.full_name || supplier.company_name || "ספק",
      logo: supplier.logo_url || null,
      company_name: supplier.company_name || supplier.full_name || "",
      address: supplier.address || "",
      phone: supplier.phone || "",
      verified: supplier.verified || false,
      description: supplier.description || ""
    }));
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    return [];
  }
}; 