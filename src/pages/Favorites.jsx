import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";

export default function Favorites() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4"
            onClick={() => navigate(-1)}
            aria-label="חזרה לעמוד הקודם"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">המוצרים המועדפים שלי</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <Heart className="h-16 w-16 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">תכונת המועדפים אינה זמינה כרגע</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          אנו עובדים על שיפור תכונה זו. בקרוב תוכלו לשמור את המוצרים המועדפים עליכם ולגשת אליהם בקלות.
        </p>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate(createPageUrl("Search"))}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          גלה מוצרים עכשיו
        </Button>
      </div>
    </div>
  );
} 