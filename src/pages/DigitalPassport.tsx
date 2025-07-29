
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";

const DigitalPassport = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      <main className="flex-grow py-16">
        <div className="ms-container text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                🛂 Passaporte Digital MS
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore as 10 regiões turísticas oficiais de Mato Grosso do Sul de forma 
                gamificada e interativa. Colete carimbos digitais, desbloqueie recompensas 
                e torne-se um verdadeiro explorador sul-mato-grossense!
              </p>
            </div>

            {/* Funcionalidades */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Mapa Interativo</h3>
                  <p className="text-gray-600">
                    Navegue pelas 10 regiões turísticas oficiais do MS com uma 
                    interface visual encantadora e intuitiva.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Carimbos & Recompensas</h3>
                  <p className="text-gray-600">
                    Complete roteiros, colete carimbos digitais únicos e 
                    desbloqueie recompensas exclusivas de parceiros locais.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📍</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Geolocalização</h3>
                  <p className="text-gray-600">
                    Use a geolocalização para fazer check-ins em pontos turísticos 
                    e comprovar sua presença nos destinos.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Como Funciona */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Como Funciona o Passaporte Digital
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                      1
                    </div>
                    <h3 className="font-semibold">Escolha uma Região</h3>
                    <p className="text-sm text-gray-600">
                      Selecione uma das 10 regiões turísticas oficiais para explorar
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                      2
                    </div>
                    <h3 className="font-semibold">Inicie um Roteiro</h3>
                    <p className="text-sm text-gray-600">
                      Escolha um roteiro disponível na região e visite os checkpoints
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                      3
                    </div>
                    <h3 className="font-semibold">Faça Check-ins</h3>
                    <p className="text-sm text-gray-600">
                      Use a geolocalização para comprovar sua visita aos pontos turísticos
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                      4
                    </div>
                    <h3 className="font-semibold">Colete & Ganhe</h3>
                    <p className="text-sm text-gray-600">
                      Ganhe carimbos digitais, pon​os e desbloqueie recompensas exclusivas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="space-y-6">
              <Link to="/ms/roteiros">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  Começar Minha Jornada
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div> {/* Fecha o div de Call to Action */}

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10</div>
                <div className="text-sm text-gray-600">Regiões Turísticas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Destinos Únicos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">100+</div>
                <div className="text-sm text-gray-600">Carimbos Colecionáveis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">∞</div>
                <div className="text-sm text-gray-600">Experiências Únicas</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DigitalPassport;
