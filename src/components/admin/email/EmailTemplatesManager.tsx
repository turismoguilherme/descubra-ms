/**
 * Email Templates Manager Component
 * Gerencia templates de email - similar ao PantanalAvatarsManager
 * Permite criar, editar, ativar/desativar e deletar templates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Edit, Trash2, FileText, Save, X, Mail, 
  CheckCircle, AlertCircle, Loader2, Copy
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface EmailTemplate {
  id: string;
  name: string;
  channel: 'email';
  subject_template: string | null;
  body_template: string;
  variables_json: any;
  purpose: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplatesManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    subject_template: '',
    body_template: '',
    purpose: '',
    variables_json: {} as any,
    is_active: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('channel', 'email')
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: 'Erro ao carregar templates',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject_template: '',
      body_template: '',
      purpose: '',
      variables_json: {},
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject_template: template.subject_template || '',
      body_template: template.body_template,
      purpose: template.purpose || '',
      variables_json: template.variables_json || {},
      is_active: template.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.body_template) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Nome e corpo do template são obrigatórios',
          variant: 'destructive',
        });
        return;
      }

      const templateData = {
        name: formData.name,
        channel: 'email' as const,
        subject_template: formData.subject_template || null,
        body_template: formData.body_template,
        purpose: formData.purpose || null,
        variables_json: formData.variables_json,
        is_active: formData.is_active,
        created_by: editingTemplate ? undefined : user?.id || null,
        updated_at: new Date().toISOString(),
      };

      if (editingTemplate) {
        // Atualizar template existente
        const { error } = await supabase
          .from('message_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: 'Template atualizado',
          description: 'Template de email atualizado com sucesso!',
        });
      } else {
        // Criar novo template
        const { error } = await supabase
          .from('message_templates')
          .insert(templateData);

        if (error) throw error;

        toast({
          title: 'Template criado',
          description: 'Novo template de email criado com sucesso!',
        });
      }

      setDialogOpen(false);
      loadTemplates();
    } catch (error: any) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: 'Erro ao salvar template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: template.is_active ? 'Template desativado' : 'Template ativado',
        description: `Template "${template.name}" foi ${template.is_active ? 'desativado' : 'ativado'}`,
      });

      loadTemplates();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateToDelete.id);

      if (error) throw error;

      toast({
        title: 'Template deletado',
        description: `Template "${templateToDelete.name}" foi deletado`,
      });

      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      loadTemplates();
    } catch (error: any) {
      console.error('Erro ao deletar template:', error);
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const copyTemplate = (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (cópia)`,
      subject_template: template.subject_template || '',
      body_template: template.body_template,
      purpose: template.purpose || '',
      variables_json: template.variables_json || {},
      is_active: false,
    });
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Templates de Email</h2>
          <p className="text-gray-600">Crie e edite templates para uso em emails</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Templates List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Carregando templates...</p>
          </CardContent>
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Nenhum template criado ainda</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      {template.name}
                    </CardTitle>
                    {template.purpose && (
                      <CardDescription className="mt-1">{template.purpose}</CardDescription>
                    )}
                  </div>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.subject_template && (
                    <div>
                      <Label className="text-xs text-gray-500">Assunto:</Label>
                      <p className="text-sm font-medium truncate">{template.subject_template}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-xs text-gray-500">Corpo:</Label>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {template.body_template}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => handleToggleActive(template)}
                    />
                    <span className="text-xs text-gray-600">
                      {template.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(template)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(template)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Template *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Boas-vindas, Confirmação de Evento, etc."
              />
            </div>

            <div>
              <Label htmlFor="purpose">Propósito (opcional)</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Descreva quando usar este template"
              />
            </div>

            <div>
              <Label htmlFor="subject_template">Assunto do Email (opcional)</Label>
              <Input
                id="subject_template"
                value={formData.subject_template}
                onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                placeholder="Assunto do email"
              />
              <p className="text-xs text-gray-500 mt-1">
                Você pode usar variáveis como {'{'}nome{'}'}, {'{'}evento{'}'}, etc.
              </p>
            </div>

            <div>
              <Label htmlFor="body_template">Corpo do Email *</Label>
              <Textarea
                id="body_template"
                value={formData.body_template}
                onChange={(e) => setFormData(prev => ({ ...prev, body_template: e.target.value }))}
                rows={12}
                placeholder="Digite o conteúdo do template. Use variáveis como {nome}, {evento}, {data}, etc."
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Variáveis disponíveis: {'{'}nome{'}'}, {'{'}email{'}'}, {'{'}evento{'}'}, {'{'}data{'}'}, {'{'}local{'}'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Template ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Tem certeza que deseja deletar o template <strong>"{templateToDelete?.name}"</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

