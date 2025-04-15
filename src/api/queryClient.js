import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

// הגדרות המטמון של React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // שימור נתונים במטמון למשך 10 דקות (הוגדל מ-5 דקות)
      staleTime: 600000, // 10 דקות במילישניות
      // הנתונים יישארו במטמון למשך שעה גם אם הם לא בשימוש (הוגדל מ-30 דקות)
      gcTime: 3600000, // 60 דקות במילישניות
      // פעמיים ניסיון מחדש אם בקשה נכשלת
      retry: 2,
      // ביטול שליפת נתונים מחדש כאשר חוזרים למסך
      refetchOnWindowFocus: false,
      // ביטול שליפת נתונים בעת טעינת רכיב - שימוש במטמון אם קיים
      refetchOnMount: false,
      // ביטול שליפת נתונים כאשר הרשת מתחברת מחדש
      refetchOnReconnect: false,
      // שימוש בנתונים הקיימים במטמון בזמן שטוענים מחדש
      keepPreviousData: true,
    },
  },
})

// הגדרת מטמון קבוע ב-localStorage
export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'SITONIM_QUERY_CACHE',
  // התעלם משגיאות בעת שימוש ב-localStorage (למשל אם הזיכרון מלא)
  throttleTime: 1000,
})

// הפעלת שמירת המטמון
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  // שמור מטמון למשך 24 שעות
  maxAge: 1000 * 60 * 60 * 24,
  // פילטור - אילו שאילתות לשמור (שמור רק שאילתות מסוימות)
  dehydrateOptions: {
    shouldDehydrateQuery: query => {
      // שמור רק שאילתות שלא נכשלו ושיש להן נתונים
      return !query.state.error && 
             query.state.status !== 'loading' && 
             query.state.fetchStatus !== 'fetching' &&
             !!query.state.data;
    }
  }
})

/**
 * פונקציית עזר לטעינה מקדימה של נתונים
 * @param {string[]} queryKey - מפתח השאילתה
 * @param {Function} queryFn - פונקציית הטעינה
 * @param {Object} options - אפשרויות נוספות
 */
export const prefetchData = async (queryKey, queryFn, options = {}) => {
  // בדוק אם הנתונים כבר קיימים במטמון ועדיין לא מיושנים
  const existingQuery = queryClient.getQueryState(queryKey)
  
  // אם הנתונים לא קיימים או מיושנים, טען אותם
  if (!existingQuery || existingQuery.status === 'error' || existingQuery.dataUpdateCount === 0) {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...options
    })
  }
} 