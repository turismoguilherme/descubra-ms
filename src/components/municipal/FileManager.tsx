
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

  // Formulário de upload
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    category: "geral",
    description: "",
    isPublic: false
  });

  const fetchFiles = useCallback(async () => {
    if (!cityId) return;
    try {
      const { data, error } = await supabase
        .from('secretary_files')
        .select('*')
        .eq('city_id', cityId) // Filtra por cityId
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
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
      {/* Upload de Arquivos */}
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
