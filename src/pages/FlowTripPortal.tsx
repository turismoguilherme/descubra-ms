
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Lock, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FlowTripLogo from '@/components/flowtrip/FlowTripLogo';

const FlowTripPortal = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'state' | 'municipal' | 'igr'>('state');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de login baseada no tipo
    switch (loginType) {
      case 'state':
        navigate('/ms/admin/dashboard');
        break;
      case 'municipal':
        navigate('/ms/municipal/dashboard');
        break;
      case 'igr':
        navigate('/ms/igr/dashboard');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <FlowTripLogo size="md" className="text-white" />
          <Button 
            variant="ghost" 
            onClick={() => navigate('/flowtrip-saas')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Site
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 mx-auto">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Portal do Cliente
              </CardTitle>
              <CardDescription className="text-gray-600">
                Acesse sua conta FlowTrip
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loginType">Tipo de Acesso</Label>
                  <Select value={loginType} onValueChange={(value: 'state' | 'municipal' | 'igr') => setLoginType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de acesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="state">Gestor Estadual</SelectItem>
                      <SelectItem value="municipal">Gestor Municipal</SelectItem>
                      <SelectItem value="igr">Operador IGR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="seu@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="Sua senha"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  size="lg"
                >
                  Entrar no Portal
                </Button>

                <div className="text-center pt-4">
                  <Button variant="link" className="text-sm text-gray-600">
                    Esqueceu sua senha?
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-white/80 text-sm">
              Não tem acesso? Entre em contato com seu gestor ou{' '}
              <Button variant="link" className="text-white underline p-0 h-auto">
                solicite uma demonstração
              </Button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FlowTripPortal;
