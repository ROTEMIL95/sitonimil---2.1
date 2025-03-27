import React from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Shield,
  CreditCard,
  Truck,
  Package,
  User,
  Building,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">עזרה ותמיכה</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          כאן תוכלו למצוא תשובות לשאלות נפוצות, מידע על השירותים שלנו ודרכים ליצירת קשר
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              צור קשר
            </CardTitle>
            <CardDescription>דרכים ליצירת קשר עם צוות התמיכה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>support@wholesale-hub.co.il</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>03-1234567</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>א'-ה' 9:00-17:00</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              אבטחה
            </CardTitle>
            <CardDescription>מידע על אבטחת החשבון והפרטיות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>הצפנת SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>אימות דו-שלבי</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>מדיניות פרטיות</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              תמיכה בזמן אמת
            </CardTitle>
            <CardDescription>קבל עזרה מיידית מצוות התמיכה</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <MessageSquare className="ml-2 h-4 w-4" />
              התחל צ'אט
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">שאלות נפוצות</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-right">
              איך אני יכול להתחיל להשתמש בפלטפורמה?
            </AccordionTrigger>
            <AccordionContent className="text-right">
              <p className="text-gray-600">
                כדי להתחיל, יש ליצור חשבון חדש דרך דף ההרשמה. לאחר ההרשמה, תוכלו להזין את פרטי העסק שלכם ולהתחיל להשתמש בשירותים השונים של הפלטפורמה.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-right">
              איך אני יכול לשנות את סוג העסק שלי?
            </AccordionTrigger>
            <AccordionContent className="text-right">
              <p className="text-gray-600">
                ניתן לשנות את סוג העסק דרך דף הפרופיל. לחצו על "ערוך פרופיל" ובחרו את סוג העסק הרצוי מתוך הרשימה הנפתחת. שימו לב ששינוי סוג העסק עשוי להשפיע על השירותים הזמינים לכם.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-right">
              איך אני יכול להעלות מוצרים למכירה?
            </AccordionTrigger>
            <AccordionContent className="text-right">
              <p className="text-gray-600">
                כדי להעלות מוצרים, יש להיכנס לדף "המוצרים שלי" ולחצות על "הוסף מוצר חדש". מלאו את כל הפרטים הנדרשים, כולל תמונות, תיאור ומחיר. לאחר העלאת המוצר, הוא יופיע בקטלוג הכללי.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-right">
              איך מתבצע התשלום בפלטפורמה?
            </AccordionTrigger>
            <AccordionContent className="text-right">
              <p className="text-gray-600">
                הפלטפורמה תומכת במגוון אמצעי תשלום, כולל כרטיסי אשראי והעברה בנקאית. התשלום מתבצע בצורה מאובטחת דרך מערכת התשלומים המשולבת. כל העסקאות מוצפנות ומאובטחות.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-right">
              מה המדיניות לגבי החזרות והחלפות?
            </AccordionTrigger>
            <AccordionContent className="text-right">
              <p className="text-gray-600">
                המדיניות לגבי החזרות והחלפות נקבעת על ידי כל ספק בנפרד. בדרך כלל, ניתן להחזיר מוצרים תוך 14 ימים מיום המשלוח, בכפוף לתנאים מסוימים. מומלץ לבדוק את המדיניות הספציפית של הספק לפני ביצוע רכישה.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-right">
              איך אני יכול לדווח על בעיה או להציע שיפור?
            </AccordionTrigger>
            <AccordionContent className="text-right">
              <p className="text-gray-600">
                אתם מוזמנים ליצור קשר עם צוות התמיכה דרך הטופס באתר או דרך המייל support@wholesale-hub.co.il. כל משוב שלכם חשוב לנו ומסייע בשיפור השירות.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              דיווח על בעיה
            </CardTitle>
            <CardDescription>דווח על בעיה או תקלה בפלטפורמה</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <AlertCircle className="ml-2 h-4 w-4" />
              דווח על בעיה
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              שאלות נוספות?
            </CardTitle>
            <CardDescription>צור קשר עם צוות התמיכה</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Mail className="ml-2 h-4 w-4" />
              שלח שאלה
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 