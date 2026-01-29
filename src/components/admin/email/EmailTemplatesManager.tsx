// @ts-nocheck
/**
 * Email Templates Manager Component
 * Gerencia templates de email - similar ao PantanalAvatarsManager
 * Permite criar, editar, ativar/desativar e deletar templates
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Edit, Trash2, FileText, Save, X, Mail, 
  CheckCircle, AlertCircle, Loader2, Copy, Eye, Hash
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EmailTemplate {
  id: string;
  name: string;
  channel: 'email';
  subject_template: string | null;
  body_template: string;
  variables_json: unknown;
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
  const [showPreview, setShowPreview] = useState(false); // Preview visual do email
  const quillRef = useRef<any>(null); // Ref para o editor Quill

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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar templates:', err);
      toast({
        title: 'Erro ao carregar templates',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setShowPreview(false); // Reset preview
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
    setShowPreview(false); // Reset preview
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

  // Validar conteúdo básico (simplificado - o Quill já valida HTML)
  const validateContent = (content: string): { valid: boolean; error?: string } => {
    if (!content || !content.trim() || content.trim() === '<p><br></p>') {
      return { valid: false, error: 'O corpo do email não pode estar vazio' };
    }
    return { valid: true };
  };

  // Extrair variáveis do template
  const extractVariables = (text: string): string[] => {
    if (!text) return [];
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.matchAll(regex);
    const variables = Array.from(matches, m => m[1]);
    return [...new Set(variables)]; // Remove duplicatas
  };

  // Variáveis comuns disponíveis
  const commonVariables = ['nome', 'email', 'evento', 'organizerName', 'eventName', 'eventDate', 'eventLocation', 'partnerName'];

  // Inserir variável no editor
  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      editor.insertText(range.index, variable);
      editor.setSelection(range.index + variable.length);
    } else {
      // Fallback: adicionar ao final do conteúdo
      const currentContent = formData.body_template || '';
      setFormData(prev => ({
        ...prev,
        body_template: currentContent + variable
      }));
    }
  };

  // Configuração do editor Quill (simplificado)
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link'],
        ['clean']
      ],
    },
  }), []);

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

      // Validar conteúdo
      const contentValidation = validateContent(formData.body_template);
      if (!contentValidation.valid) {
        toast({
          title: 'Conteúdo inválido',
          description: contentValidation.error || 'O corpo do email não pode estar vazio',
          variant: 'destructive',
        });
        return;
      }

      // Extrair e armazenar variáveis detectadas
      const subjectVars = extractVariables(formData.subject_template);
      const bodyVars = extractVariables(formData.body_template);
      const allVariables = [...new Set([...subjectVars, ...bodyVars])];
      
      // Informar ao usuário sobre variáveis detectadas
      if (allVariables.length > 0) {
        console.log('Variáveis detectadas no template:', allVariables);
      }

      const templateData = {
        name: formData.name,
        channel: 'email' as const,
        subject_template: formData.subject_template || null,
        body_template: formData.body_template,
        purpose: formData.purpose || null,
        // Armazenar variáveis detectadas automaticamente
        variables_json: {
          ...formData.variables_json,
          detected_variables: allVariables,
        },
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
      setShowPreview(false); // Reset preview
      loadTemplates();
      
      // Mostrar variáveis detectadas
      if (allVariables.length > 0) {
        toast({
          title: 'Template salvo',
          description: `Variáveis detectadas: ${allVariables.join(', ')}`,
        });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar template:', err);
      toast({
        title: 'Erro ao salvar template',
        description: err.message,
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao alterar status:', err);
      toast({
        title: 'Erro',
        description: err.message,
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao deletar template:', err);
      toast({
        title: 'Erro ao deletar',
        description: err.message,
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

            {/* Mostrar variáveis detectadas */}
            {(extractVariables(formData.body_template).length > 0 || extractVariables(formData.subject_template).length > 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <Label className="text-sm font-medium text-blue-900">Variáveis detectadas no template:</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[...new Set([...extractVariables(formData.subject_template), ...extractVariables(formData.body_template)])].map((variable) => (
                    <Badge key={variable} variant="secondary" className="bg-blue-100 text-blue-800">
                      {'{'} {'{'}{'}'}{variable}{'}'} {'}'}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Estas variáveis serão substituídas automaticamente quando o email for enviado.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="subject_template">Assunto do Email (opcional)</Label>
              <Input
                id="subject_template"
                value={formData.subject_template}
                onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                placeholder="Assunto do email"
              />
              <p className="text-xs text-gray-500 mt-1">
                Você pode usar variáveis como {'{'} {'{'}{'}'}nome{'}'} {'}'}, {'{'} {'{'}{'}'}evento{'}'} {'}'}, {'{'} {'{'}{'}'}organizerName{'}'} {'}'}, etc.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="body_template">Corpo do Email *</Label>
                <Button
                  type="button"
                  variant={showPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
                </Button>
              </div>

              {!showPreview ? (
                <div className="space-y-2">
                  {/* Botões de variáveis */}
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
                    <span className="text-xs font-medium text-gray-700 flex items-center mr-2">
                      <Hash className="h-3 w-3 mr-1" />
                      Inserir variável:
                    </span>
                    {commonVariables.map((varName) => (
                      <Button
                        key={varName}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(varName)}
                        className="text-xs h-7"
                      >
                        {'{'}{'{'}{'}'}{varName}{'}'}{'}'}
                      </Button>
                    ))}
                  </div>

                  {/* Editor visual WYSIWYG */}
                  <div className="border rounded-md bg-white">
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={formData.body_template}
                      onChange={(content) => setFormData(prev => ({ ...prev, body_template: content }))}
                      modules={quillModules}
                      placeholder="Digite o conteúdo do email aqui... Use os botões acima para inserir variáveis."
                      style={{
                        minHeight: '300px',
                        maxHeight: '400px',
                      }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    💡 Dica: Use a barra de ferramentas para formatar o texto. Clique nos botões acima para inserir variáveis como {'{'}{'{'}{'}'}nome{'}'}{'}'}.
                  </p>
                </div>
              ) : (
                <div className="border rounded-md bg-white">
                  <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Preview do Email</span>
                    <span className="text-xs text-gray-500">Tamanho: {formData.body_template.replace(/<[^>]*>/g, '').length} caracteres</span>
                  </div>
                  <div className="p-4 bg-gray-50 min-h-[400px] max-h-[600px] overflow-auto">
                    {formData.body_template && formData.body_template.trim() !== '<p><br></p>' ? (
                      <>
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: formData.body_template
                              // Mostrar variáveis como placeholders visuais no preview
                              .replace(/\{\{(\w+)\}\}/g, '<span style="background: #fef3c7; padding: 2px 6px; border-radius: 3px; font-weight: 600; color: #92400e;">{$1}</span>')
                          }}
                          style={{
                            maxWidth: '600px',
                            margin: '0 auto',
                            background: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        />
                        {extractVariables(formData.body_template).length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md max-w-[600px] mx-auto">
                            <p className="text-xs text-blue-800">
                              <strong>Nota:</strong> As variáveis destacadas em amarelo serão substituídas por valores reais quando o email for enviado.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-400 py-20">
                        <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum conteúdo para preview</p>
                        <p className="text-xs mt-1">Escreva no editor para ver o preview</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

