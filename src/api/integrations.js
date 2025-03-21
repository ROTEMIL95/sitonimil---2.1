import { supabase } from "./supabaseClient";

/* ---------------- CRUD כללי לכל הטבלאות ---------------- */

// קבלת כל הנתונים מטבלה מסוימת
export async function getData(table) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
        console.error(`Error fetching data from ${table}:`, error);
        return { success: false, error };
    }
    return { success: true, data };
}

// הוספת רשומה חדשה לטבלה
export async function addData(table, newData) {
    const { data, error } = await supabase.from(table).insert([newData]);
    if (error) {
        console.error(`Error adding data to ${table}:`, error);
        console.log("🟨 נתוני המוצר:", formattedData);

        return { success: false, error };
    }
    return { success: true, data };
}

// עדכון רשומה קיימת לפי ID
export async function updateData(table, id, updatedFields) {
    const { data, error } = await supabase.from(table).update(updatedFields).eq("id", id);
    if (error) {
        console.error(`Error updating data in ${table}:`, error);
        return { success: false, error };
    }
    return { success: true, data };
}

// מחיקת רשומה לפי ID
export async function deleteData(table, id) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
        console.error(`Error deleting data from ${table}:`, error);
        return { success: false, error };
    }
    return { success: true };
}

// קבלת רשומה לפי ID
export async function getById(table, id) {
    const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
    if (error) {
        console.error(`Error fetching data by ID from ${table}:`, error);
        return { success: false, error };
    }
    return { success: true, data };
}

/* ---------------- יצירת יוזר ושמירתו בטבלה ---------------- */
export async function signUpUser(email, password, full_name, company_name, business_type, address, phone) {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
        console.error("Error signing up:", authError);
        return { success: false, error: authError };
    }
    const userId = authData.user?.id;
    const { data: userData, error: dbError } = await supabase.from("users").insert([{ id: userId, email, full_name, company_name, business_type, address, phone, verified: false, created_at: new Date() }]);
    if (dbError) {
        console.error("Error saving user data:", dbError);
        return { success: false, error: dbError };
    }
    return { success: true, user: authData.user, userData };
}

/* ---------------- פונקציות לניהול ביקורות (Reviews) ---------------- */

export async function addReview(reviewer_id, supplier_id, rating, comment = "", product_id = null) {
    return await addData("reviews", { reviewer_id, supplier_id, rating, comment, product_id });
}

export async function getReviewsBySupplier(supplier_id) {
    return await getData("reviews", { supplier_id });
}

export async function getReviewsByProduct(product_id) {
    return await getData("reviews", { product_id });
}


// * ---------------- פונקציות לניהול מוצרים (Products) ---------------- */

/**
 * Upload a new product to the database
 * @param {Object} productData - Complete product data object with all fields
 * @returns {Promise} - Promise with the result of the operation
 */
export async function UploadProduct(productData) {
    // Ensure all required fields are present
    const requiredFields = {
        title: productData.title || "",
        description: productData.description || "",
        price: Number(productData.price) || 0,
        minimum_order: Number(productData.minimum_order) || 1,
        category: productData.category || "",
        images: Array.isArray(productData.images) ? productData.images : [],
        stock: Number(productData.stock) || 0,
        specifications: productData.specifications || {},
        supplier_id: productData.supplier_id,
        status: productData.status || "active",
        created_at: productData.created_at || new Date()
    };
    
    // Format the data according to the database schema
    const formattedData = {
        ...requiredFields,
        // Ensure images and specifications are properly formatted as JSONB
        images: JSON.stringify(requiredFields.images),
        specifications: JSON.stringify(requiredFields.specifications)
    };
    
    return await addData("products", formattedData);
}

export async function getProductsByCategory(category) {
    return await getData("products", { category });
}

export async function getProductById(product_id) {
    return await getById("products", product_id);
}


