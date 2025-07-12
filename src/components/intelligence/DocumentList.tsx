import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Download, Trash2, FileText, Calendar, User } from "lucide-react";
import { TourismDocument } from "./DocumentManager";

interface DocumentListProps {
  documents: TourismDocument[];
  onDocumentDeleted: () => void;
}

const DocumentList = ({ documents, onDocumentDeleted }: DocumentListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'word':
        return '📝';
      case 'csv':
        return '📋';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (doc: TourismDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('tourism-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.original_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Download iniciado",
      });
    } catch (error: any) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer download do arquivo",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: TourismDocument) => {
    if (!user || doc.uploaded_by !== user.id) {
      toast({
        title: "Erro",
        description: "Você só pode deletar seus próprios arquivos",
        variant: "destructive",
      });
      return;
    }

    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('tourism-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('tourism_intelligence_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso",
      });

      onDocumentDeleted();
    } catch (error: any) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover documento",
        variant: "destructive",
      });
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhum documento enviado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
              <div>
                <h4 className="font-medium">{doc.original_name}</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {doc.uploader_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>
                  {doc.description && (
                    <p className="text-gray-600">{doc.description}</p>
                  )}
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {doc.category}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(doc)}
              >
                <Download className="h-4 w-4" />
              </Button>
              {user && doc.uploaded_by === user.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(doc)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
