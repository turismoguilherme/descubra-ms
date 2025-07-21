
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SecretaryFile } from "@/types/municipal";
import { TablesInsert } from '@/integrations/supabase/types';

interface FileManagerProps {
  cityId: string;
}

const FileManager = ({ cityId }: FileManagerProps) => {
  const [files, setFiles] = useState<SecretaryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  // Novo estado para controlar o tipo de entrada (arquivo ou dados estruturados)
  const [entryType, setEntryType] = useState<'file' | 'event' | 'destination' | 'feedback'>('file');

  // Formulário de upload de arquivos
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    category: "geral",
    description: "",
    isPublic: false
  });

  // Formulário de Novo Evento
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: '',
    price: 0,
    capacity: 0,
    status: 'upcoming',
    organizer: '',
    contactInfo: '',
    images: [] as string[],
    tags: [] as string[],
  });

  // Formulário de Nova Atração/Destino
  const [destinationForm, setDestinationForm] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    category: '',
    rating: 0,
    priceRange: '',
    images: [] as string[],
    availabilityInfo: '',
    accessibilityFeatures: [] as string[],
    contactPhone: '',
    contactEmail: '',
    website: '',
    openingHours: '',
    capacity: 0,
  });

  // Formulário de Novo Feedback
  const [feedbackForm, setFeedbackForm] = useState({
    feedbackType: 'geral',
    content: '',
    sentiment: 'neutral',
  });

  const fetchFiles = useCallback(async () => {
    if (!cityId) return;
    try {
      const { data, error } = await supabase
        .from('secretary_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Add city_id to each file for type compatibility
      const filesWithCityId = (data || []).map(file => ({
        ...file,
        city_id: cityId || ''
      }));
      setFiles(filesWithCityId);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar arquivos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [cityId, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Upload do arquivo para o Storage
      const fileName = `${Date.now()}-${uploadForm.file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('secretary-documents')
        .upload(fileName, uploadForm.file);

      if (uploadError) throw uploadError;

      // Salvar informações no banco
      const fileData = {
        filename: fileName,
        original_name: uploadForm.file.name,
        file_path: uploadData.path,
        file_size: uploadForm.file.size,
        mime_type: uploadForm.file.type,
        file_type: getFileType(uploadForm.file.type),
        category: uploadForm.category,
        description: uploadForm.description,
        city_id: cityId, // Associa ao cityId
        is_public: uploadForm.isPublic,
        uploaded_by: user.id,
        uploader_name: user.email
      };

      const { error: insertError } = await supabase
        .from('secretary_files')
        .insert([fileData]);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!",
      });

      // Reset form
      setUploadForm({
        file: null,
        category: "geral",
        description: "",
        isPublic: false
      });

      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const eventData: TablesInsert<'tourism_events_data'> = {
        name: eventForm.name,
        description: eventForm.description,
        start_date: eventForm.startDate,
        end_date: eventForm.endDate || null,
        location: eventForm.location,
        category: eventForm.category,
        price: eventForm.price,
        capacity: eventForm.capacity,
        status: eventForm.status,
        organizer: eventForm.organizer,
        contact_info: eventForm.contactInfo,
        images: eventForm.images,
        tags: eventForm.tags,
        city_id: cityId,
        uploaded_by: user.id,
      };

      const { error: insertError } = await supabase
        .from('tourism_events_data')
        .insert([eventData]);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Evento registrado com sucesso!",
      });

      // Reset form
      setEventForm({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        category: '',
        price: 0,
        capacity: 0,
        status: 'upcoming',
        organizer: '',
        contactInfo: '',
        images: [] as string[],
        tags: [] as string[],
      });
      // Não refetch files, pois são dados de tabelas diferentes

    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar evento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const destinationData: TablesInsert<'tourism_destinations_data'> = {
        name: destinationForm.name,
        description: destinationForm.description,
        latitude: parseFloat(destinationForm.latitude),
        longitude: parseFloat(destinationForm.longitude),
        address: destinationForm.address,
        city_id: cityId,
        category: destinationForm.category,
        rating: destinationForm.rating,
        price_range: destinationForm.priceRange,
        images: destinationForm.images,
        availability_info: destinationForm.availabilityInfo,
        accessibility_features: destinationForm.accessibilityFeatures,
        contact_phone: destinationForm.contactPhone,
        contact_email: destinationForm.contactEmail,
        website: destinationForm.website,
        opening_hours: destinationForm.openingHours,
        capacity: destinationForm.capacity,
        uploaded_by: user.id,
      };

      const { error: insertError } = await supabase
        .from('tourism_destinations_data')
        .insert([destinationData]);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Atração/Destino registrado com sucesso!",
      });

      // Reset form
      setDestinationForm({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        category: '',
        rating: 0,
        priceRange: '',
        images: [] as string[],
        availabilityInfo: '',
        accessibilityFeatures: [] as string[],
        contactPhone: '',
        contactEmail: '',
        website: '',
        openingHours: '',
        capacity: 0,
      });

    } catch (error) {
      console.error('Error saving destination:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar atração/destino",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const feedbackData: TablesInsert<'tourism_feedback_data'> = {
        feedback_type: feedbackForm.feedbackType,
        content: feedbackForm.content,
        sentiment: feedbackForm.sentiment,
        city_id: cityId,
        user_id: user.id,
      };

      const { error: insertError } = await supabase
        .from('tourism_feedback_data')
        .insert([feedbackData]);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Feedback/Relatório registrado com sucesso!",
      });

      // Reset form
      setFeedbackForm({
        feedbackType: 'geral',
        content: '',
        sentiment: 'neutral',
      });

    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar feedback/relatório",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileId: string, filePath: string) => {
    try {
      // Deletar do Storage
      const { error: storageError } = await supabase.storage
        .from('secretary-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('secretary_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Arquivo deletado com sucesso!",
      });

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar arquivo",
        variant: "destructive",
      });
    }
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
    if (mimeType.includes('csv')) return 'csv';
    return 'other';
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || file.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Seletor de Tipo de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="entry-type">Tipo de Entrada</Label>
          <Select value={entryType} onValueChange={(value: 'file' | 'event' | 'destination' | 'feedback') => setEntryType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar tipo de entrada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="file">Upload de Arquivo</SelectItem>
              <SelectItem value="event">Novo Evento</SelectItem>
              <SelectItem value="destination">Nova Atração/Destino</SelectItem>
              <SelectItem value="feedback">Novo Feedback/Relatório</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Upload de Arquivos */}
      {entryType === 'file' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Enviar Novo Arquivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadForm({
                    ...uploadForm,
                    file: e.target.files?.[0] || null
                  })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={uploadForm.category} 
                  onValueChange={(value) => setUploadForm({...uploadForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="turismo">Turismo</SelectItem>
                    <SelectItem value="eventos">Eventos</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Descreva o arquivo..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={uploadForm.isPublic}
                  onChange={(e) => setUploadForm({...uploadForm, isPublic: e.target.checked})}
                />
                <Label htmlFor="isPublic">Tornar público</Label>
              </div>

              <Button type="submit" disabled={uploading || !uploadForm.file}>
                {uploading ? "Enviando..." : "Enviar Arquivo"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Novo Evento */}
      {entryType === 'event' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Registrar Novo Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Campos do formulário de evento */}
              <div>
                <Label htmlFor="eventName">Nome do Evento</Label>
                <Input
                  id="eventName"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  placeholder="Nome do Evento"
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventDescription">Descrição</Label>
                <Textarea
                  id="eventDescription"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Descreva o evento..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventStartDate">Data de Início</Label>
                  <Input
                    id="eventStartDate"
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="eventEndDate">Data de Fim</Label>
                  <Input
                    id="eventEndDate"
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="eventLocation">Local</Label>
                <Input
                  id="eventLocation"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Local do evento"
                />
              </div>
              <div>
                <Label htmlFor="eventCategory">Categoria</Label>
                <Select
                  value={eventForm.category}
                  onValueChange={(value) => setEventForm({ ...eventForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="esportivo">Esportivo</SelectItem>
                    <SelectItem value="gastronomico">Gastronômico</SelectItem>
                    <SelectItem value="negocios">Negócios</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventPrice">Preço</Label>
                  <Input
                    id="eventPrice"
                    type="number"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="eventCapacity">Capacidade Máxima</Label>
                  <Input
                    id="eventCapacity"
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) })}
                    placeholder="100"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="eventOrganizer">Organizador</Label>
                <Input
                  id="eventOrganizer"
                  value={eventForm.organizer}
                  onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                  placeholder="Nome do organizador"
                />
              </div>
              <div>
                <Label htmlFor="eventContactInfo">Informações de Contato</Label>
                <Input
                  id="eventContactInfo"
                  value={eventForm.contactInfo}
                  onChange={(e) => setEventForm({ ...eventForm, contactInfo: e.target.value })}
                  placeholder="Telefone, e-mail, website..."
                />
              </div>
              {/* Botão de envio para evento, será conectado a uma função `handleSubmitEvent` */}
              <Button type="submit" onClick={handleSubmitEvent} disabled={uploading}>
                Registrar Evento
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Nova Atração/Destino */}
      {entryType === 'destination' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Registrar Nova Atração/Destino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Campos do formulário de destino */}
              <div>
                <Label htmlFor="destinationName">Nome da Atração/Destino</Label>
                <Input
                  id="destinationName"
                  value={destinationForm.name}
                  onChange={(e) => setDestinationForm({ ...destinationForm, name: e.target.value })}
                  placeholder="Nome da Atração"
                  required
                />
              </div>
              <div>
                <Label htmlFor="destinationDescription">Descrição</Label>
                <Textarea
                  id="destinationDescription"
                  value={destinationForm.description}
                  onChange={(e) => setDestinationForm({ ...destinationForm, description: e.target.value })}
                  placeholder="Descreva a atração..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinationLatitude">Latitude</Label>
                  <Input
                    id="destinationLatitude"
                    type="text"
                    value={destinationForm.latitude}
                    onChange={(e) => setDestinationForm({ ...destinationForm, latitude: e.target.value })}
                    placeholder="-20.4673"
                  />
                </div>
                <div>
                  <Label htmlFor="destinationLongitude">Longitude</Label>
                  <Input
                    id="destinationLongitude"
                    type="text"
                    value={destinationForm.longitude}
                    onChange={(e) => setDestinationForm({ ...destinationForm, longitude: e.target.value })}
                    placeholder="-54.6426"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="destinationAddress">Endereço</Label>
                <Input
                  id="destinationAddress"
                  value={destinationForm.address}
                  onChange={(e) => setDestinationForm({ ...destinationForm, address: e.target.value })}
                  placeholder="Rua, número, bairro..."
                />
              </div>
              <div>
                <Label htmlFor="destinationCategory">Categoria</Label>
                <Select
                  value={destinationForm.category}
                  onValueChange={(value) => setDestinationForm({ ...destinationForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natureza">Natureza</SelectItem>
                    <SelectItem value="historico">Histórico</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="gastronomia">Gastronomia</SelectItem>
                    <SelectItem value="lazer">Lazer</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="destinationRating">Avaliação (0-5)</Label>
                <Input
                  id="destinationRating"
                  type="number"
                  value={destinationForm.rating}
                  onChange={(e) => setDestinationForm({ ...destinationForm, rating: parseFloat(e.target.value) })}
                  min="0" max="5" step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="destinationPriceRange">Faixa de Preço</Label>
                <Input
                  id="destinationPriceRange"
                  value={destinationForm.priceRange}
                  onChange={(e) => setDestinationForm({ ...destinationForm, priceRange: e.target.value })}
                  placeholder="Grátis, R$50-100, etc."
                />
              </div>
              <div>
                <Label htmlFor="destinationAvailabilityInfo">Informações de Disponibilidade</Label>
                <Textarea
                  id="destinationAvailabilityInfo"
                  value={destinationForm.availabilityInfo}
                  onChange={(e) => setDestinationForm({ ...destinationForm, availabilityInfo: e.target.value })}
                  placeholder="Ex: Aberto diariamente, Finais de semana, Necessita agendamento..."
                />
              </div>
              <div>
                <Label htmlFor="destinationOpeningHours">Horário de Funcionamento</Label>
                <Input
                  id="destinationOpeningHours"
                  value={destinationForm.openingHours}
                  onChange={(e) => setDestinationForm({ ...destinationForm, openingHours: e.target.value })}
                  placeholder="Seg-Sex: 9h-18h, Sab-Dom: 10h-17h"
                />
              </div>
              <div>
                <Label htmlFor="destinationCapacity">Capacidade (se aplicável)</Label>
                <Input
                  id="destinationCapacity"
                  type="number"
                  value={destinationForm.capacity}
                  onChange={(e) => setDestinationForm({ ...destinationForm, capacity: parseInt(e.target.value) })}
                  placeholder="Ex: 50 pessoas"
                />
              </div>
              <Button type="submit" onClick={handleSubmitDestination} disabled={uploading}>
                Registrar Atração/Destino
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Novo Feedback/Relatório */}
      {entryType === 'feedback' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Registrar Novo Feedback/Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Campos do formulário de feedback */}
              <div>
                <Label htmlFor="feedbackContent">Conteúdo do Feedback/Relatório</Label>
                <Textarea
                  id="feedbackContent"
                  value={feedbackForm.content}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                  placeholder="Descreva o feedback ou relatório em detalhes..."
                  required
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="feedbackType">Tipo de Feedback</Label>
                <Select
                  value={feedbackForm.feedbackType}
                  onValueChange={(value) => setFeedbackForm({ ...feedbackForm, feedbackType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de feedback" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="experiencia">Experiência</SelectItem>
                    <SelectItem value="sugestao">Sugestão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" onClick={handleSubmitFeedback} disabled={uploading}>
                Registrar Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Arquivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Arquivos da Secretaria
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar arquivos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="turismo">Turismo</SelectItem>
                <SelectItem value="eventos">Eventos</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Carregando arquivos...
                    </TableCell>
                  </TableRow>
                ) : filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Nenhum arquivo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.original_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{file.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{file.description}</TableCell>
                      <TableCell>
                        <Badge variant={file.is_public ? "default" : "secondary"}>
                          {file.is_public ? "Público" : "Privado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {file.created_at && new Date(file.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleFileDelete(file.id, file.file_path)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileManager;
