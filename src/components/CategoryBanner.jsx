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
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10); // Add some buffer for better UX
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // Add some buffer for better UX
    }
  };

  // Calculate item width for proper scrolling
  const calculateItemWidth = () => {
    if (scrollContainerRef.current && scrollContainerRef.current.children.length > 0) {
      const firstItem = scrollContainerRef.current.children[0];
      const itemWidthWithMargin = firstItem.offsetWidth + 
        parseInt(window.getComputedStyle(firstItem).marginLeft) + 
        parseInt(window.getComputedStyle(firstItem).marginRight);
      setItemWidth(itemWidthWithMargin);
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
    calculateItemWidth();
    
    const updateContainerWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
    
    updateContainerWidth();
    
    // Add a small delay after resizing or loading to check again
    const timeout = setTimeout(() => {
      checkScrollButtons();
      calculateItemWidth();
      updateContainerWidth();
    }, 200);
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
    }
    
    const handleResize = () => {
      checkScrollButtons();
      calculateItemWidth();
      updateContainerWidth();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
      }
      clearTimeout(timeout);
    };
  }, []);

  const scrollToPosition = (position) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: position,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 400); // Check after animation completes
    }
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      const visibleItems = Math.floor(containerWidth / itemWidth);
      const scrollAmount = Math.max(itemWidth * Math.floor(visibleItems / 2), itemWidth);
      
      // Calculate centered position for scrolled items
      const newPosition = Math.max(0, scrollContainerRef.current.scrollLeft - scrollAmount);
      scrollToPosition(newPosition);
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      const visibleItems = Math.floor(containerWidth / itemWidth);
      const scrollAmount = Math.max(itemWidth * Math.floor(visibleItems / 2), itemWidth);
      
      // Calculate centered position for scrolled items
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newPosition = Math.min(maxScroll, scrollContainerRef.current.scrollLeft + scrollAmount);
      scrollToPosition(newPosition);
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
    
    const x = e.touches[0].clientX;
    const distance = startX - x;
    scrollContainerRef.current.scrollLeft = scrollLeft + distance;
    
    // Check scroll buttons during drag
    checkScrollButtons();
    e.preventDefault(); // Prevent page scrolling while dragging categories
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Recheck scroll state after momentum scrolling
    setTimeout(checkScrollButtons, 300);
  };

  // Mouse drag for desktop browsers
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current || e.button !== 0) return; // Only handle left mouse button
    setStartX(e.pageX);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setIsDragging(true);
    scrollContainerRef.current.style.cursor = 'grabbing';
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.pageX;
    const distance = startX - x;
    scrollContainerRef.current.scrollLeft = scrollLeft + distance;
    checkScrollButtons();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
    setTimeout(checkScrollButtons, 150);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab';
      }
    }
  };

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-gray-50">
      <div className="container mx-auto px-2 md:px-4">
        <motion.div 
          className="text-center mb-3 sm:mb-4 md:mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1 md:mb-2">קטגוריות מובילות</h2>
          <p className="text-[10px] sm:text-sm md:text-base text-gray-600">גלו את המוצרים המובילים בתחומים השונים</p>
        </motion.div>

        <div className="relative">
          {/* Navigation buttons - positioned outside the scroll area with fixed width */}
          <div className="flex justify-between mb-2 sm:mb-0">
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 pl-1 sm:pl-2 md:pl-3 lg:pl-4 ${!canScrollLeft ? 'invisible' : ''}`}>
              <Button 
                onClick={handleScrollLeft} 
                variant="secondary"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all transform active:scale-95 border border-gray-200"
                aria-label="scroll left"
              >
                <ChevronLeft className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-700" />
              </Button>
            </div>
            
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 pr-1 sm:pr-2 md:pr-3 lg:pr-4 ${!canScrollRight ? 'invisible' : ''}`}>
              <Button 
                onClick={handleScrollRight} 
                variant="secondary"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all transform active:scale-95 border border-gray-200"
                aria-label="scroll right"
              >
                <ChevronRight className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-700" />
              </Button>
            </div>
          </div>

          {/* Scroll container with padding to accommodate the buttons */}
          <div className="mx-auto overflow-hidden px-6 sm:px-8 md:px-10 lg:px-12">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 pt-2 hide-scrollbar scroll-smooth touch-pan-x snap-x snap-mandatory"
              onScroll={checkScrollButtons}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {/* Center the categories on desktop */}
              <div className="mx-auto flex justify-center sm:justify-start">
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
                      className="transform transition-all duration-300 flex-shrink-0 px-1 sm:px-1.5 md:px-2 snap-start"
                    >
                      <Link 
                        to={createPageUrl("Search") + `?category=${category.value}`}
                        className="block"
                        draggable="false"
                      >
                        <div className="relative overflow-hidden rounded-lg md:rounded-xl h-20 w-20 sm:h-20 sm:w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 bg-gradient-to-br from-white to-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                          <div 
                            className="absolute inset-0 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${category.image})` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
                          </div>
                          
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2 text-center">
                            <div className="bg-white/20 backdrop-blur-sm p-1 sm:p-1.5 md:p-2 rounded-full mb-1 sm:mb-1 md:mb-2 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center">
                              <IconComponent className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <h3 className="font-normal text-[7px] sm:text-xs md:text-sm text-white drop-shadow-md">
                              {category.label}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
