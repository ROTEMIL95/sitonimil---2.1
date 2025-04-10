import React, { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { BadgeCheck, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setUsers(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את המשתמש?")) return;

    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error("Error deleting user:", error);
      return;
    }
    fetchUsers(); // רענון
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700">ניהול משתמשים</h2>

      {loading ? (
        <p>טוען נתונים...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-3 text-right">שם מלא</th>
                <th className="p-3 text-right">אימייל</th>
                <th className="p-3 text-right">תפקיד</th>
                <th className="p-3 text-right">סוג משתמש</th>
                <th className="p-3 text-right">מאומת</th>
                <th className="p-3 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-right">{user.full_name || "—"}</td>
                  <td className="p-3 text-right">{user.email}</td>
                  <td className="p-3 text-right">{user.role}</td>
                  <td className="p-3 text-right">{user.business_type}</td>
                  <td className="p-3 text-right">
                    {user.verified ? (
                      <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                        <BadgeCheck size={14} /> מאומת
                      </span>
                    ) : (
                      <span className="text-gray-500">לא</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 size={16} />
                      מחיקה
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
