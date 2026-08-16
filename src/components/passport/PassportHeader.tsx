
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, MapPin, Gift } from "lucide-react";
import { UserPassportStats } from "@/types/passport";

interface PassportHeaderProps {
  stats: UserPassportStats;
  userName?: string;
}

const PassportHeader = ({ stats, userName = "Viajante" }: PassportHeaderProps) => {
  const getLevel = (points: number) => {
    if (points >= 1000) return "Explorador Master";
    if (points >= 500) return "Aventureiro Experiente";
    if (points >= 200) return "Caminhante Dedicado";
    if (points >= 50) return "Descobridor Iniciante";
    return "Novo Explorador";
  };

  const getNextLevelThreshold = (points: number) => {
    if (points < 50) return 50;
    if (points < 200) return 200;
    if (points < 500) return 500;
    if (points < 1000) return 1000;
    return 1500;
  };

  const getProgressPercentage = (points: number) => {
    const nextThreshold = getNextLevelThreshold(points);
    let previousThreshold = 0;
    
    if (nextThreshold === 200) previousThreshold = 50;
    else if (nextThreshold === 500) previousThreshold = 200;
    else if (nextThreshold === 1000) previousThreshold = 500;
    else if (nextThreshold === 1500) previousThreshold = 1000;

    const progress = ((points - previousThreshold) / (nextThreshold - previousThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const currentPoints = stats.totalPoints || stats.total_points || 0;
  const totalStamps = stats.earnedStamps || stats.total_stamps || 0;
  const completedRoutes = stats.completedRoutes || stats.total_routes_completed || 0;
  const availableBenefits = stats.availableBenefits || stats.total_benefits_earned || 0;

  const level = getLevel(currentPoints);
  const progressPercentage = getProgressPercentage(currentPoints);
  const nextThreshold = getNextLevelThreshold(currentPoints);

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Olá, {userName}!</h1>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {level}
              </Badge>
            </div>
            <p className="text-blue-100">
              {currentPoints} pontos • Próximo nível: {nextThreshold} pontos
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">{currentPoints}</div>
                <div className="text-sm">pontos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso para o próximo nível</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{totalStamps}</div>
            <div className="text-sm text-blue-100">Selos Coletados</div>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{completedRoutes}</div>
            <div className="text-sm text-blue-100">Roteiros Concluídos</div>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Gift className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{availableBenefits}</div>
            <div className="text-sm text-blue-100">Benefícios Disponíveis</div>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{currentPoints}</div>
            <div className="text-sm text-blue-100">Total de Pontos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassportHeader;
