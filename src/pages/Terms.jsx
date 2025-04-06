import React from "react";
import { Mail } from "lucide-react";

export default function TermsPage() {
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
          תנאי שימוש לאתר Sitonimil
        </h1>

        <div className="space-y-8 text-gray-700 text-lg">
          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">1. קבלת התנאים</h2>
            <p>
              השימוש באתר מכל סוג שהוא מהווה אישור מצדך כי קראת והסכמת לתנאים אלו במלואם.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">2. מטרת השירות</h2>
            <p>
              האתר משמש כפלטפורמה להצגת מוצרים ויצירת קשר בין סוחרים לספקים. האתר אינו צד בעסקאות ואינו נושא באחריות לתוכן, למחירים או למוצרים שמוצגים בפלטפורמה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">3. הרשמה וחשבונות</h2>
            <ul className="list-disc pr-5 space-y-1">
              <li>השירות מיועד לספקים וסוחרים עסקיים בלבד.</li>
              <li>יש להירשם עם פרטים מדויקים ועדכניים בלבד.</li>
              <li>הנהלת האתר רשאית להסיר, לחסום או להשעות חשבון לפי שיקול דעתה.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">4. אחריות המשתמש</h2>
            <ul className="list-disc pr-5 space-y-1">
              <li>כל תוכן שמועלה לאתר באחריות המשתמש בלבד.</li>
              <li>אין להעלות תכנים פוגעניים, שקריים או כאלה המפרים זכויות יוצרים.</li>
              <li>אין להשתמש באתר לצרכים אסורים או מסחריים בלתי חוקיים.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">5. פרטיות ואבטחת מידע</h2>
            <p>
              המידע האישי נשמר בשרתי ענן מאובטחים. אנו פועלים לפי חוק הגנת הפרטיות בישראל ותקנות ה־GDPR, ולא נשתף את פרטיך עם צדדים שלישיים ללא הסכמה, אלא אם נדרש לפי דין. לפרטים נוספים ראה עמוד מדיניות פרטיות.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">6. שירותים חיצוניים</h2>
            <p>
              האתר עושה שימוש בשירותים חיצוניים כמו אחסון, אימות, ניתוח תנועה ותצוגה. כל שימוש כזה כפוף לתנאי השירות של אותם ספקים.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">7. חשבון פרימיום ופרסום</h2>
            <p>
              האתר עשוי להציע שירותים נוספים כגון חשבונות פרימיום, חשבונות מאומתים, ותוכן ממומן. שירותים אלה יסומנו ויופעלו בהתאם לתנאים נפרדים בעתיד.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">8. הגבלת אחריות</h2>
            <p>
              Sitonimil מספק את השירות "As-Is" ואינו מתחייב לזמינות, אמינות או תוצאה מסוימת. השימוש באתר נעשה באחריות המשתמש בלבד.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">9. קניין רוחני</h2>
            <p>
              כל התכנים באתר – כולל עיצוב, טקסטים, לוגו וקוד – הם רכושו של Sitonimil ואין להעתיקם או להשתמש בהם ללא אישור כתוב מראש.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">10. שינויים בתנאים</h2>
            <p>
              הנהלת האתר שומרת לעצמה את הזכות לעדכן תנאי שימוש אלה בכל עת. השינויים יפורסמו בעמוד זה וייכנסו לתוקף עם המשך השימוש באתר.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">11. יצירת קשר</h2>
            <p className="mb-2">
              לשאלות, פניות או דיווחים ניתן לפנות אלינו:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-black" />
                <span>sitonim@gmail.com</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2 border-b border-gray-200 pb-1">12. תאריך עדכון אחרון</h2>
            <p>{formattedDate}</p>
          </section>
        </div>
      </div>
    </section>
  );
}
