
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Colaborador = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="flex justify-center py-6 bg-white">
          <img 
            src="/lovable-uploads/f9e61cb5-62ef-4f80-8b18-7fef17e3f64b.png" 
            alt="Descubra Mato Grosso do Sul" 
            className="h-[60px] w-auto" 
          />
        </div>

        <div className="ms-container py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-8">
              <CheckCircle size={80} className="text-ms-primary-blue" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-semibold text-ms-primary-blue mb-6">
              Obrigado por se tornar um colaborador!
            </h1>
            
            <p className="text-lg text-gray-700 mb-8">
              Sua sugestão foi recebida e será avaliada pela nossa equipe. Valorizamos muito sua contribuição para promover o turismo no Mato Grosso do Sul.
            </p>
            
            <p className="text-gray-600 mb-10">
              Você também pode continuar explorando o aplicativo para descobrir mais destinos e compartilhar suas experiências.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
                onClick={() => navigate("/roteiros")}
              >
                Explorar roteiros
              </Button>
              
              <Button 
                variant="outline" 
                className="border-ms-primary-blue text-ms-primary-blue hover:bg-ms-primary-blue/10"
                onClick={() => navigate("/passaporte")}
              >
                Acessar meu passaporte digital
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Colaborador;
