
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Upload, FileText, Download, Trash2, Filter } from "lucide-react";
import DocumentList from "./DocumentList";

export interface TourismDocument {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  file_type: string;
  category: string;
  description: string | null;
  uploaded_by: string;
  uploader_name: string | null;
  created_at: string;
  updated_at: string;
}

const DocumentManager = () => {
  const [documents, setDocuments] = useState<TourismDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("geral");
  const [description, setDescription] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('tourism_intelligence_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar documentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos",
        variant: "destructive",
      });
    }
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'doc':
      case 'docx':
        return 'word';
      case 'csv':
        return 'csv';
      default:
        return 'other';
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e certifique-se de estar logado",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload do arquivo para o storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('tourism-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Salvar informações no banco
      const { error: dbError } = await supabase
        .from('tourism_intelligence_documents')
        .insert({
          filename: fileName,
          original_name: selectedFile.name,
          file_path: fileName,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          file_type: getFileType(selectedFile.name),
          category,
          description: description || null,
          uploaded_by: user.id,
          uploader_name: user.email,
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      });

      setSelectedFile(null);
      setDescription("");
      setCategory("geral");
      fetchDocuments();
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    filterType === "all" || doc.file_type === filterType
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Arquivo</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Formatos aceitos: PDF, Word, Excel, CSV
            </p>
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="relatorio">Relatório</SelectItem>
                <SelectItem value="plano">Plano</SelectItem>
                <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                <SelectItem value="dados">Dados</SelectItem>
                <SelectItem value="pesquisa">Pesquisa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do documento..."
            />
          </div>

          <Button 
            onClick={handleFileUpload} 
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? "Enviando..." : "Enviar Documento"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Enviados
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentList 
            documents={filteredDocuments} 
            onDocumentDeleted={fetchDocuments}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManager;
