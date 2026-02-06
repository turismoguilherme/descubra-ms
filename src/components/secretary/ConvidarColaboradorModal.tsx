/**
 * Convidar Colaborador Modal
 * Modal para convidar colaboradores com sistema flexível de permissões
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService } from '@/services/public/planoDiretorService';

interface ConvidarColaboradorModalProps {
  planoId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ConvidarColaboradorModal: React.FC<ConvidarColaboradorModalProps> = ({
  planoId,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    tipoAtor: '',
    nivelAcesso: 'visualizar' as 'visualizar' | 'editar' | 'aprovar',
    permissoes: {
      visualizar_diagnostico: true,
      visualizar_objetivos: true,
      visualizar_estrategias: true,
      visualizar_acoes: true,
      visualizar_indicadores: true,
      editar_objetivos: false,
      editar_estrategias: false,
      editar_acoes: false,
      editar_indicadores: false,
      comentar_todas_secoes: true
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: 'Erro',
        description: 'Email é obrigatório.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      await planoDiretorService.addColaborador(planoId, {
        email: formData.email,
        nome: formData.nome,
        tipoAtor: formData.tipoAtor,
        nivelAcesso: formData.nivelAcesso,
        permissoes: formData.permissoes
      });

      toast({
        title: 'Sucesso',
        description: 'Colaborador convidado com sucesso!',
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao convidar colaborador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível convidar o colaborador.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNivelAcessoChange = (nivel: 'visualizar' | 'editar' | 'aprovar') => {
    setFormData(prev => {
      const newPermissoes = { ...prev.permissoes };
      
      // Resetar permissões baseado no nível
      if (nivel === 'visualizar') {
        newPermissoes.editar_objetivos = false;
        newPermissoes.editar_estrategias = false;
        newPermissoes.editar_acoes = false;
        newPermissoes.editar_indicadores = false;
      } else if (nivel === 'editar') {
        newPermissoes.editar_objetivos = true;
        newPermissoes.editar_estrategias = true;
        newPermissoes.editar_acoes = true;
        newPermissoes.editar_indicadores = true;
      } else if (nivel === 'aprovar') {
        newPermissoes.editar_objetivos = true;
        newPermissoes.editar_estrategias = true;
        newPermissoes.editar_acoes = true;
        newPermissoes.editar_indicadores = true;
      }
      
      return {
        ...prev,
        nivelAcesso: nivel,
        permissoes: newPermissoes
      };
    });
  };

  const togglePermissao = (key: string) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [key]: !prev.permissoes[key as keyof typeof prev.permissoes]
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Convidar Colaborador</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="colaborador@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do colaborador"
              />
            </div>

            <div>
              <Label htmlFor="tipoAtor">Tipo de Ator (Opcional)</Label>
              <Input
                id="tipoAtor"
                value={formData.tipoAtor}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoAtor: e.target.value }))}
                placeholder="Ex: Consultor, Empresário, Sociedade Civil, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Campo flexível para identificar o tipo de colaborador
              </p>
            </div>

            <div>
              <Label htmlFor="nivelAcesso">Nível de Acesso *</Label>
              <Select
                value={formData.nivelAcesso}
                onValueChange={(value) => handleNivelAcessoChange(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visualizar">Visualizar</SelectItem>
                  <SelectItem value="editar">Editar</SelectItem>
                  <SelectItem value="aprovar">Aprovar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.nivelAcesso === 'visualizar' && 'Pode apenas visualizar o plano'}
                {formData.nivelAcesso === 'editar' && 'Pode editar todas as seções'}
                {formData.nivelAcesso === 'aprovar' && 'Pode editar e aprovar alterações'}
              </p>
            </div>

            <div className="border-t pt-4">
              <Label className="mb-3 block">Permissões Granulares</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Visualização</p>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-vis-diagnostico"
                        checked={formData.permissoes.visualizar_diagnostico}
                        onCheckedChange={() => togglePermissao('visualizar_diagnostico')}
                      />
                      <label htmlFor="perm-vis-diagnostico" className="text-sm">
                        Visualizar Diagnóstico
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-vis-objetivos"
                        checked={formData.permissoes.visualizar_objetivos}
                        onCheckedChange={() => togglePermissao('visualizar_objetivos')}
                      />
                      <label htmlFor="perm-vis-objetivos" className="text-sm">
                        Visualizar Objetivos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-vis-estrategias"
                        checked={formData.permissoes.visualizar_estrategias}
                        onCheckedChange={() => togglePermissao('visualizar_estrategias')}
                      />
                      <label htmlFor="perm-vis-estrategias" className="text-sm">
                        Visualizar Estratégias
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-vis-acoes"
                        checked={formData.permissoes.visualizar_acoes}
                        onCheckedChange={() => togglePermissao('visualizar_acoes')}
                      />
                      <label htmlFor="perm-vis-acoes" className="text-sm">
                        Visualizar Ações
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-vis-indicadores"
                        checked={formData.permissoes.visualizar_indicadores}
                        onCheckedChange={() => togglePermissao('visualizar_indicadores')}
                      />
                      <label htmlFor="perm-vis-indicadores" className="text-sm">
                        Visualizar Indicadores
                      </label>
                    </div>
                  </div>
                </div>

                {formData.nivelAcesso !== 'visualizar' && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Edição</p>
                    <div className="space-y-2 pl-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm-edit-objetivos"
                          checked={formData.permissoes.editar_objetivos}
                          onCheckedChange={() => togglePermissao('editar_objetivos')}
                        />
                        <label htmlFor="perm-edit-objetivos" className="text-sm">
                          Editar Objetivos
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm-edit-estrategias"
                          checked={formData.permissoes.editar_estrategias}
                          onCheckedChange={() => togglePermissao('editar_estrategias')}
                        />
                        <label htmlFor="perm-edit-estrategias" className="text-sm">
                          Editar Estratégias
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm-edit-acoes"
                          checked={formData.permissoes.editar_acoes}
                          onCheckedChange={() => togglePermissao('editar_acoes')}
                        />
                        <label htmlFor="perm-edit-acoes" className="text-sm">
                          Editar Ações
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm-edit-indicadores"
                          checked={formData.permissoes.editar_indicadores}
                          onCheckedChange={() => togglePermissao('editar_indicadores')}
                        />
                        <label htmlFor="perm-edit-indicadores" className="text-sm">
                          Editar Indicadores
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Comentários</p>
                  <div className="pl-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-comentar"
                        checked={formData.permissoes.comentar_todas_secoes}
                        onCheckedChange={() => togglePermissao('comentar_todas_secoes')}
                      />
                      <label htmlFor="perm-comentar" className="text-sm">
                        Comentar em todas as seções
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Enviando convite...' : 'Enviar Convite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConvidarColaboradorModal;

