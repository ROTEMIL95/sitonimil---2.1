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
    image: "/images/electronics.webp",
    icon: "Laptop"
  },
  { 
    value: "clothing", 
    label: "ביגוד",
    image: "/images/clothing.webp",
    icon: "ShoppingBag"
  },
  { 
    value: "home_goods", 
    label: "מוצרי בית",
    image: "/images/home_goods.webp",
    icon: "Home"
  },
  { 
    value: "food_beverage", 
    label: "מזון ומשקאות",
    image: "/images/food_beverage.webp",
    icon: "Coffee"
  },
  { 
    value: "health_beauty", 
    label: "בריאות ויופי",
    image: "/images/health_beauty.webp",
    icon: "HeartPulse"
  },
  { 
    value: "industrial", 
    label: "ציוד תעשייתי",
    image: "/images/industrial.webp",
    icon: "Wrench"
  },
  { 
    value: "automotive", 
    label: "רכב",
    image: "/images/automotive.webp",
    icon: "Car"
  },
  { 
    value: "sports", 
    label: "ספורט",
    image: "/images/sports.webp",
    icon: "Dumbbell"
  },
  { 
    value: "toys", 
    label: "צעצועים",
    image: "/images/toys.webp",
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
    scrollContainerRef.current.scrollLeft = scrollLeft + distance * 1.2; // Increased sensitivity for mobile
    
    // Check scroll buttons during drag
    checkScrollButtons();
    e.preventDefault(); // Prevent page scrolling while dragging categories
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || !scrollContainerRef.current) {
      setIsDragging(false);
      return;
    }
    
    // Add momentum scrolling effect
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const distance = startX - endX;
    const velocity = Math.abs(distance) / 100; // Calculate velocity
    
    if (Math.abs(distance) > 20) { // Only snap if there's significant movement
      // Calculate the index to snap to
      const itemsInView = Math.floor(scrollContainerRef.current.clientWidth / itemWidth);
      const currentIndex = Math.round(scrollContainerRef.current.scrollLeft / itemWidth);
      let targetIndex;
      
      if (distance > 0) { // Swiping left (moving right)
        targetIndex = currentIndex + 1;
      } else { // Swiping right (moving left)
        targetIndex = Math.max(0, currentIndex - 1);
      }
      
      // Apply extra momentum based on velocity
      if (velocity > 0.5) {
        targetIndex += distance > 0 ? 1 : -1;
      }
      
      // Ensure target is within bounds
      targetIndex = Math.max(0, Math.min(targetIndex, categories.length - itemsInView));
      
      // Scroll to the target item
      scrollToPosition(targetIndex * itemWidth);
    }
    
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

  const handleMouseUp = (e) => {
    if (!isDragging || !scrollContainerRef.current) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab';
      }
      return;
    }
    
    // Add snapping behavior for desktop too
    const endX = e.clientX;
    const distance = startX - endX;
    
    if (Math.abs(distance) > 50) { // Only snap if there's significant movement
      // Calculate the index to snap to
      const itemsInView = Math.floor(scrollContainerRef.current.clientWidth / itemWidth);
      const currentIndex = Math.round(scrollContainerRef.current.scrollLeft / itemWidth);
      let targetIndex;
      
      if (distance > 0) { // Swiping left (moving right)
        targetIndex = currentIndex + 1;
      } else { // Swiping right (moving left)
        targetIndex = Math.max(0, currentIndex - 1);
      }
      
      // Ensure target is within bounds
      targetIndex = Math.max(0, Math.min(targetIndex, categories.length - itemsInView));
      
      // Scroll to the target item
      scrollToPosition(targetIndex * itemWidth);
    }
    
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = 'grab';
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
          {/* Navigation buttons - only visible on desktop/tablet */}
          {!isMobile && (
            <>
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
            </>
          )}

          {/* Scroll container with padding to accommodate the buttons on desktop, less padding on mobile */}
          <div className={`mx-auto overflow-hidden ${isMobile ? 'px-2' : 'px-6 sm:px-8 md:px-10 lg:px-12'}`}>
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
              {/* Center items only on larger screens, align start on mobile for better swiping */}
              <div className={`flex ${isMobile ? 'justify-start pl-2' : 'mx-auto justify-center sm:justify-start'}`}>
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
                      className={`transform transition-all duration-300 flex-shrink-0 snap-center ${isMobile ? 'px-2' : 'px-1 sm:px-1.5 md:px-2'}`}
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
                            <h6 className="font-normal text-[5px] xs:text-[6px] sm:text-xs md:text-sm text-white drop-shadow-md px-1 leading-tight tracking-wide" style={{ fontFamily: 'Arial, sans-serif', wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
                              {category.label}
                            </h6>
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
