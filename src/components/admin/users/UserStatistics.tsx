import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { UserStatistics } from "./types";
import { Users, Shield, User, UserCheck, Headphones, Building } from "lucide-react";

const UserStatisticsCard = () => {
  const [statistics, setStatistics] = useState<UserStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_statistics');
      if (error) throw error;
      setStatistics(data || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'tech':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'gestor':
        return <UserCheck className="h-5 w-5 text-blue-500" />;
      case 'municipal':
      case 'municipal_manager':
        return <Building className="h-5 w-5 text-green-500" />;
      case 'atendente':
        return <Headphones className="h-5 w-5 text-orange-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administradores';
      case 'tech':
        return 'Técnicos';
      case 'gestor':
        return 'Gestores Regionais';
      case 'municipal':
        return 'Gestores Municipais';
      case 'municipal_manager':
        return 'Gerentes Municipais';
      case 'atendente':
        return 'Atendentes CAT';
      default:
        return 'Usuários Comuns';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estatísticas de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando estatísticas...</div>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = statistics.reduce((acc, stat) => acc + stat.user_count, 0);
  const totalActive = statistics.reduce((acc, stat) => acc + stat.active_count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Estatísticas de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <div className="text-sm text-blue-600">Total de Usuários</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalActive}</div>
            <div className="text-sm text-green-600">Usuários Ativos</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{totalUsers - totalActive}</div>
            <div className="text-sm text-orange-600">Usuários Inativos</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {totalUsers > 0 ? Math.round((totalActive / totalUsers) * 100) : 0}%
            </div>
            <div className="text-sm text-purple-600">Taxa de Atividade</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">Distribuição por Função</h4>
          {statistics.map((stat) => (
            <div key={stat.role_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getRoleIcon(stat.role_name)}
                <span className="font-medium">{getRoleName(stat.role_name)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {stat.active_count}/{stat.user_count} ativos
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(stat.user_count / totalUsers) * 100}%` }}
                  />
                </div>
                <span className="font-semibold w-8 text-right">{stat.user_count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatisticsCard;