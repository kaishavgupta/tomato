import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppProvider.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
   <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
      <AppProvider>
        
      <App />
      </AppProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)
