import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, ArrowLeft, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tourismRouteService, Route, Checkpoint } from "@/services/routes/tourismRouteService"; // Importar o serviço e interfaces
import CheckpointManager from "@/components/admin/route-form/CheckpointManager"; // Componente para gerenciar checkpoints
import { seoOptimizationService } from "@/services/ai/seo/seoOptimizationService"; // Importar o serviço de SEO

interface SeoSuggestions {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

const RouteEditor = () => {
  const { id } = useParams<{ id: string }>(); // O ID pode ser undefined para novos roteiros
  const navigate = useNavigate();
  const { toast } = useToast();

  const [route, setRoute] = useState<Route>({
    id: "",
    name: "",
    description: null,
    image_url: null,
    is_active: true,
    created_at: "",
    updated_at: "",
    created_by: "",
    updated_by: "",
  });
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState<SeoSuggestions | null>(null);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const fetchedRoute = await tourismRouteService.getRouteById(id);
        if (fetchedRoute) {
          setRoute(fetchedRoute);
          const fetchedCheckpoints = await tourismRouteService.getCheckpointsByRouteId(id);
          setCheckpoints(fetchedCheckpoints);
        } else {
          toast({
            title: "Erro",
            description: "Roteiro não encontrado.",
            variant: "destructive",
          });
          navigate("/admin/routes-management"); // Redirecionar se não encontrar
        }
      } catch (error) {
        console.error("Erro ao carregar dados do roteiro:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do roteiro.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let currentRouteId = id;

      if (!currentRouteId) {
        // Criar novo roteiro
        const newRoute = await tourismRouteService.createRoute({
          name: route.name,
          description: route.description,
          image_url: route.image_url,
          is_active: route.is_active,
        });
        currentRouteId = newRoute.id;
        setRoute(newRoute); // Atualiza o estado da rota com o ID gerado
      } else {
        // Atualizar roteiro existente
        await tourismRouteService.updateRoute(currentRouteId, {
          name: route.name,
          description: route.description,
          image_url: route.image_url,
          is_active: route.is_active,
        });
      }

      // Salvar/Atualizar Checkpoints
      // Esta lógica é simplificada. Em um cenário real, você precisaria:
      // 1. Identificar checkpoints novos (sem id) para criar.
      // 2. Identificar checkpoints existentes (com id) para atualizar.
      // 3. Identificar checkpoints removidos da lista para deletar.
      // Por simplicidade, faremos um "upsert" ou recriação se necessário.
      for (const cp of checkpoints) {
        if (cp.id && cp.route_id === currentRouteId) {
          // Atualizar existente
          await tourismRouteService.updateCheckpoint(cp.id, {
            name: cp.name,
            description: cp.description,
            latitude: cp.latitude,
            longitude: cp.longitude,
            stamp_image_url: cp.stamp_image_url,
            reward_id: cp.reward_id,
            order: cp.order,
          });
        } else {
          // Criar novo
          await tourismRouteService.createCheckpoint({
            route_id: currentRouteId,
            name: cp.name,
            description: cp.description,
            latitude: cp.latitude,
            longitude: cp.longitude,
            stamp_image_url: cp.stamp_image_url,
            reward_id: cp.reward_id,
            order: cp.order,
          });
        }
      }


      toast({
        title: "Sucesso",
        description: "Roteiro salvo com sucesso!",
      });

      navigate(`/admin/route-editor/${currentRouteId}`); // Redirecionar para o editor do roteiro salvo
    } catch (error) {
      console.error("Erro ao salvar roteiro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o roteiro.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSeo = async () => {
    if (!route.name) {
      toast({
        title: "Nome do Roteiro Necessário",
        description: "Por favor, preencha o nome do roteiro antes de gerar sugestões de SEO.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingSeo(true);
    setSeoSuggestions(null); // Limpar sugestões anteriores
    try {
      const suggestions = await seoOptimizationService.generateRouteSeo(
        route.name,
        route.description || undefined
      );
      setSeoSuggestions(suggestions);
      toast({
        title: "Sugestões de SEO Geradas!",
        description: "As sugestões de SEO foram geradas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar SEO:", error);
      toast({
        title: "Erro de IA",
        description: "Não foi possível gerar sugestões de SEO. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSeo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="ms-container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/routes-management")} // Voltar à lista de gerenciamento de rotas
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Gerenciamento
          </Button>
          <h1 className="text-3xl font-bold text-ms-primary-blue">
            {id ? `Editar Roteiro: ${route.name}` : "Novo Roteiro"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações básicas do Roteiro */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais do Roteiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="routeName">Nome do Roteiro</Label>
              <Input
                id="routeName"
                value={route.name || ""}
                onChange={(e) => setRoute((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do roteiro (ex: Rota das Cachoeiras)"
              />
            </div>
            <div>
              <Label htmlFor="routeDescription">Descrição do Roteiro</Label>
              <Textarea
                id="routeDescription"
                value={route.description || ""}
                onChange={(e) => setRoute((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Uma breve descrição do roteiro..."
              />
            </div>
            <div>
              <Label htmlFor="routeImageUrl">URL da Imagem do Roteiro</Label>
              <Input
                id="routeImageUrl"
                value={route.image_url || ""}
                onChange={(e) => setRoute((prev) => ({ ...prev, image_url: e.target.value }))}
                placeholder="URL da imagem de destaque do roteiro"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="routeIsActive"
                checked={route.is_active}
                onCheckedChange={(checked) => setRoute((prev) => ({ ...prev, is_active: !!checked }))}
              />
              <Label htmlFor="routeIsActive">Roteiro Ativo (Visível na Plataforma)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Otimização SEO com IA */}
        <Card>
          <CardHeader>
            <CardTitle>Otimização SEO com IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateSeo} disabled={generatingSeo || !route.name}>
              {generatingSeo ? "Gerando..." : "Gerar Sugestões de SEO"}
            </Button>
            {seoSuggestions && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Título SEO (Meta Title)</Label>
                  <Input value={seoSuggestions.seoTitle} readOnly />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigator.clipboard.writeText(seoSuggestions.seoTitle)}>
                    Copiar
                  </Button>
                </div>
                <div>
                  <Label>Meta Descrição (Meta Description)</Label>
                  <Textarea value={seoSuggestions.metaDescription} readOnly rows={3} />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigator.clipboard.writeText(seoSuggestions.metaDescription)}>
                    Copiar
                  </Button>
                </div>
                <div>
                  <Label>Palavras-chave (Keywords)</Label>
                  <Input value={seoSuggestions.keywords.join(', ')} readOnly />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigator.clipboard.writeText(seoSuggestions.keywords.join(', '))}>
                    Copiar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gerenciamento de Checkpoints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Checkpoints do Roteiro</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckpointManager
              checkpoints={checkpoints}
              setCheckpoints={setCheckpoints}
              routeId={id || route.id} // Passa o ID da rota para o CheckpointManager
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteEditor; 