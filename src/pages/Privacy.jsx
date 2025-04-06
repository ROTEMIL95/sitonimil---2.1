import React from "react";
import { Mail, Phone, Building } from "lucide-react";

export default function PrivacyPage() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white shadow-md rounded-xl p-6 sm:p-10">
        <h1 className="text-3xl font-bold mb-6 text-black text-center sm:text-right border-b-2 border-gray-300 pb-4">
          מדיניות פרטיות
        </h1>

        <p className="text-gray-700 mb-4 text-lg">
          מדיניות הפרטיות שלנו מתארת כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך באתר Sitonimil.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">1. איסוף מידע</h2>
            <p className="text-gray-700 mb-2">אנו אוספים מידע אישי כגון:</p>
            <ul className="list-disc pr-5 text-gray-700 space-y-1">
              <li>שם מלא ופרטי קשר</li>
              <li>כתובת דואר אלקטרוני</li>
              <li>מספר טלפון</li>
              <li>פרטי עסק (לספקים)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">2. שימוש במידע</h2>
            <p className="text-gray-700 mb-2">אנו משתמשים במידע שנאסף למטרות הבאות:</p>
            <ul className="list-disc pr-5 text-gray-700 space-y-1">
              <li>התאמת השירות לצרכים שלך</li>
              <li>שיפור חווית המשתמש באתר</li>
              <li>תקשורת בנוגע לתוכן ושירותי הפלטפורמה</li>
              <li>שיפור הפעילות והתוכן באתר</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">3. אבטחת מידע</h2>
            <p className="text-gray-700 mb-2">אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלך:</p>
            <ul className="list-disc pr-5 text-gray-700 space-y-1">
              <li>הצפנת SSL לכל התקשורת</li>
              <li>אחסון מאובטח של נתונים</li>
              <li>מערכות הגנה על שרתים ומידע</li>
              <li>גיבויים סדירים</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">4. שיתוף מידע</h2>
            <p className="text-gray-700 mb-2">אנו לא משתפים את המידע האישי שלך עם צדדים שלישיים, למעט כאשר נדרש על פי חוק או לצורך תפעול תקין של הפלטפורמה (למשל שירותי דיוור).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">5. זכויות המשתמש</h2>
            <p className="text-gray-700 mb-2">יש לך זכות ל:</p>
            <ul className="list-disc pr-5 text-gray-700 space-y-1">
              <li>גישה למידע האישי שלך</li>
              <li>תיקון מידע שגוי</li>
              <li>מחיקת המידע שלך</li>
              <li>התנגדות לעיבוד המידע</li>
              <li>בקשת הסרה ממאגרי המידע שלנו</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">6. עוגיות</h2>
            <p className="text-gray-700">
              אנו משתמשים בעוגיות לשיפור חווית המשתמש, התאמה אישית וניתוח פעילות. באפשרותך להגדיר את הדפדפן לחסום עוגיות, אך חלק מהפונקציות באתר עלולות שלא לפעול כראוי.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">7. שינויים במדיניות</h2>
            <p className="text-gray-700">
              אנו שומרים לעצמנו את הזכות לעדכן את מדיניות הפרטיות בכל עת. שינויים משמעותיים יפורסמו בעמוד זה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">8. יצירת קשר</h2>
            <p className="text-gray-700 mb-2">לשאלות או בירורים בנושא פרטיות ניתן לפנות אלינו:</p>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-black" />
                <span>sitonim@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-black" />
                <span>0523976448</span>
              </li>
              <li className="flex items-center gap-2">
                <Building className="h-4 w-4 text-black" />
                <span>רחוב רוטשילד 22, תל אביב</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">9. תאריך עדכון אחרון</h2>
            <p className="text-gray-700">{formattedDate}</p>
          </section>
        </div>
      </div>
    </section>
  );
}