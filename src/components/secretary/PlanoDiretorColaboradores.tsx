import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Mail, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Colaborador } from '@/services/public/planoDiretorService';
import ConvidarColaboradorModal from './ConvidarColaboradorModal';

interface PlanoDiretorColaboradoresProps {
  planoId: string;
  onUpdate?: () => void;
}

const PlanoDiretorColaboradores: React.FC<PlanoDiretorColaboradoresProps> = ({ planoId, onUpdate }) => {
  const { toast } = useToast();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadColaboradores();
  }, [planoId]);

  const loadColaboradores = async () => {
    try {
      setLoading(true);
      const data = await planoDiretorService.getColaboradores(planoId);
      setColaboradores(data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este colaborador?')) return;

    try {
      await planoDiretorService.removeColaborador(id);
      await loadColaboradores();
      onUpdate?.();
      toast({
        title: 'Sucesso',
        description: 'Colaborador removido com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o colaborador.',
        variant: 'destructive'
      });
    }
  };

  const getNivelAcessoColor = (permissoes: string[]) => {
    if (permissoes.includes('aprovar')) return 'bg-purple-100 text-purple-800';
    if (permissoes.some(p => p.includes('editar'))) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getNivelAcessoLabel = (permissoes: string[]) => {
    if (permissoes.includes('aprovar')) return 'Aprovar';
    if (permissoes.some(p => p.includes('editar'))) return 'Editar';
    return 'Visualizar';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Colaboradores
            </CardTitle>
            <Button onClick={() => setShowModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Convidar Colaborador
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Carregando colaboradores...</p>
          ) : colaboradores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum colaborador adicionado ainda.</p>
              <p className="text-sm mt-2">Clique em "Convidar Colaborador" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {colaboradores.map((colaborador) => (
                <Card key={colaborador.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{colaborador.nome}</h3>
                          <Badge className={getNivelAcessoColor(colaborador.permissoes)}>
                            <Shield className="h-3 w-3 mr-1" />
                            {getNivelAcessoLabel(colaborador.permissoes)}
                          </Badge>
                          {colaborador.tipoAtor && (
                            <Badge variant="outline" className="text-xs">
                              {colaborador.tipoAtor}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {colaborador.email}
                        </div>
                        {colaborador.permissoes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {colaborador.permissoes.slice(0, 5).map((perm, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {perm.replace('_', ' ')}
                              </Badge>
                            ))}
                            {colaborador.permissoes.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{colaborador.permissoes.length - 5} mais
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(colaborador.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <ConvidarColaboradorModal
          planoId={planoId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            loadColaboradores();
            onUpdate?.();
          }}
        />
      )}
    </div>
  );
};

export default PlanoDiretorColaboradores;

