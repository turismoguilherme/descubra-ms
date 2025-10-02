import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, Shield, BarChart3, Users, Globe, Zap } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const ParaGovernos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block bg-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Para Governos Estaduais e Municipais
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transforme o Turismo Público com Tecnologia
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Plataforma completa para secretarias de turismo gerenciarem destinos, eventos, 
              dados e promoverem o turismo regional de forma inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/viajar/register">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg">
                  Solicitar Demo
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
                  Falar com Especialista
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que governos escolhem a ViaJAR?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solução completa, segura e escalável para gestão pública de turismo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Conformidade LGPD</h3>
              <p className="text-gray-600">
                Totalmente adequado à Lei Geral de Proteção de Dados, com criptografia e auditoria completa.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dados e Analytics</h3>
              <p className="text-gray-600">
                Dashboards em tempo real com indicadores de turismo, fluxo de visitantes e impacto econômico.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-500 rounded-xl flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Tenant</h3>
              <p className="text-gray-600">
                Arquitetura escalável que permite implantação em múltiplos municípios e regiões.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestão Hierárquica</h3>
              <p className="text-gray-600">
                Sistema de permissões para diferentes níveis: estadual, regional e municipal.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-100">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Implementação Rápida</h3>
              <p className="text-gray-600">
                Implantação em até 30 dias com treinamento completo da equipe e migração de dados.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Suporte Dedicado</h3>
              <p className="text-gray-600">
                Equipe especializada em atendimento ao setor público com SLA garantido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Governments */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades para Gestão Pública
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📊 Inventário Turístico Digital
              </h3>
              <p className="text-gray-600 mb-4">
                Cadastre e gerencie todos os ativos turísticos da região com mapas interativos, 
                fotos, descrições e categorização.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Destinos naturais e culturais</li>
                <li>• Eventos e festividades</li>
                <li>• Rotas e circuitos turísticos</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📈 Relatórios Executivos
              </h3>
              <p className="text-gray-600 mb-4">
                Relatórios automatizados para prestação de contas e tomada de decisão estratégica.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Indicadores de performance</li>
                <li>• Fluxo turístico por período</li>
                <li>• Impacto econômico estimado</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🤖 IA para Turismo
              </h3>
              <p className="text-gray-600 mb-4">
                Assistente inteligente que ajuda turistas e fornece insights para gestores.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Recomendações personalizadas</li>
                <li>• Análise preditiva de demanda</li>
                <li>• Identificação de tendências</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎮 Gamificação
              </h3>
              <p className="text-gray-600 mb-4">
                Passaporte digital com desafios e recompensas para engajar turistas.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Check-ins em pontos turísticos</li>
                <li>• Sistema de pontos e níveis</li>
                <li>• Certificados digitais</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Descubra MS Case */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 to-cyan-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Veja o Descubra MS em Ação
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Mato Grosso do Sul foi o primeiro estado a implementar nossa plataforma completa. 
                Veja como está transformando o turismo na região.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/ms">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg">
                    Ver Descubra MS
                  </Button>
                </Link>
                <Link to="/casos-sucesso">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
                    Mais Cases de Sucesso
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Pronto para Modernizar o Turismo da sua Região?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Agende uma apresentação personalizada e veja como a ViaJAR pode 
            transformar a gestão do turismo público.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg">
              Agendar Apresentação
            </Button>
          </Link>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default ParaGovernos;
