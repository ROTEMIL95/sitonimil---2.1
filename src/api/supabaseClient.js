import { createClient } from "@supabase/supabase-js";

// שימוש ב-import.meta.env במקום process.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase URL or Key. Check your .env file.");
}

// יצירת חיבור ל-Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
