import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Eye, FileText, Mail, Phone, Building } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">מדיניות פרטיות</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          מדיניות הפרטיות שלנו מתארת כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            הגנה על פרטיותך
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="prose prose-lg max-w-none">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">1. איסוף מידע</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו אוספים מידע אישי כגון:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>שם מלא ופרטי קשר</li>
                <li>כתובת דואר אלקטרוני</li>
                <li>מספר טלפון</li>
                <li>פרטי עסק (לספקים)</li>
                <li>מידע על רכישות ופעילות באתר</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">2. שימוש במידע</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו משתמשים במידע שנאסף למטרות הבאות:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>התאמת השירות לצרכים שלך</li>
                <li>שיפור חווית המשתמש</li>
                <li>תקשורת בנוגע לשירותים שלנו</li>
                <li>אבטחה ומניעת הונאות</li>
                <li>שיפור השירותים שלנו</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">3. אבטחת מידע</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלך:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>הצפנת SSL לכל התקשורת</li>
                <li>אחסון מאובטח של סיסמאות</li>
                <li>מערכות אבטחה מתקדמות</li>
                <li>גיבויים סדירים</li>
                <li>הגנה מפני התקפות סייבר</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">4. שיתוף מידע</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו לא משתפים את המידע האישי שלך עם צדדים שלישיים, למעט:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>כאשר נדרש על פי חוק</li>
                <li>עם ספקי שירותים נבחרים (כגון מערכות תשלום)</li>
                <li>עם שותפים עסקיים מאושרים</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">5. זכויות המשתמש</h2>
              <p className="text-gray-700 leading-relaxed">
                יש לך זכות ל:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>גישה למידע האישי שלך</li>
                <li>תיקון מידע שגוי</li>
                <li>מחיקת המידע שלך</li>
                <li>התנגדות לעיבוד המידע</li>
                <li>ייצוא המידע שלך</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">6. עוגיות</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו משתמשים בעוגיות לשיפור חווית המשתמש. אתה יכול להגדיר את הדפדפן שלך לדחות עוגיות.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">7. שינויים במדיניות</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו שומרים על הזכות לעדכן את מדיניות הפרטיות. שינויים משמעותיים יפורסמו באתר.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">8. יצירת קשר</h2>
              <p className="text-gray-700 leading-relaxed">
                לשאלות בנוגע למדיניות הפרטיות, ניתן ליצור קשר:
              </p>
              <ul className="list-none space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>privacy@wholesale-hub.co.il</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>03-1234567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span>רחוב העסקים 123, תל אביב</span>
                </li>
              </ul>
            </section>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-6 w-6 text-blue-600" />
            אבטחת מידע
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">הצפנת SSL</h3>
                <p className="text-gray-600">כל התקשורת באתר מוצפנת ומאובטחת</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">שקיפות</h3>
                <p className="text-gray-600">אנו מפרסמים מידע על אופן השימוש במידע</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">תיעוד</h3>
                <p className="text-gray-600">כל פעולות עיבוד המידע מתועדות</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 