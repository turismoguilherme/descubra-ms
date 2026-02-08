/**
 * Email Dashboard Component
 * Dashboard completo para gerenciamento de emails no Admin
 *
 * Funcionalidades:
 * - Ver emails recebidos (communication_logs)
 * - Responder emails diretamente
 * - Histórico de emails enviados
 * - Envio manual de emails
 * - Reenvio de emails falhados
 * - Templates de email
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmailTemplatesManager from './EmailTemplatesManager';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendNotificationEmail } from '@/services/email/notificationEmailService';
import {
  Mail,
  Send,
  Inbox,
  Reply,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  FileText,
  Users,
  Settings,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmailMessage {
  id: string;
  direction: 'in' | 'out';
  channel: 'email';
  from_address: string;
  to_address: string;
  subject_or_topic: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'received' | 'failed' | 'processing';
  related_ticket_id?: string;
  ai_generated_response?: boolean;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject_template: string;
  body_template: string;
  variables_json: unknown;
  purpose: string;
  is_active: boolean;
}

const EmailDashboard: React.FC = () => {
  // Estados principais
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [errorLogs, setErrorLogs] = useState<EmailMessage[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');

  // Estados para composição de email
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
    templateId: ''
  });

  // Estados para resposta
  const [replyData, setReplyData] = useState({
    subject: '',
    body: ''
  });

  useEffect(() => {
    loadEmails();
    loadTemplates();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEmails(data || []);
      
      // Carregar logs de erros separadamente
      const failedEmails = (data || []).filter(email => email.status === 'failed');
      setErrorLogs(failedEmails);
    } catch (error: unknown) {
      console.error('Erro ao carregar emails:', error);
      toast.error('Erro ao carregar emails');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('channel', 'email')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: unknown) {
      console.error('Erro ao carregar templates:', error);
      toast.error('Erro ao carregar templates de email');
    }
  };

  const sendEmail = async (emailData: { to: string; subject: string; body: string }) => {
    try {
      // Usar a função existente de envio de email
      const result = await sendNotificationEmail({
        type: 'partner_notification', // Tipo genérico para emails manuais
        to: emailData.to,
        data: {
          title: emailData.subject,
          message: emailData.body,
          type: 'manual_email'
        }
      });

      if (result.success) {
        toast.success('Email enviado com sucesso!');

        // Recarregar emails
        loadEmails();

        // Limpar formulário
        setComposeData({ to: '', subject: '', body: '', templateId: '' });
        setShowComposeDialog(false);
      } else {
        toast.error(`Erro ao enviar: ${result.error}`);
      }
    } catch (error: unknown) {
      console.error('Erro ao enviar email:', error);
      toast.error('Erro ao enviar email');
    }
  };

  const replyToEmail = async (originalEmail: EmailMessage, replyData: { subject: string; body: string }) => {
    try {
      // Para respostas, configurar reply_to como o endereço original (para manter thread)
      // Isso garante que quando o destinatário responder, volte para o email original
      const result = await sendNotificationEmail({
        type: 'partner_notification',
        to: originalEmail.from_address,
        reply_to: originalEmail.to_address || undefined, // Reply-to para manter a thread
        data: {
          title: replyData.subject,
          message: replyData.body,
          type: 'email_reply',
          originalSubject: originalEmail.subject_or_topic
        }
      });

      if (result.success) {
        toast.success('Resposta enviada com sucesso!');

        // Recarregar emails
        loadEmails();

        // Fechar dialog
        setShowReplyDialog(false);
        setSelectedEmail(null);
        setReplyData({ subject: '', body: '' });
      } else {
        toast.error(`Erro ao enviar resposta: ${result.error}`);
      }
    } catch (error: unknown) {
      console.error('Erro ao enviar resposta:', error);
      toast.error('Erro ao enviar resposta');
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Aplicar template com variáveis básicas substituídas
      const subject = template.subject_template || '';
      const body = template.body_template || '';

      // Substituir variáveis básicas (pode ser expandido depois)
      // Por enquanto, apenas aplicar o template como está
      // Variáveis serão substituídas quando o email for enviado

      setComposeData(prev => ({
        ...prev,
        subject: subject,
        body: body
      }));

      toast({
        title: 'Template aplicado',
        description: `Template "${template.name}" aplicado com sucesso`,
      });
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch =
      email.subject_or_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.to_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    const matchesDirection = directionFilter === 'all' || email.direction === directionFilter;

    return matchesSearch && matchesStatus && matchesDirection;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'received':
        return <Inbox className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'in' ? <Inbox className="h-4 w-4" /> : <Send className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Tabs para Emails e Templates */}
      <Tabs defaultValue="emails" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard de Emails</h2>
            <p className="text-gray-600">Gerencie emails recebidos, enviados e responda diretamente</p>
          </div>
          <TabsList>
            <TabsTrigger value="emails">
              <Mail className="h-4 w-4 mr-2" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="errors">
              <AlertCircle className="h-4 w-4 mr-2" />
              Erros
              {errorLogs.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {errorLogs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Emails */}
        <TabsContent value="emails" className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={loadEmails}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Compor Novo Email</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template">Template (opcional)</Label>
                      <Select 
                        value={composeData.templateId} 
                        onValueChange={(value) => {
                          setComposeData(prev => ({ ...prev, templateId: value }));
                          applyTemplate(value);
                        }}
                      >
                        <SelectTrigger id="template" className="w-full">
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]" position="popper">
                          {templates.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500">
                              Nenhum template disponível
                            </div>
                          ) : (
                            templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {composeData.templateId && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-xs"
                          onClick={() => {
                            setComposeData(prev => ({ ...prev, templateId: '' }));
                          }}
                        >
                          Limpar template
                        </Button>
                      )}
                    </div>

                <div>
                  <Label htmlFor="to">Para</Label>
                  <Input
                    id="to"
                    type="email"
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="exemplo@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Assunto do email"
                  />
                </div>

                <div>
                  <Label htmlFor="body">Mensagem</Label>
                  <Textarea
                    id="body"
                    value={composeData.body}
                    onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                    rows={8}
                    placeholder="Digite sua mensagem..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => sendEmail(composeData)}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Inbox className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recebidos</p>
                <p className="text-2xl font-bold">{emails.filter(e => e.direction === 'in').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-2xl font-bold">{emails.filter(e => e.direction === 'out').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Falhas</p>
                <p className="text-2xl font-bold">{emails.filter(e => e.status === 'failed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{emails.filter(e => e.status === 'processing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Filtros e Busca */}
          <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[10000]">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in">Recebidos</SelectItem>
                  <SelectItem value="out">Enviados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[10000]">
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="received">Recebido</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Lista de Emails */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emails ({filteredEmails.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Carregando emails...
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum email encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getDirectionIcon(email.direction)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {email.subject_or_topic || '(Sem assunto)'}
                          </p>
                          {getStatusIcon(email.status)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            {email.direction === 'in' ? 'De:' : 'Para:'}
                            {email.direction === 'in' ? email.from_address : email.to_address}
                          </span>
                          <span>
                            {format(new Date(email.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {email.body}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {email.direction === 'in' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmail(email);
                            setReplyData({
                              subject: `Re: ${email.subject_or_topic}`,
                              body: `\n\n--- Em ${format(new Date(email.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}, ${email.from_address} escreveu:\n${email.body}`
                            });
                            setShowReplyDialog(true);
                          }}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                      )}

                      <Badge variant={email.status === 'failed' ? 'destructive' : 'secondary'}>
                        {email.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

          {/* Dialog de Visualização de Email */}
          {selectedEmail && !showReplyDialog && (
        <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getDirectionIcon(selectedEmail.direction)}
                {selectedEmail.subject_or_topic || '(Sem assunto)'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">De:</Label>
                  <p className="text-gray-600">{selectedEmail.from_address}</p>
                </div>
                <div>
                  <Label className="font-medium">Para:</Label>
                  <p className="text-gray-600">{selectedEmail.to_address}</p>
                </div>
                <div>
                  <Label className="font-medium">Data:</Label>
                  <p className="text-gray-600">
                    {format(new Date(selectedEmail.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Status:</Label>
                  <Badge variant={selectedEmail.status === 'failed' ? 'destructive' : 'secondary'}>
                    {selectedEmail.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="font-medium">Mensagem:</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {selectedEmail.direction === 'in' && (
                  <Button
                    onClick={() => {
                      setReplyData({
                        subject: `Re: ${selectedEmail.subject_or_topic}`,
                        body: `\n\n--- Em ${format(new Date(selectedEmail.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}, ${selectedEmail.from_address} escreveu:\n${selectedEmail.body}`
                      });
                      setShowReplyDialog(true);
                    }}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
                )}

                <Button variant="outline" onClick={() => setSelectedEmail(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

          {/* Dialog de Resposta */}
          <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Responder Email</DialogTitle>
          </DialogHeader>

          {selectedEmail && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Respondendo para: <strong>{selectedEmail.from_address}</strong>
              </div>

              <div>
                <Label htmlFor="reply-subject">Assunto</Label>
                <Input
                  id="reply-subject"
                  value={replyData.subject}
                  onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="reply-body">Mensagem</Label>
                <Textarea
                  id="reply-body"
                  value={replyData.body}
                  onChange={(e) => setReplyData(prev => ({ ...prev, body: e.target.value }))}
                  rows={10}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => replyToEmail(selectedEmail, replyData)}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Resposta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Tab: Erros */}
        <TabsContent value="errors" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Logs de Erros</h3>
              <p className="text-gray-600">Emails que falharam ao enviar ou receber</p>
            </div>
            <Button
              onClick={loadEmails}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Carregando logs de erros...</p>
              </CardContent>
            </Card>
          ) : errorLogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-gray-600 mb-2">Nenhum erro encontrado!</p>
                <p className="text-sm text-gray-500">Todos os emails estão funcionando corretamente.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {errorLogs.map((email) => (
                <Card key={email.id} className="border-red-200 bg-red-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <CardTitle className="text-lg">Erro: {email.subject_or_topic || 'Sem assunto'}</CardTitle>
                          <Badge variant="destructive">Falhou</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>De:</strong> {email.from_address}
                          </p>
                          <p>
                            <strong>Para:</strong> {email.to_address}
                          </p>
                          <p>
                            <strong>Direção:</strong> {email.direction === 'in' ? 'Recebido' : 'Enviado'}
                          </p>
                          <p>
                            <strong>Data/Hora:</strong> {format(new Date(email.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Mensagem de Erro:</Label>
                      <div className="bg-white border border-red-200 rounded-md p-3 text-sm">
                        {email.body && email.body.length > 500 ? (
                          <>
                            {email.body.substring(0, 500)}
                            <span className="text-gray-500">... (truncado)</span>
                          </>
                        ) : (
                          email.body || 'Nenhuma mensagem de erro disponível'
                        )}
                      </div>
                      {email.direction === 'out' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Tentar reenviar o email
                            sendEmail({
                              to: email.to_address,
                              subject: email.subject_or_topic || '',
                              body: email.body
                            });
                          }}
                          className="mt-2"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Tentar Reenviar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Templates */}
        <TabsContent value="templates">
          <EmailTemplatesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailDashboard;
