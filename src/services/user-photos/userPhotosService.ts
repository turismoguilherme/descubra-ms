import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface CreateUserPhotoData {
  user_id: string;
  route_id?: string;
  checkpoint_id?: string;
  description?: string;
  file: File; // O arquivo de imagem a ser enviado
}

interface UserPhoto {
  id: string;
  user_id: string;
  route_id?: string;
  checkpoint_id?: string;
  image_url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

class UserPhotosService {
  private readonly BUCKET_NAME = 'user-uploads';

  /**
   * Faz o upload de uma foto para o Supabase Storage e registra seus metadados no banco de dados.
   * @param data Dados da foto, incluindo o arquivo e informações relacionadas.
   * @returns A foto do usuário criada com a URL.
   */
  async uploadPhoto(data: CreateUserPhotoData): Promise<UserPhoto> {
    try {
      const { user_id, route_id, checkpoint_id, description, file } = data;
      const fileExtension = file.name.split('.').pop();
      const filePath = `${user_id}/${uuidv4()}.${fileExtension}`;

      // 1. Upload do arquivo para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('❌ Erro ao fazer upload da imagem para o Storage:', uploadError);
        throw uploadError;
      }

      // 2. Obter a URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem.');
      }
      const imageUrl = publicUrlData.publicUrl;

      // 3. Inserir metadados da foto na tabela user_photos
      const { data: newPhoto, error: insertError } = await supabase
        .from('user_photos')
        .insert({
          user_id,
          route_id,
          checkpoint_id,
          image_url: imageUrl,
          description,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir metadados da foto no banco de dados:', insertError);
        // Opcional: tentar deletar a imagem do Storage se a inserção no DB falhar
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        throw insertError;
      }

      return newPhoto as UserPhoto;
    } catch (error) {
      console.error('❌ Erro no serviço de upload de fotos:', error);
      throw error;
    }
  }

  /**
   * Busca fotos por ID de roteiro.
   * @param routeId O ID do roteiro.
   * @returns Uma lista de fotos para o roteiro.
   */
  async getPhotosByRouteId(routeId: string): Promise<UserPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('user_photos')
        .select('*')
        .eq('route_id', routeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserPhoto[];
    } catch (error) {
      console.error('❌ Erro ao buscar fotos por roteiro:', error);
      throw error;
    }
  }

  /**
   * Busca fotos por ID de checkpoint.
   * @param checkpointId O ID do checkpoint.
   * @returns Uma lista de fotos para o checkpoint.
   */
  async getPhotosByCheckpointId(checkpointId: string): Promise<UserPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('user_photos')
        .select('*')
        .eq('checkpoint_id', checkpointId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserPhoto[];
    } catch (error) {
      console.error('❌ Erro ao buscar fotos por checkpoint:', error);
      throw error;
    }
  }

  /**
   * Exclui uma foto do Supabase Storage e do banco de dados.
   * @param photoId O ID da foto a ser excluída.
   * @param imageUrl A URL da imagem para exclusão do Storage.
   */
  async deletePhoto(photoId: string, imageUrl: string): Promise<void> {
    try {
      // Extrair o caminho do arquivo do URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.indexOf(this.BUCKET_NAME);
      if (bucketIndex === -1 || urlParts.length <= bucketIndex + 1) {
        throw new Error('URL de imagem inválida para exclusão de arquivo.');
      }
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      // 1. Excluir do Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
      
      if (storageError) {
        console.error('❌ Erro ao excluir imagem do Storage:', storageError);
        throw storageError;
      }

      // 2. Excluir metadados do banco de dados
      const { error: dbError } = await supabase
        .from('user_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) {
        console.error('❌ Erro ao excluir metadados da foto do banco de dados:', dbError);
        throw dbError;
      }

      console.log(`✅ Foto ${photoId} excluída com sucesso.`);
    } catch (error) {
      console.error('❌ Erro no serviço de exclusão de fotos:', error);
      throw error;
    }
  }
}

export const userPhotosService = new UserPhotosService(); 