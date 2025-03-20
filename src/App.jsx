import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "sonner"

function App() {
  return (
    <>
      <Pages />
      <Toaster 
        position="top-center"
        expand
        richColors
        closeButton
      />
    </>
  )
}

export default App 