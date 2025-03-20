import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Building2, TrendingUp, ShoppingBag, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    loading: true,
    error: null,
    user: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // בדיקה שהמשתמש הוא אדמין
        const currentUser = await User.me();
        if (currentUser.role !== 'admin') {
          setStats(prev => ({ ...prev, error: 'גישה לא מורשית', loading: false }));
          return;
        }

        // טעינת כל הנתונים
        const users = await User.list();
        const products = await Product.list();

        setStats({
          totalUsers: users.length,
          totalSuppliers: users.filter(user => user.business_type === 'supplier').length,
          totalProducts: products.length,
          loading: false,
          error: null,
          user: currentUser
        });

      } catch (error) {
        console.error('Error loading admin stats:', error);
        setStats(prev => ({ 
          ...prev, 
          error: 'אירעה שגיאה בטעינת הנתונים', 
          loading: false 
        }));
      }
    };

    loadData();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">שגיאה</h2>
          <p className="text-gray-600">{stats.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">לוח בקרה ניהולי</h1>
            <p className="text-gray-500 mt-1">ברוך הבא, {stats.user?.full_name}</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
            אדמין
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* סה"כ משתמשים */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">סה"כ משתמשים</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-xs text-gray-500 mr-2">משתמשים רשומים</div>
              </div>
            </CardContent>
          </Card>

          {/* סה"כ ספקים */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">סה"כ ספקים</CardTitle>
              <Building2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
                <div className="text-xs text-gray-500 mr-2">ספקים פעילים</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {((stats.totalSuppliers / stats.totalUsers) * 100).toFixed(1)}% מכלל המשתמשים
              </div>
            </CardContent>
          </Card>

          {/* סה"כ מוצרים */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">סה"כ מוצרים</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <div className="text-xs text-gray-500 mr-2">מוצרים זמינים</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ממוצע של {(stats.totalProducts / stats.totalSuppliers).toFixed(1)} מוצרים לספק
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>סטטיסטיקה נוספת</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span>יחס ספקים/קונים</span>
                  </div>
                  <div className="font-medium">
                    1:{Math.round((stats.totalUsers - stats.totalSuppliers) / stats.totalSuppliers)}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-gray-500" />
                    <span>ממוצע מוצרים לספק</span>
                  </div>
                  <div className="font-medium">
                    {(stats.totalProducts / stats.totalSuppliers).toFixed(1)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}