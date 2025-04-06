import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "sonner"
import { AppWrapper } from '@/components/PageMeta'

function App() {
  return (
    <AppWrapper>
      <Pages />
      <Toaster 
        position="top-center"
        expand
        richColors
        closeButton
      />
    </AppWrapper>
  )
}

export default App 