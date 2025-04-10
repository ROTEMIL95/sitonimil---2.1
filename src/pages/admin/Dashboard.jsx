import React, { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Boxes, Users, Building2, User } from "lucide-react";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    products: 0,
    suppliers: 0,
    buyers: 0,
    users: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        const { count: supplierCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("business_type", "supplier");

        const { count: buyerCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("business_type", "buyer");

        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        setCounts({
          products: productCount || 0,
          suppliers: supplierCount || 0,
          buyers: buyerCount || 0,
          users: userCount || 0
        });
      } catch (error) {
        console.error("Error fetching admin counts:", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700">מבט כללי על המערכת</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="מוצרים" icon={<Boxes className="text-blue-500" />} count={counts.products} />
        <StatCard title="ספקים" icon={<Building2 className="text-green-500" />} count={counts.suppliers} />
        <StatCard title="קונים" icon={<User className="text-orange-500" />} count={counts.buyers} />
        <StatCard title="משתמשים כלליים" icon={<Users className="text-purple-500" />} count={counts.users} />
      </div>
    </div>
  );
}

function StatCard({ title, icon, count }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
      <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-bold text-gray-800">{count}</div>
      </div>
    </div>
  );
}
