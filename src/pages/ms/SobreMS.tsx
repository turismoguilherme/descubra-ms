import React from 'react';
import UniversalLayout from '@/components/layout/UniversalLayout';

const SobreMS = () => {
  return (
    <UniversalLayout>
      <main className="flex-grow bg-gray-50">
        <div className="ms-container py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-ms-primary-blue mb-8 text-center">
              Sobre a Plataforma
            </h1>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-ms-primary-blue mb-4">
                  Descubra Mato Grosso do Sul
                </h2>
                
                <p className="text-gray-600 mb-6">
                  A plataforma "Descubra Mato Grosso do Sul" é uma iniciativa inovadora que utiliza 
                  inteligência artificial para promover o turismo sustentável no estado. Nossa missão 
                  é conectar visitantes aos destinos únicos de MS através de experiências personalizadas 
                  e tecnologia de ponta.
                </p>
                
                <h3 className="text-xl font-bold text-ms-primary-blue mb-3">
                  Nossa Missão
                </h3>
                <p className="text-gray-600 mb-6">
                  Promover o turismo sustentável em Mato Grosso do Sul através de tecnologia inovadora, 
                  oferecendo experiências personalizadas que valorizam a biodiversidade e a cultura local.
                </p>
                
                <h3 className="text-xl font-bold text-ms-primary-blue mb-3">
                  Principais Características
                </h3>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Inteligência Artificial com o Guatá, seu assistente virtual</li>
                  <li>Passaporte Digital para colecionar selos virtuais</li>
                  <li>Roteiros personalizados baseados em seus interesses</li>
                  <li>Informações atualizadas sobre destinos e eventos</li>
                  <li>Comunidade de viajantes conectados</li>
                </ul>
                
                <h3 className="text-xl font-bold text-ms-primary-blue mb-3">
                  Principais Interesses Turísticos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-ms-pantanal-green/10 to-ms-discovery-teal/10 p-4 rounded-lg border border-ms-pantanal-green/20">
                    <h4 className="font-semibold text-ms-primary-blue">Ecoturismo (35%)</h4>
                    <p className="text-sm text-gray-600">Exploração da natureza e biodiversidade</p>
                  </div>
                  <div className="bg-gradient-to-r from-ms-pantanal-green/10 to-ms-discovery-teal/10 p-4 rounded-lg border border-ms-pantanal-green/20">
                    <h4 className="font-semibold text-ms-primary-blue">Turismo Rural (25%)</h4>
                    <p className="text-sm text-gray-600">Experiências em fazendas e propriedades rurais</p>
                  </div>
                  <div className="bg-gradient-to-r from-ms-pantanal-green/10 to-ms-discovery-teal/10 p-4 rounded-lg border border-ms-pantanal-green/20">
                    <h4 className="font-semibold text-ms-primary-blue">Turismo Cultural (20%)</h4>
                    <p className="text-sm text-gray-600">História, tradições e manifestações culturais</p>
                  </div>
                  <div className="bg-gradient-to-r from-ms-pantanal-green/10 to-ms-discovery-teal/10 p-4 rounded-lg border border-ms-pantanal-green/20">
                    <h4 className="font-semibold text-ms-primary-blue">Turismo de Aventura (20%)</h4>
                    <p className="text-sm text-gray-600">Atividades esportivas e de aventura</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600">
                    Junte-se a nós e descubra as maravilhas de Mato Grosso do Sul!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default SobreMS;
