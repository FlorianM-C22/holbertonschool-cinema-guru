import "./i18n"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from './App.tsx'
import { AuthProvider } from './data/auth/context'
import { ListsProvider } from './data/lists/context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ListsProvider>
        <App />
      </ListsProvider>
    </AuthProvider>
  </StrictMode>,
)
