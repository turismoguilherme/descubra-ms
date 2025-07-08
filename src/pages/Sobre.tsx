
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Info, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-ms-terra-brown to-ms-cerrado-orange py-16">
          <div className="ms-container text-center">
            <Info size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-6">Sobre o Projeto</h1>
            <p className="text-white/90 text-xl max-w-2xl mx-auto">
              Conheça mais sobre o aplicativo "Isto é Mato Grosso do Sul" e sua missão
            </p>
          </div>
        </div>

        <div className="ms-container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 mb-10">
              <h2 className="text-2xl font-bold text-ms-pantanal-green mb-4">Nossa Missão</h2>
              <p className="text-gray-600 mb-6">
                O aplicativo "Isto é Mato Grosso do Sul" nasceu com o objetivo de ser uma 
                ferramenta digital completa para turistas que visitam o estado, ajudando-os 
                a explorar destinos, conhecer a cultura local e planejar suas viagens de 
                forma personalizada e acessível.
              </p>
              <p className="text-gray-600">
                Desenvolvido pela Fundtur-MS, este projeto visa promover o turismo sustentável 
                e inclusivo, valorizando a identidade sul-mato-grossense e proporcionando uma 
                experiência interativa para os visitantes através de tecnologias inovadoras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-ms-pantanal-green mb-4">Para Turistas</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-ms-cerrado-orange font-bold mr-2">•</span>
                    <span>Experiência interativa e personalizada</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-ms-cerrado-orange font-bold mr-2">•</span>
                    <span>Roteiros adaptados aos seus interesses</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-ms-cerrado-orange font-bold mr-2">•</span>
                    <span>Assistência virtual através da Delinha</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-ms-cerrado-orange font-bold mr-2">•</span>
                    <span>Informações culturais e históricas</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-ms-pantanal-green mb-4">Para CATs</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-ms-cerrado-orange font-bold mr-2">•</span>
                    <span>Suporte ao atendimento através de IA</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-ms-cerrado-orange font-bold mr-2">•</span>
                    <span>Gestão de horários e atendimentos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-ms-cerrado-orange font-bold mr-2">•</span>
                    <span>Ferramenta de auxílio para informações turísticas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-ms-cerrado-orange font-bold mr-2">•</span>
                    <span>Integração com sistema de gestão</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 mb-10">
              <h2 className="text-2xl font-bold text-ms-pantanal-green mb-4">Acessibilidade</h2>
              <p className="text-gray-600 mb-4">
                O aplicativo foi desenvolvido com foco na acessibilidade, garantindo que todos 
                possam desfrutar dos recursos oferecidos:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-ms-guavira-purple font-bold mr-2">•</span>
                  <span>Opções de áudio para pessoas com deficiência visual</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ms-guavira-purple font-bold mr-2">•</span>
                  <span>Recursos de tradução para múltiplos idiomas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ms-guavira-purple font-bold mr-2">•</span>
                  <span>Interface intuitiva e de fácil navegação</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ms-guavira-purple font-bold mr-2">•</span>
                  <span>Conteúdo adaptado para diferentes necessidades</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-ms-pantanal-green mb-4">Contato</h2>
              <p className="text-gray-600 mb-6">
                Para mais informações, sugestões ou parcerias, entre em contato conosco:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-600 mb-8">
                <div>
                  <h4 className="font-semibold mb-2">Fundtur-MS</h4>
                  <p>Av. Afonso Pena, 7000<br />Campo Grande, MS</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contato</h4>
                  <p>contato@istoems.com.br<br />Tel: (67) 3318-7600</p>
                </div>
              </div>
              
              {/* Área de acesso para gestores e atendentes */}
              <div className="mt-8 border-t pt-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <LogIn size={18} className="mr-2 text-ms-primary-blue" />
                  Acesso para Gestores e Atendentes
                </h4>
                <p className="text-gray-600 mb-4">
                  Se você é gestor regional ou atendente de CAT, faça login em sua conta para acessar
                  o painel de gestão e sistema dos CATs:
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    asChild 
                    className="bg-[#003087] hover:bg-[#003087]/90"
                  >
                    <Link to="/admin-login">
                      <LogIn size={16} className="mr-2" />
                      Acessar Sistema
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sobre;
