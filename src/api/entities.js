import { supabase } from "./supabaseClient";

export const User = {
    id: "uuid",
    role: "text",
    email: "text",
    full_name: "text",
    company_name: "text",
    business_type: "text",
    description: "text",
    logo_url: "text",
    address: "text",
    phone: "text",
    categories: "array",
    verified: "boolean",
    created_at: "timestamp",

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },

    async register(email, password, fullName, businessType, supplierData = null) {
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: "user",
                    },
                },
            });

            if (authError) throw authError;

            // Prepare user data
            const userData = {
                id: authData.user.id,
                email,
                full_name: fullName,
                role: "user",
                business_type: businessType,
                description: "",
                verified: false,
                created_at: new Date().toISOString(),
            };

            // Add supplier-specific data if applicable
            if (businessType === "supplier" && supplierData) {
                Object.assign(userData, {
                    company_name: supplierData.company_name,
                    description: supplierData.description || "",
                    address: supplierData.address,
                    phone: supplierData.phone,
                    website: supplierData.website || null,
                });
            }

            // Create user record in users table
            const { error: userError } = await supabase
                .from("users")
                .insert([userData]);

            if (userError) {
                // If user creation fails, we'll just throw the error
                // The auth user will remain but won't have a corresponding record
                // This can be handled by the admin later if needed
                throw userError;
            }

            return {
                authData,
                userData,
            };
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async me() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    async updateMyUserData(userData) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async list() {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        
        if (error) throw error;
        return data;
    }
};

export const Product = {
    id: "uuid",
    title: "text",
    description: "text",
    price: "number",
    minimum_order: "number",
    category: "text",
    images: "array",
    stock: "number",
    rating: "number",
    specifications: "object",
    supplier_id: "uuid",
    status: "text",
    created_at: "timestamp",

    async list() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    async create(productData) {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async update(id, productData) {
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    async getBySupplier(supplierId) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('supplier_id', supplierId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async getByCategory(category) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async search(query) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
};

export const Message = {
    id: "uuid",
    sender_id: "uuid",
    receiver_id: "uuid",
    content: "text",
    read: "boolean",
    product_id: "uuid",
    created_at: "timestamp"
};

export const favoriteSchema = {
    id: "uuid",
    user_id: "uuid",
    product_id: "uuid",
    supplier_id: "uuid",
    created_at: "timestamp"
};

export const notificationSchema = {
    id: "uuid",
    user_id: "uuid",
    message: "text",
    is_read: "boolean",
    created_at: "timestamp"
};

export const logSchema = {
    id: "uuid",
    user_id: "uuid",
    action: "text",
    details: "text",
    created_at: "timestamp"
};

export const reportSchema = {
    id: "uuid",
    reporter_id: "uuid",
    reported_supplier_id: "uuid",
    reported_product_id: "uuid",
    reason: "text",
    status: "text",
    created_at: "timestamp"
};

export const Review = {
    id: "uuid",
    reviewer_id: "uuid",
    supplier_id: "uuid",
    rating: "number",
    comment: "text",
    product_id: "uuid",
    created_at: "timestamp"
};

export const Category = {
    id: "uuid",
    value: "text",
    label: "text",
    image: "text",
    created_at: "timestamp",

    async getRandomCategories(limit = 5) {
        const { data, error } = await supabase
            .from('categories')
            .select('id, label,image_url')
            .order('id')
            .limit(limit);

        if (error) throw error;
        return data;
    },

    async list() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
};
