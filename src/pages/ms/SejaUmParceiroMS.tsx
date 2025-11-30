import React from 'react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { PartnerApplicationForm } from '@/components/partners/PartnerApplicationForm';
import { Building2, Gift, TrendingUp, Users } from 'lucide-react';

const SejaUmParceiroMS = () => {
  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative ms-container text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Users size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Seja um Parceiro
            </h1>
            <p className="text-white/95 text-xl max-w-3xl mx-auto leading-relaxed">
              Junte-se à maior plataforma de turismo de Mato Grosso do Sul e alcance milhares de turistas.
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <div className="ms-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="bg-ms-primary-blue/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-ms-primary-blue" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Visibilidade</h3>
              <p className="text-gray-600 text-sm">
                Seu negócio em destaque para milhares de turistas que visitam o MS.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="bg-ms-secondary-yellow/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-7 h-7 text-ms-secondary-yellow" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Passaporte Digital</h3>
              <p className="text-gray-600 text-sm">
                Ofereça descontos exclusivos para viajantes do Descubra MS.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="bg-ms-pantanal-green/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-ms-pantanal-green" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Rede de Parceiros</h3>
              <p className="text-gray-600 text-sm">
                Faça parte de uma rede de empreendedores do turismo sul-mato-grossense.
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-ms-primary-blue mb-2">
                  Cadastre sua empresa
                </h2>
                <p className="text-gray-600">
                  Preencha o formulário abaixo e nossa equipe entrará em contato para discutir os detalhes da parceria.
                </p>
              </div>
              
              <PartnerApplicationForm />
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default SejaUmParceiroMS;
