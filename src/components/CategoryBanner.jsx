import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Laptop, 
  ShoppingBag, 
  Home, 
  Coffee, 
  HeartPulse,
  Wrench,
  Car, 
  Dumbbell, 
  Gamepad2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const iconMap = {
  Laptop: Laptop,
  ShoppingBag: ShoppingBag,
  Home: Home,
  Coffee: Coffee,
  HeartPulse: HeartPulse,
  Wrench: Wrench,
  Car: Car,
  Dumbbell: Dumbbell,
  Gamepad2: Gamepad2
};

const categories = [
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function CategoryBanner() {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    }
  };

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? -120 : -200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 120 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e) => {
    if (!scrollContainerRef.current) return;
    
    setStartX(e.touches[0].clientX);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    // Prevent default to disable native scrolling
    e.preventDefault();
    
    const x = e.touches[0].clientX;
    const distance = startX - x;
    scrollContainerRef.current.scrollLeft = scrollLeft + distance;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-6 md:py-8 bg-gray-50">
      <div className="container mx-auto px-2 md:px-4">
        <motion.div 
          className="text-center mb-4 md:mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">קטגוריות מובילות</h2>
          <p className="text-sm md:text-base text-gray-600">גלו את המוצרים המובילים בתחומים השונים</p>
        </motion.div>

        <div className="relative group">
          {!isMobile && canScrollLeft && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
              <Button 
                onClick={handleScrollLeft} 
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl transition-all transform active:scale-95"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
              </Button>
            </div>
          )}
          
          {!isMobile && canScrollRight && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
              <Button 
                onClick={handleScrollRight} 
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl transition-all transform active:scale-95"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
              </Button>
            </div>
          )}

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-4 pt-2 px-2 md:px-8 -mx-2 hide-scrollbar scroll-smooth touch-pan-x snap-x snap-mandatory"
            onScroll={checkScrollButtons}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon] || Home;
              
              return (
                <motion.div
                  key={category.value}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={index}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="transform transition-all duration-300 flex-shrink-0 px-1.5 md:px-2 snap-start"
                >
                  <Link 
                    to={createPageUrl("Search") + `?category=${category.value}`}
                    className="block"
                  >
                    <div className="relative overflow-hidden rounded-lg md:rounded-xl h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 bg-gradient-to-br from-white to-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                      <div 
                        className="absolute inset-0 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${category.image})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
                      </div>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2 text-center">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-full mb-1 md:mb-2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                          <IconComponent className="h-4 w-4 md:h-6 md:w-6 text-white" />
                        </div>
                        <h3 className="font-medium text-xs md:text-sm text-white drop-shadow-md">
                          {category.label}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-4 md:w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-4 md:w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
          )}
        </div>

        {/* Mobile indicators */}
        {isMobile && (
          <div className="flex justify-center mt-2 space-x-1 rtl:space-x-reverse">
            <button 
              onClick={handleScrollLeft} 
              disabled={!canScrollLeft}
              className={`w-8 h-1 rounded-full transition-colors ${canScrollLeft ? 'bg-blue-400' : 'bg-gray-300'}`}
            />
            <button 
              onClick={handleScrollRight} 
              disabled={!canScrollRight}
              className={`w-8 h-1 rounded-full transition-colors ${canScrollRight ? 'bg-blue-400' : 'bg-gray-300'}`}
            />
          </div>
        )}

        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </section>
  );
}
