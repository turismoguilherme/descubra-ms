
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import DestinationEditor from "@/components/admin/DestinationEditor";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const DestinationEditorPage = () => {
  const { userRole, isAuthenticated, loading } = useSecureAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin-login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (userRole !== "admin" && userRole !== "tech" && userRole !== "municipal_manager") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h1>
            <p className="text-gray-600">Você não tem permissão para editar destinos.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <DestinationEditor />
      </main>
      <Footer />
    </div>
  );
};

export default DestinationEditorPage;
