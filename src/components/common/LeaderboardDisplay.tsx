import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { leaderboardService } from '@/services/leaderboard/leaderboardService';
import { useToast } from "@/hooks/use-toast";
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  total_points: number;
}

interface LeaderboardDisplayProps {
  title?: string;
  limit?: number;
}

const LeaderboardDisplay = ({ title = "Leaderboard Global", limit = 10 }: LeaderboardDisplayProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardService.getGlobalLeaderboard(limit);
      setLeaderboard(data);
    } catch (error) {
      console.error("Erro ao carregar leaderboard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o leaderboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-500">Carregando leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma entrada no leaderboard ainda.</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div key={entry.user_id} className="flex items-center gap-4 p-2 rounded-md bg-gray-50">
                <span className="font-bold text-lg w-8 text-center">
                  #{index + 1}
                </span>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.avatar_url || "/placeholder.svg"} alt={entry.full_name} />
                  <AvatarFallback>{entry.full_name ? entry.full_name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{entry.display_name || entry.full_name}</p>
                  <p className="text-sm text-gray-500">{entry.total_points} pontos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardDisplay; 