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
                        business_type: businessType,
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
        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        if (!user) return null;
        
        try {
            // Get additional user data from the users table
            const { data: userData, error: userDataError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (userDataError && userDataError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
                console.warn("Error fetching user data:", userDataError);
                // Return just the auth user if we can't get the extended data
                return user;
            }
            
            // Merge the auth user with the additional data
            return {
                ...user,
                ...(userData || {}),
                // Ensure user_metadata is not overwritten
                user_metadata: user.user_metadata
            };
        } catch (error) {
            console.error("Error in me() method:", error);
            // Fall back to just returning the auth user
            return user;
        }
    },

    async updateUserMetadata(metadata) {
        const { data, error } = await supabase.auth.updateUser({
            data: metadata
        });
        
        if (error) throw error;
        return data;
    },

    async updateMyUserData(userData) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Create a copy of userData for the database update
        const dbUserData = { ...userData };
        
        // Always update the user metadata if business_type is being changed
        if (userData.business_type) {
            try {
                await this.updateUserMetadata({
                    business_type: userData.business_type
                });
                console.log("User metadata updated with business_type:", userData.business_type);
            } catch (metadataError) {
                console.error("Error updating user metadata:", metadataError);
                // Continue even if metadata update fails
            }
        }

        // Update the user record in the database
        const { data, error } = await supabase
            .from('users')
            .update(dbUserData)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating user data in database:", error);
            throw error;
        }
        
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
        try {
            // Simple query as requested
            let { data: products, error } = await supabase
                .from('products')
                .select('*');
            
            if (error) throw error;
            
            // Verify and log product data
            console.log(`Product.list fetched ${products.length} products`);
            console.log("Raw products from Supabase:", products);

            // Return properly structured data
            return products.map(product => ({
                ...product,
                // Ensure images is parsed properly from JSONB
                images: typeof product.images === 'string' 
                    ? JSON.parse(product.images) 
                    : (Array.isArray(product.images) ? product.images : []),
                // Ensure specifications is parsed properly from JSONB
                specifications: typeof product.specifications === 'string'
                    ? JSON.parse(product.specifications)
                    : (product.specifications || {})
            }));
        } catch (error) {
            console.error("Error in Product.list:", error);
            throw error;
        }
    },

    async getById(id) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            // Process JSONB fields
            return {
                ...data,
                // Ensure images is parsed properly from JSONB
                images: typeof data.images === 'string' 
                    ? JSON.parse(data.images) 
                    : (Array.isArray(data.images) ? data.images : []),
                // Ensure specifications is parsed properly from JSONB
                specifications: typeof data.specifications === 'string'
                    ? JSON.parse(data.specifications)
                    : (data.specifications || {})
            };
        } catch (error) {
            console.error(`Error fetching product with ID ${id}:`, error);
            throw error;
        }
    },

    async create(productData) {
        try {
            // Format JSONB fields correctly
            const formattedData = {
                ...productData,
                // Convert arrays and objects to strings for JSONB fields
                images: Array.isArray(productData.images) 
                    ? JSON.stringify(productData.images) 
                    : JSON.stringify([]),
                specifications: productData.specifications
                    ? JSON.stringify(productData.specifications)
                    : JSON.stringify({})
            };

            const { data, error } = await supabase
                .from('products')
                .insert([formattedData])
                .select()
                .single();
            
            if (error) throw error;
            
            console.log("Product created successfully:", data.id);
            return data;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
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
