import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Star, Play, Filter, Heart, Share2 } from 'lucide-react';
import { TouristRoute } from '@/types/passport';
import { useRouteManagement } from '@/hooks/useRouteManagement';
import RoutePreviewCard from '@/components/routes/RoutePreviewCard';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const RoteirosMS = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('pages');
  const { routes, loading, loadRoutes } = useRouteManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [favoriteRoutes, setFavoriteRoutes] = useState<string[]>([]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !difficultyFilter || route.difficulty_level === difficultyFilter;
    const matchesCategory = !categoryFilter || route.region?.toLowerCase().includes(categoryFilter.toLowerCase());
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const handleViewRoute = (route: TouristRoute) => {
    navigate(`/descubrams/roteiros/${route.id}`);
  };

  const handleStartRoute = (route: TouristRoute) => {
    navigate(`/descubrams/passaporte/${route.id}`);
  };

  const toggleFavorite = (routeId: string) => {
    setFavoriteRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
    toast({
      title: favoriteRoutes.includes(routeId) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: "Suas preferências foram atualizadas.",
    });
  };

  const shareRoute = async (route: TouristRoute) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: route.name,
          text: route.description,
          url: `${window.location.origin}/ms/roteiros/${route.id}`
        });
      } catch (err) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(`${window.location.origin}/ms/roteiros/${route.id}`);
      toast({
        title: "Link copiado!",
        description: "O link do roteiro foi copiado para a área de transferência.",
      });
    }
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-secondary-teal to-ms-accent-orange">
        {/* Header Section */}
        <div className="bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center text-white max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {t('routes.title', { defaultValue: 'Roteiros Únicos de' })}
                <span className="bg-gradient-to-r from-ms-accent-orange to-ms-secondary-teal bg-clip-text text-transparent block">
                  {t('routes.subtitle', { defaultValue: 'Descubra Mato Grosso do Sul' })}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {t('routes.description', { defaultValue: 'Descubra experiências autênticas através do nosso passaporte digital gamificado. Explore, colecione carimbos e ganhe recompensas únicas!' })}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ms-accent-orange">{routes.length}</div>
                  <div className="text-sm text-white/80">{t('routes.stats.routes', { defaultValue: 'Roteiros' })}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ms-secondary-teal">100+</div>
                  <div className="text-sm text-white/80">{t('routes.stats.points', { defaultValue: 'Pontos' })}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">🏆</div>
                  <div className="text-sm text-white/80">{t('routes.stats.achievements', { defaultValue: 'Conquistas' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('routes.filters.search', { defaultValue: 'Buscar roteiros' })}
                  </label>
                  <Input
                    placeholder={t('routes.filters.searchPlaceholder', { defaultValue: 'Digite o nome do roteiro...' })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('routes.filters.difficulty', { defaultValue: 'Dificuldade' })}
                  </label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder={t('routes.filters.all', { defaultValue: 'Todas' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('routes.filters.all', { defaultValue: 'Todas' })}</SelectItem>
                      <SelectItem value="facil">{t('routes.filters.easy', { defaultValue: 'Fácil' })}</SelectItem>
                      <SelectItem value="medio">{t('routes.filters.medium', { defaultValue: 'Médio' })}</SelectItem>
                      <SelectItem value="dificil">{t('routes.filters.hard', { defaultValue: 'Difícil' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('routes.filters.region', { defaultValue: 'Região' })}
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder={t('routes.filters.all', { defaultValue: 'Todas' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('routes.filters.all', { defaultValue: 'Todas' })}</SelectItem>
                      <SelectItem value="pantanal">Pantanal</SelectItem>
                      <SelectItem value="bonito">Bonito</SelectItem>
                      <SelectItem value="campo grande">Campo Grande</SelectItem>
                      <SelectItem value="corumba">Corumbá</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="secondary" 
                  className="bg-ms-accent-orange hover:bg-ms-accent-orange/90 text-white"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t('routes.filters.filter', { defaultValue: 'Filtrar' })}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Routes Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-white/20 rounded mb-4"></div>
                    <div className="h-4 bg-white/20 rounded mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => (
                <RoutePreviewCard
                  key={route.id}
                  route={route}
                  onViewDetails={() => handleViewRoute(route)}
                  onStartRoute={() => handleStartRoute(route)}
                  onToggleFavorite={() => toggleFavorite(route.id)}
                  onShare={() => shareRoute(route)}
                  isFavorite={favoriteRoutes.includes(route.id)}
                  userProgress={0} // TODO: Buscar progresso real do usuário
                />
              ))}
            </div>
          )}

          {filteredRoutes.length === 0 && !loading && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-12 text-center">
                <MapPin className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('routes.noResults.title', { defaultValue: 'Nenhum roteiro encontrado' })}
                </h3>
                <p className="text-white/80">
                  {t('routes.noResults.description', { defaultValue: 'Tente ajustar os filtros ou buscar por outros termos.' })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default RoteirosMS;