import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // First check if we have data in sessionStorage (from Admin Users page)
        const storedUserData = sessionStorage.getItem('editUserData');
        
        if (storedUserData) {
          try {
            const parsedData = JSON.parse(storedUserData);
            setUserData(parsedData);
            // Clear sessionStorage after use
            sessionStorage.removeItem('editUserData');
            setLoading(false);
            return;
          } catch (e) {
            console.error("Error parsing stored user data:", e);
            // Continue with normal flow if parsing fails
          }
        }
        
        // If no stored data or parsing failed, fetch from API
        if (!id) {
          toast.error("מזהה משתמש חסר");
          navigate("/admin/users");
          return;
        }
        
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          toast.error("לא נמצא משתמש עם המזהה שצויין");
          navigate("/admin/users");
          return;
        }
        
        setUserData(data);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("שגיאה בטעינת פרטי המשתמש");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [id, navigate]);
  
  const handleInputChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          business_type: userData.business_type,
          verified: userData.verified,
          // Add other fields as needed
        })
        .eq("id", userData.id);
        
      if (error) throw error;
      
      toast.success("פרטי המשתמש עודכנו בהצלחה");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("שגיאה בעדכון פרטי המשתמש");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/admin/users")}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          חזרה לרשימת המשתמשים
        </Button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-700">עריכת משתמש</h2>
        <p className="text-gray-500">ערוך את פרטי המשתמש</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">שם מלא</Label>
            <Input
              id="full_name"
              value={userData.full_name || ""}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              value={userData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="mt-1"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">לא ניתן לשנות את כתובת האימייל</p>
          </div>
          
          <div>
            <Label htmlFor="role">תפקיד</Label>
            <select
              id="role"
              value={userData.role || ""}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="w-full border border-gray-300 rounded-md text-right px-3 py-2 mt-1"
            >
              <option value="user">משתמש רגיל</option>
              <option value="admin">מנהל</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="business_type">סוג משתמש</Label>
            <select
              id="business_type"
              value={userData.business_type || ""}
              onChange={(e) => handleInputChange("business_type", e.target.value)}
              className="w-full border border-gray-300 rounded-md text-right px-3 py-2 mt-1"
            >
              <option value="">לא הוגדר</option>
              <option value="supplier">ספק</option>
              <option value="buyer">קונה</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="verified"
              checked={userData.verified || false}
              onChange={(e) => handleInputChange("verified", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="verified" className="my-0">משתמש מאומת</Label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/users")}>
            ביטול
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                שומר...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                שמור שינויים
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 