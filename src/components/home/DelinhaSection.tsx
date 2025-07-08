
import { Link } from "react-router-dom";
import { Database, FileSpreadsheet, MessageCircle, Star, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const DelinhaSection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-ms-guavira-purple to-ms-rivers-blue">
      <div className="ms-container flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:w-1/2">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="text-white h-6 w-6" />
            <Badge variant="outline" className="text-white border-white/30 bg-white/10">IA Avançada</Badge>
            <Badge className="bg-green-100 text-green-800">Novo</Badge>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-5">Conheça a Delinha</h2>
          <p className="text-white/90 text-lg mb-8">
            Sua guia virtual inspirada na grande cantora 
            sul-mato-grossense. Delinha usa tecnologia avançada para 
            responder dúvidas, fornecer informações oficiais e tornar 
            sua experiência turística mais completa!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-start">
              <Bot className="text-white mr-4 shrink-0 mt-1" size={22} />
              <div>
                <Badge className="bg-green-100 text-green-800 mb-1 font-medium">Atualizado</Badge>
                <h3 className="text-white font-medium text-lg mb-2">IA Avançada</h3>
                <p className="text-white/90 text-base">
                  Integrada com modelos de linguagem avançados para respostas naturais e precisas.
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-start">
              <Database className="text-white mr-4 shrink-0 mt-1" size={22} />
              <div>
                <Badge className="bg-green-100 text-green-800 mb-1 font-medium">Base Rica</Badge>
                <h3 className="text-white font-medium text-lg mb-2">Dados Oficiais</h3>
                <p className="text-white/90 text-base">
                  Conectada com sites oficiais como Fundtur-MS, SETESC e secretarias municipais.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-start">
              <FileSpreadsheet className="text-white mr-4 shrink-0 mt-1" size={22} />
              <div>
                <Badge className="bg-green-100 text-green-800 mb-1 font-medium">Confiável</Badge>
                <h3 className="text-white font-medium text-lg mb-2">Cadastur & Alumia</h3>
                <p className="text-white/90 text-base">
                  Acesso a serviços turísticos registrados e análises de mercado.
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-start">
              <MessageCircle className="text-white mr-4 shrink-0 mt-1" size={22} />
              <div>
                <Badge className="bg-green-100 text-green-800 mb-1 font-medium">Personalizada</Badge>
                <h3 className="text-white font-medium text-lg mb-2">Atendimento Adaptável</h3>
                <p className="text-white/90 text-base">
                  Respostas personalizadas baseadas nos seus interesses e preferências.
                </p>
              </div>
            </div>
          </div>
          
          <Link 
            to="/delinha" 
            className="bg-white text-ms-guavira-purple font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition-colors inline-block shadow-lg"
          >
            Conversar com a Delinha agora
          </Link>
          
          <div className="flex items-center mt-5">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-xs font-medium text-purple-700">MB</div>
              <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-xs font-medium text-blue-700">JD</div>
              <div className="w-8 h-8 rounded-full bg-green-300 flex items-center justify-center text-xs font-medium text-green-700">AS</div>
            </div>
            <div className="ml-3 text-white/80 text-sm">
              <span className="font-medium">+350</span> conversas nas últimas 24h
            </div>
          </div>
        </div>
        
        <div className="md:w-2/5">
          <div className="relative">
            {/* Círculos concêntricos com efeito glassmorphism melhorado */}
            <div className="w-80 h-80 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center mx-auto">
              <div className="w-72 h-72 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full bg-white flex items-center justify-center overflow-hidden relative shadow-lg">
                    {/* Gradiente de fundo melhorado */}
                    <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-purple-50 to-purple-100"></div>
                    
                    {/* Conteúdo do avatar */}
                    <div className="relative z-10 text-center p-4 flex flex-col items-center">
                      {/* Avatar com imagem melhorada */}
                      <Avatar className="w-28 h-28 border-4 border-pink-200 mb-2">
                        <AvatarImage 
                          src="/lovable-uploads/4ffd53e9-ad25-4089-8335-2aa5871539b6.png" 
                          alt="Delinha" 
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-purple-200 text-purple-600 text-2xl">
                          D
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Nome e função */}
                      <h3 className="text-2xl font-bold text-ms-guavira-purple mt-2">Delinha</h3>
                      <p className="text-gray-600 mb-2">Sua Guia Virtual Inteligente</p>
                      
                      {/* Avaliação */}
                      <div className="flex items-center mt-1 bg-purple-100 px-3 py-1 rounded-full shadow-inner">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs ml-1 text-purple-700">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bolhas decorativas */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-pink-400 rounded-full opacity-20 blur-md"></div>
            <div className="absolute top-20 -right-10 w-10 h-10 bg-purple-300 rounded-full opacity-40 blur-md"></div>
            <div className="absolute bottom-12 -left-8 w-12 h-12 bg-blue-300 rounded-full opacity-30 blur-md"></div>
            
            {/* Elementos flutuantes */}
            <div className="absolute top-5 right-20 bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-md transform rotate-3 animate-pulse">
              <span className="text-lg">🎵</span>
            </div>
            <div className="absolute bottom-16 right-12 bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-md transform -rotate-6">
              <span className="text-lg">🌺</span>
            </div>
            <div className="absolute bottom-32 left-0 bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-md transform rotate-12 animate-pulse" style={{animationDelay: '1s'}}>
              <span className="text-lg">🦜</span>
            </div>
            
            {/* Badge de tecnologia AI */}
            <div className="absolute -bottom-2 right-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              Powered by GPT-4
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Link to="/delinha">
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/40">
                <MessageCircle className="mr-2 h-4 w-4" />
                Iniciar conversa
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DelinhaSection;
