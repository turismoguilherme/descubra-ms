import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { userPhotosService } from '@/services/user-photos/userPhotosService';
import { useAuth } from "@/hooks/useAuth";

interface Photo {
  id: string;
  image_url: string;
  description?: string;
  user_id: string;
}

interface PhotoUploadSectionProps {
  targetId: string; // ID do roteiro ou checkpoint
  targetType: 'route' | 'checkpoint';
}

const PhotoUploadSection = ({ targetId, targetType }: PhotoUploadSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoDescription, setPhotoDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [targetId, targetType]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      let fetchedPhotos: Photo[] = [];
      if (targetType === 'route') {
        fetchedPhotos = await userPhotosService.getPhotosByRouteId(targetId);
      } else if (targetType === 'checkpoint') {
        fetchedPhotos = await userPhotosService.getPhotosByCheckpointId(targetId);
      }
      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as fotos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Ação não permitida",
        description: "Você precisa estar logado para enviar uma foto.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione uma imagem para fazer upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const photoData = {
        user_id: user.id,
        file: selectedFile,
        description: photoDescription.trim() || undefined,
        ...(targetType === 'route' && { route_id: targetId }),
        ...(targetType === 'checkpoint' && { checkpoint_id: targetId }),
      };

      await userPhotosService.uploadPhoto(photoData);
      setSelectedFile(null);
      setPhotoDescription('');
      toast({
        title: "Foto enviada!",
        description: "Sua foto foi enviada com sucesso.",
      });
      fetchPhotos(); // Recarregar fotos após o upload
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar sua foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, imageUrl: string) => {
    if (!user) {
      toast({
        title: "Ação não permitida",
        description: "Você precisa estar logado para deletar uma foto.",
        variant: "destructive",
      });
      return;
    }
    
    // Confirmar com o usuário antes de deletar
    if (!window.confirm("Tem certeza que deseja deletar esta foto?")) {
      return;
    }

    try {
      await userPhotosService.deletePhoto(photoId, imageUrl);
      toast({
        title: "Foto deletada!",
        description: "A foto foi removida com sucesso.",
      });
      fetchPhotos(); // Recarregar fotos após a exclusão
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar a foto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="picture">Selecione uma imagem</Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea 
                id="description"
                placeholder="Adicione uma breve descrição da sua foto..."
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile || !user}>
              {uploading ? "Enviando..." : "Enviar Foto"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galeria de Fotos ({photos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Carregando fotos...</p>
          ) : photos.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma foto ainda. Seja o primeiro a compartilhar!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.image_url} 
                    alt={photo.description || "Foto do usuário"} 
                    className="w-full h-48 object-cover rounded-md border aspect-video"
                  />
                  {photo.description && (
                    <p className="text-sm text-gray-700 mt-2 p-2">{photo.description}</p>
                  )}
                  {user && user.id === photo.user_id && (
                    <Button 
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeletePhoto(photo.id, photo.image_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded-md text-xs">
                    {photo.user_id.substring(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoUploadSection; 