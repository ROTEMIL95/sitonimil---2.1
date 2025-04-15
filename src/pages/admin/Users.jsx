import React, { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { BadgeCheck, Trash2, Pencil, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("שגיאה בטעינת משתמשים");
        return;
      }
      setUsers(data || []);
    } catch (err) {
        console.error("Exception fetching users:", err);
        toast.error("שגיאה בטעינת משתמשים");
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error || !data) {
        console.error("Error fetching user details:", error);
        toast.error("שגיאה בטעינת פרטי המשתמש");
        return;
      }
      
      sessionStorage.setItem('editUserData', JSON.stringify(data));
      navigate(`/admin/users/edit/${userId}`);

    } catch (err) {
      console.error("Error in edit process:", err);
      toast.error("שגיאה בתהליך עריכת המשתמש");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את המשתמש?")) return;

    try {
        const { error } = await supabase.from("users").delete().eq("id", id);
        if (error) {
          console.error("Error deleting user:", error);
          toast.error("שגיאה במחיקת המשתמש");
          return;
        }
        toast.success("המשתמש נמחק בהצלחה");
        fetchUsers(); // Refresh list
    } catch (err) {
        console.error("Exception deleting user:", err);
        toast.error("שגיאה במחיקת המשתמש");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadgeVariant = (role) => {
      switch (role?.toLowerCase()) {
          case 'admin': return 'destructive';
          case 'supplier': return 'secondary';
          case 'buyer': return 'outline';
          default: return 'default';
      }
  };
  
  const getVerifiedBadgeVariant = (verified) => {
      return verified ? 'success' : 'secondary';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700">ניהול משתמשים</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-gray-800/50">
                <TableRow>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">שם מלא</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">אימייל</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">תפקיד</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">סוג משתמש</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-right text-xs dark:text-gray-400">מאומת</TableHead>
                  <TableHead className="px-5 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400">פעולות</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
                      לא נמצאו משתמשים
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-right font-medium text-gray-800 text-sm dark:text-white/90">
                        {user.full_name || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-gray-500 text-sm dark:text-gray-400">
                        {user.email}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-sm">
                        <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                            {user.role || "לא הוגדר"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-sm">
                         <Badge variant={getRoleBadgeVariant(user.business_type)} size="sm">
                           {user.business_type || "לא הוגדר"}
                         </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-sm">
                        <Badge variant={getVerifiedBadgeVariant(user.verified)} size="sm">
                            {user.verified ? (
                                <span className="flex items-center gap-1"><BadgeCheck size={14}/> מאומת</span> 
                            ) : 'לא מאומת'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                         <div className="flex justify-center gap-1">
                           <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(user.id)}
                            title="ערוך משתמש"
                            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(user.id)}
                            title="מחק משתמש"
                            className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
