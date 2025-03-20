// רשימת הקטגוריות הקבועה באתר עם תמונות
export const categories = [
  { 
    value: "electronics", 
    label: "אלקטרוניקה",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070",
    icon: "Laptop"
  },
  { 
    value: "clothing", 
    label: "ביגוד",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000",
    icon: "ShoppingBag"
  },
  { 
    value: "home_goods", 
    label: "מוצרי בית",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070",
    icon: "Home"
  },
  { 
    value: "food_beverage", 
    label: "מזון ומשקאות",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070",
    icon: "Coffee"
  },
  { 
    value: "health_beauty", 
    label: "בריאות ויופי",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=2035",
    icon: "HeartPulse"
  },
  { 
    value: "industrial", 
    label: "ציוד תעשייתי",
    image: "https://images.unsplash.com/photo-1531758854681-1a4966394b13?q=80&w=2070",
    icon: "Wrench"
  },
  { 
    value: "automotive", 
    label: "רכב",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070",
    icon: "Car"
  },
  { 
    value: "sports", 
    label: "ספורט",
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=2070",
    icon: "Dumbbell"
  },
  { 
    value: "toys", 
    label: "צעצועים",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=2070",
    icon: "Gamepad2"
  }
];

// מיפוי קטגוריות לתוויות בעברית
const categoryLabels = {
  electronics: "אלקטרוניקה",
  clothing: "ביגוד",
  home_goods: "מוצרי בית",
  food_beverage: "מזון ומשקאות",
  health_beauty: "בריאות ויופי",
  industrial: "ציוד תעשייתי",
  automotive: "רכב",
  sports: "ספורט",
  toys: "צעצועים"
};

// מיפוי קטגוריות לתמונות
const categoryImages = {
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070",
  clothing: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000",
  home_goods: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070",
  food_beverage: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070",
  health_beauty: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=2035",
  industrial: "https://images.unsplash.com/photo-1531758854681-1a4966394b13?q=80&w=2070",
  automotive: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070",
  sports: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=2070",
  toys: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=2070"
};

// פונקציה לקבלת התווית בעברית של הקטגוריה לפי הערך באנגלית
export const getCategoryLabel = (categoryValue) => {
  if (!categoryValue) return "כללי";
  return categoryLabels[categoryValue] || categoryValue;
};

// פונקציה לקבלת התמונה של הקטגוריה לפי הערך באנגלית
export const getCategoryImage = (categoryValue) => {
  if (!categoryValue) return "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070"; // תמונת ברירת מחדל
  return categoryImages[categoryValue] || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070";
};