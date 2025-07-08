
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import DashboardByRole from "@/components/management/DashboardByRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RoleDashboard = () => {
  const { userRole, userRegion, isAuthenticated, loading } = useSecureAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/admin-login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center text-ms-primary-blue">
            <div className="animate-spin mb-3 mx-auto rounded-full border-4 border-blue-200 border-t-ms-primary-blue h-12 w-12"></div>
            <div className="font-semibold">Carregando dashboard...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="ms-container py-8">
          <DashboardByRole userRole={userRole} userRegion={userRegion} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RoleDashboard;
