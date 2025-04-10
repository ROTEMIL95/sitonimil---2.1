import React, { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Trash2, CircleCheck, CircleX, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, users(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם למחוק מוצר זה?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product:", error);
    } else {
      fetchProducts();
    }
  };

  const navigate = useNavigate();

const handleEdit = (productId) => {
  navigate(`/UploadProduct?edit=${productId}`);
};


  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700">ניהול מוצרים</h2>

      {loading ? (
        <p>טוען...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-600">
                <th className="p-3 text-right">שם מוצר</th>
                <th className="p-3 text-right">מחיר</th>
                <th className="p-3 text-right">קטגוריה</th>
                <th className="p-3 text-right">סטטוס</th>
                <th className="p-3 text-right">ספק</th>
                <th className="p-3 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-right">{p.title}</td>
                  <td className="p-3 text-right">{p.price} ₪</td>
                  <td className="p-3 text-right">{p.category}</td>
                  <td className="p-3 text-right">
                    {p.status === "active" ? (
                      <span className="text-green-600 flex items-center gap-1 justify-end">
                        <CircleCheck size={16} /> פעיל
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1 justify-end">
                        <CircleX size={16} /> {p.status}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">{p.users?.full_name || "—"}</td>
                  <td className="p-3 text-right">
                    <button
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 size={16} />
                      מחיקה
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      onClick={() => handleEdit(p.id)}
                    >
                      <Pencil size={16} />
                      עריכה
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
