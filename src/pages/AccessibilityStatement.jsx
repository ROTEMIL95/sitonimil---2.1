import React from "react";

export default function AccessibilityStatement() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white shadow-md rounded-xl p-6 sm:p-10">
        <nav className="mb-8 text-sm flex flex-wrap gap-4 text-blue-600 font-medium underline justify-center sm:justify-start">
          <a href="#overview">סקירה כללית</a>
          <a href="#features">מה בוצע</a>
          <a href="#menu">תפריט נגישות</a>
          <a href="#contact">פנייה</a>
          <a href="#date">עדכון</a>
        </nav>

        <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center sm:text-right" id="overview">
          הצהרת נגישות – Sitonimil
        </h1>

        <p className="text-gray-700 mb-4">
          אתר <strong>Sitonimil</strong> רואה חשיבות רבה בהנגשת האתר לכלל האוכלוסייה, ובפרט לאנשים עם מוגבלויות. אנו פועלים מתוך מטרה להעניק חוויית שימוש נגישה, שוויונית, נוחה ומכבדת לכל המשתמשים.
        </p>

        <p className="text-gray-700 mb-4">
          האתר תוכנן ועוצב מראש כדי להתאים גם לאנשים עם מוגבלות, בהתאם להנחיות הנגישות בישראל (תקן WCAG 2.1, רמה AA).
        </p>

        <p className="text-gray-700 mb-4">
          אנו רואים בהנגשת האתר תהליך מתמשך, ופועלים באופן שוטף לשפר ולהתאים את התכנים והשירותים באתר, ככל הניתן ובכפוף לטכנולוגיות הקיימות.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3 text-blue-600" id="features">מה בוצע באתר?</h2>
        <ul className="list-disc pr-5 text-gray-700 space-y-2">
          <li>התאמה מלאה לניווט באמצעות מקלדת</li>
          <li>שימוש בכותרות ותגיות מתאימות למבנה התוכן</li>
          <li>תמיכה בקוראי מסך</li>
          <li>טפסים עם תוויות נגישות</li>
          <li>הגדלת טקסט דרך הדפדפן</li>
          <li>צבעים עם ניגודיות מספקת</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3 text-blue-600" id="menu">תפריט נגישות באתר</h2>
        <p className="text-gray-700 mb-4">
          האתר כולל תפריט נגישות מתקדם המופעל בלחיצה על סמל הנגישות. בתפריט תוכלו למצוא:
        </p>
        <ul className="list-disc pr-5 text-gray-700 space-y-2">
          <li>הגדלת טקסטים</li>
          <li>שינוי ניגודיות</li>
          <li>הדגשת קישורים</li>
          <li>השבת אנימציות</li>
          <li>ועוד מגוון כלים להקלת הגלישה</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3 text-blue-600" id="contact">פנייה בנושא נגישות</h2>
        <p className="text-gray-700 mb-4">
          אם נתקלתם בבעיה כלשהי בנושא נגישות באתר, נשמח לדעת ולטפל בה במהירות. אתם מוזמנים לפנות לרכז הנגישות שלנו:
        </p>
        <ul className="text-gray-700 pr-5 space-y-1">
          <li>👤 שם: רותם אילוז – רכז הנגישות</li>
          <li>📧 דוא"ל: <a href="mailto:sitonimil@gmail.com" className="text-blue-600 underline">sitonimil@gmail.com</a></li>
          <li>📞 טלפון: <a href="tel:0523976448" className="text-blue-600 underline">052-3976-448</a></li>
        </ul>

        <div className="mt-6 text-center sm:text-right">
          <a
            href="mailto:sitonimil@gmail.com?subject=דיווח על בעיית נגישות"
            className="inline-block mt-4 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            דווח על בעיית נגישות
          </a>
        </div>

        <h2 className="text-xl font-semibold mt-10 mb-3 text-blue-600" id="date">תאריך עדכון</h2>
        <p className="text-gray-700">{formattedDate}</p>
      </div>
    </section>
  );
}