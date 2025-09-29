import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import RouteEditor from "@/components/admin/RouteEditor"; // Componente principal de edição/criação
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const RouteEditorPage = () => {
  const { userRole, isAuthenticated, loading } = useSecureAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Capturar ID para modo de edição

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin-login');
    }
  }, [loading, isAuthenticated, navigate]);

  // Adicionar verificação de role para acesso
  const hasPermission = userRole === "admin" || userRole === "tech" || userRole === "municipal_manager";

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

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h1>
            <p className="text-gray-600">Você não tem permissão para gerenciar roteiros.</p>
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
        <RouteEditor /> {/* O RouteEditor usará o ID dos params, se existir */}
      </main>
      <Footer />
    </div>
  );
};

export default RouteEditorPage; 