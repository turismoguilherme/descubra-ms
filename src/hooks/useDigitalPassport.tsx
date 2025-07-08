
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_passport_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (progressError) throw progressError;
      setProgress(progressData || []);

      // Calculate total points
      const points = progressData?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0;
      setTotalPoints(points);

      // Fetch digital stamps
      const { data: stampsData, error: stampsError } = await supabase
        .from('digital_stamps')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (stampsError) throw stampsError;
      setStamps(stampsData || []);

      // Fetch user benefits
      const { data: benefitsData, error: benefitsError } = await supabase
        .from('user_benefits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (benefitsError) throw benefitsError;
      setBenefits(benefitsData || []);

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
      const { error } = await supabase
        .from('user_benefits')
        .update({ 
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', benefitId);

      if (error) throw error;

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

      // Record progress
      const progressData = {
        user_id: user.id,
        route_id: routeId,
        completed_at: new Date().toISOString(),
        points_earned: 100, // Default points
        stamp_earned: true,
        proof_photo_url: proofPhotoUrl,
        user_notes: notes
      };

      const { error: progressError } = await supabase
        .from('user_passport_progress')
        .insert([progressData]);

      if (progressError) throw progressError;

      // Create digital stamp
      const stampData = {
        user_id: user.id,
        route_id: routeId,
        stamp_name: `Roteiro Concluído`,
        earned_at: new Date().toISOString(),
        completion_percentage: 100
      };

      const { error: stampError } = await supabase
        .from('digital_stamps')
        .insert([stampData]);

      if (stampError) throw stampError;

      toast({
        title: "Parabéns!",
        description: "Roteiro concluído com sucesso! Você ganhou um novo selo digital.",
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
