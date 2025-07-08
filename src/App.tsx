
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { TourismDataProvider } from "@/context/TourismDataContext";

const Index = lazy(() => import("@/pages/Index"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const Register = lazy(() => import("@/pages/Register"));
const Login = lazy(() => import("@/pages/Login"));
const Management = lazy(() => import("@/pages/Management"));
const TechnicalAdmin = lazy(() => import("@/pages/TechnicalAdmin"));
const DigitalPassport = lazy(() => import("@/pages/DigitalPassport"));
const Delinha = lazy(() => import("@/pages/Delinha"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const CATAttendant = lazy(() => import("@/pages/CATAttendant"));
const MunicipalAdmin = lazy(() => import("@/pages/MunicipalAdmin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TourismDataProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  <Route path="/" element={<Suspense fallback={<div>Carregando...</div>}><Index /></Suspense>} />
                  <Route path="/welcome" element={<Suspense fallback={<div>Carregando...</div>}><Welcome /></Suspense>} />
                  <Route path="/register" element={<Suspense fallback={<div>Carregando...</div>}><Register /></Suspense>} />
                  <Route path="/login" element={<Suspense fallback={<div>Carregando...</div>}><Login /></Suspense>} />
                  <Route path="/management" element={<Suspense fallback={<div>Carregando...</div>}><Management /></Suspense>} />
                  <Route path="/technical-admin" element={<Suspense fallback={<div>Carregando...</div>}><TechnicalAdmin /></Suspense>} />
                  <Route path="/passaporte" element={<Suspense fallback={<div>Carregando...</div>}><DigitalPassport /></Suspense>} />
                  <Route path="/delinha" element={<Suspense fallback={<div>Carregando...</div>}><Delinha /></Suspense>} />
                  <Route path="/admin-login" element={<Suspense fallback={<div>Carregando...</div>}><AdminLogin /></Suspense>} />
                  <Route path="/cat-attendant" element={<Suspense fallback={<div>Carregando...</div>}><CATAttendant /></Suspense>} />
                  <Route path="/municipal-admin" element={<Suspense fallback={<div>Carregando...</div>}><MunicipalAdmin /></Suspense>} />
                  <Route path="*" element={<Suspense fallback={<div>Carregando...</div>}><NotFound /></Suspense>} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </TourismDataProvider>
    </QueryClientProvider>
  );
}

export default App;
