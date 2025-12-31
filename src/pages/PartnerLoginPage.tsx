import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ArrowLeft, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import PartnerLoginForm from '@/components/auth/PartnerLoginForm';

const PartnerLoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <Link 
            to="/descubrams" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Área do Parceiro</h1>
              <p className="text-white/80 text-sm">Descubra Mato Grosso do Sul</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-ms-primary-blue" />
              Acesse sua conta
            </CardTitle>
            <CardDescription>
              Faça login para gerenciar suas reservas e informações do negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PartnerLoginForm />
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-gray-600 mb-4">
                Ainda não é parceiro?
              </p>
              <Link 
                to="/descubrams/seja-um-parceiro"
                className="block w-full text-center text-sm text-ms-primary-blue hover:text-ms-discovery-teal font-medium transition-colors"
              >
                Seja um Parceiro →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Box com benefícios */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white/90 text-sm font-semibold mb-3 text-center">
            O que você pode fazer como parceiro:
          </p>
          <div className="grid grid-cols-1 gap-2 text-white/80 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              <span>Gerenciar reservas recebidas</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white" />
              <span>Editar informações do seu negócio</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-white" />
              <span>Acompanhar estatísticas e comissões</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white" />
              <span>Visualizar receita gerada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerLoginPage;

