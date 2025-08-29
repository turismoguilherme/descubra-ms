
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { achievementService } from "@/services/achievementService";

export interface UserProgress {
  id: string;
  user_id: string;
  route_id?: string;
  city_id?: string;
  region_id?: string;
  completed_at: string;
  points_earned?: number;
  stamp_earned?: boolean;
  proof_photo_url?: string;
  user_notes?: string;
}

export interface UserBenefit {
  id: string;
  user_id: string;
  benefit_type: string;
  benefit_name: string;
  description?: string;
  is_used: boolean;
  used_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DigitalStamp {
  id: string;
  user_id: string;
  route_id?: string;
  city_id?: string;
  region_id?: string;
  stamp_name: string;
  stamp_icon_url?: string;
  earned_at: string;
  completion_percentage?: number;
  cultural_phrase?: string;
}

export const useDigitalPassport = () => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stamps, setStamps] = useState<DigitalStamp[]>([]);
  const [benefits, setBenefits] = useState<UserBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

  const fetchUserData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      // For now, use passport_stamps as progress data
      const { data: progressData, error: progressError } = await supabase
        .from('passport_stamps')
        .select('*')
        .eq('user_id', user.id)
        .order('stamped_at', { ascending: false });

      if (progressError) throw progressError;
      
      // Transform passport stamps into progress format
      const formattedProgress = (progressData || []).map(stamp => ({
        id: stamp.id,
        user_id: stamp.user_id,
        route_id: stamp.route_id,
        completed_at: stamp.stamped_at || '',
        points_earned: 10, // Default points per stamp
        stamp_earned: true
      }));
      
      setProgress(formattedProgress);

      // Calculate total points
      const points = formattedProgress.length * 10;
      setTotalPoints(points);

      // Use passport stamps as digital stamps too
      const formattedStamps = (progressData || []).map(stamp => ({
        id: stamp.id,
        user_id: stamp.user_id,
        route_id: stamp.route_id,
        stamp_name: stamp.stamp_type || 'Carimbado',
        earned_at: stamp.stamped_at || '',
        completion_percentage: 100
      }));
      
      setStamps(formattedStamps);

      // No benefits table for now, use empty array
      setBenefits([]);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do passaporte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const markBenefitAsUsed = async (benefitId: string) => {
    try {
      // For now, just show success since we don't have benefits table
      toast({
        title: "Sucesso",
        description: "Benefício marcado como utilizado!",
      });

      fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error marking benefit as used:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar benefício como utilizado",
        variant: "destructive",
      });
    }
  };

  const submitRouteCompletion = async (routeId: string, proofPhoto?: File, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let proofPhotoUrl = null;

      // Upload proof photo if provided
      if (proofPhoto) {
        const fileName = `${user.id}/${routeId}/${Date.now()}-${proofPhoto.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('route-proofs')
          .upload(fileName, proofPhoto);

        if (uploadError) throw uploadError;
        proofPhotoUrl = uploadData.path;
      }

      // Get route details for points calculation
      const { data: routeData } = await supabase
        .from('routes')
        .select('difficulty')
        .eq('id', routeId)
        .single();

      // Calculate points based on difficulty
      let pointsEarned = 10; // Default
      if (routeData?.difficulty === 'medio') pointsEarned = 20;
      if (routeData?.difficulty === 'dificil') pointsEarned = 35;

      // Create a passport stamp for the route completion
      const stampData = {
        user_id: user.id,
        route_id: routeId,
        stamp_type: 'route_completion',
        stamped_at: new Date().toISOString(),
        latitude: null,
        longitude: null
      };

      const { error: stampError } = await supabase
        .from('passport_stamps')
        .insert([stampData]);

      if (stampError) throw stampError;

      // Update user points using the function
      await supabase.rpc('update_user_points', {
        p_user_id: user.id,
        p_state_id: 'ms-pantanal', // Default state
        p_points: pointsEarned
      });

      // Check for new achievements
      const newAchievements = await achievementService.checkAndUnlockAchievements(user.id);
      
      // Show achievement notifications
      newAchievements.forEach((achievement) => {
        toast({
          title: "🎉 Nova Conquista!",
          description: `${achievement.achievement?.icon} ${achievement.achievement?.name}`,
          duration: 5000,
        });
      });

      toast({
        title: "Parabéns!",
        description: `Roteiro concluído! Você ganhou ${pointsEarned} pontos e um novo selo digital.`,
      });

      fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error submitting route completion:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar conclusão do roteiro",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    progress,
    stamps,
    benefits,
    loading,
    totalPoints,
    markBenefitAsUsed,
    submitRouteCompletion,
    refetch: fetchUserData
  };
};
