import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "sonner"
import { AppWrapper } from '@/components/PageMeta'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/api/queryClient'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { localStoragePersister } from '@/api/queryClient'
import { useState, useEffect } from 'react'

function App() {
  const [isReady, setIsReady] = useState(false);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
      onSuccess={() => {
        setIsReady(true);
      }}
    >
      {isReady ? (
        <AppWrapper>
          <Pages />
          <Toaster 
            position="top-center"
            expand
            richColors
            closeButton
          />
        </AppWrapper>
      ) : (
        <div className="h-screen flex items-center justify-center">טוען...</div>
      )}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </PersistQueryClientProvider>
  )
}

export default App 