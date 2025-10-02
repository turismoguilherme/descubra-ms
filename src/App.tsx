import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ViaJARAuthProvider } from "@/hooks/auth/ViaJARAuthProvider";
import { OverflowOneAuthProvider } from "@/hooks/auth/OverflowOneAuthProvider";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { TourismDataProvider } from "@/context/TourismDataContext";
import { BrandProvider } from "@/context/BrandContext";
import LoadingFallback from "@/components/ui/loading-fallback";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import SecurityProvider from "@/components/security/SecurityProvider";

// Critical components
import ViaJARSaaS from "@/pages/ViaJARSaaS";
import MSIndex from "@/pages/MSIndex";

const queryClient = new QueryClient();

function App() {
  console.log("🚀 APP: Componente App sendo renderizado");
  
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityHeaders />
      <TourismDataProvider>
        <AuthProvider>
          <ViaJARAuthProvider>
            <OverflowOneAuthProvider>
              <CSRFProvider>
                <SecurityProvider
                  enableSessionTimeout={true}
                  sessionTimeoutMinutes={30}
                  sessionWarningMinutes={5}
                >
                  <TooltipProvider>
                    <Toaster />
                    <BrowserRouter>
                      <BrandProvider>
                        <div className="min-h-screen bg-background font-sans antialiased">
                          <Routes>
                            {/* ViaJAR SaaS Routes */}
                            <Route path="/" element={<ViaJARSaaS />} />
                            <Route path="/viajar" element={<ViaJARSaaS />} />
                            
                            {/* MS Routes */}
                            <Route path="/ms" element={<MSIndex />} />
                            
                            {/* Fallback */}
                            <Route path="*" element={<ViaJARSaaS />} />
                          </Routes>
                        </div>
                      </BrandProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                </SecurityProvider>
              </CSRFProvider>
            </OverflowOneAuthProvider>
          </ViaJARAuthProvider>
        </AuthProvider>
      </TourismDataProvider>
    </QueryClientProvider>
  );
}

export default App;
