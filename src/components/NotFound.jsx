import { Link } from "react-router-dom";
import PageMeta from "./PageMeta";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    // Add animation classes after component mounts
    const timer = setTimeout(() => {
      document.getElementById("notfound-container").classList.add("opacity-100");
      document.getElementById("notfound-content").classList.add("translate-y-0", "opacity-100");
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <PageMeta
        title="404 - דף לא נמצא"
        description="הדף שאתה מחפש לא נמצא"
      />
      <div 
        id="notfound-container"
        className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 opacity-0 transition-opacity duration-500"
      >
        <div 
          id="notfound-content"
          className="mx-auto w-full max-w-[342px] text-center sm:max-w-[572px] -translate-y-10 opacity-0 transition-all duration-700 ease-out"
        >
          <h1 className="mb-6 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            <span className="text-indigo-600 dark:text-indigo-400">404</span> - הדף שאתה מחפש לא נמצא
          </h1>

         

          <p className="mt-8 mb-8 text-base text-gray-700 dark:text-gray-300 sm:text-lg leading-relaxed">
            לא ניתן למצוא את הדף שאתה מחפש!<br />
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              ייתכן שהקישור שהקשת שגוי או שהדף הוזז או נמחק.
            </span>
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-indigo-600 bg-indigo-600 px-6 py-4 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 hover:border-indigo-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 dark:bg-indigo-600 dark:border-indigo-500 dark:text-white dark:hover:bg-indigo-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            חזרה לדף הבית
          </Link>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400 transition-opacity duration-700 opacity-80">
          &copy; {new Date().getFullYear()} - sitonimil.co.il
        </p>
      </div>
    </>
  );
}
