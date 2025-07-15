import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { msCities } from "@/data/cities";
import { msRegions } from "@/data/msRegions";

const CompleteProfileNew = () => {
  const { user, userProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    city_id: "",
    region_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        city_id: userProfile.city_id?.toString() || "",
        region_id: userProfile.region_id?.toString() || ""
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Usuário não autenticado");
      console.error("❌ COMPLETE_PROFILE: Tentativa de submeter sem usuário logado.");
      return;
    }

    setIsSubmitting(true);
    console.log("🔄 COMPLETE_PROFILE: Iniciando upsert do perfil para user.id:", user.id);
    console.log("🔄 COMPLETE_PROFILE: Dados do formulário:", formData);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id, // Correção: Usar user_id para vincular ao auth.users.id
          full_name: formData.full_name,
          city_id: formData.city_id ? parseInt(formData.city_id) : null,
          region_id: formData.region_id ? parseInt(formData.region_id) : null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' }); // Importante: Usar onConflict para o upsert baseado em user_id

      if (error) {
        console.error("❌ COMPLETE_PROFILE: Erro ao salvar perfil:", error);
        toast.error(`Erro ao completar perfil: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      toast.success("Perfil atualizado com sucesso!");
      console.log("✅ COMPLETE_PROFILE: Perfil atualizado com sucesso para user.id:", user.id);
      
      // Recarregar a página para atualizar o contexto
      window.location.reload();
      
    } catch (error) {
      console.error("❌ COMPLETE_PROFILE: Erro ao atualizar perfil (catch):", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
      console.log("✅ COMPLETE_PROFILE: isSubmitting setado para false.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Complete seu Perfil</CardTitle>
            <CardDescription>
              Preencha as informações abaixo para personalizar sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Região</Label>
                <Select
                  value={formData.region_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma região" />
                  </SelectTrigger>
                  <SelectContent>
                    {msRegions.map((region) => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {msCities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfileNew; 