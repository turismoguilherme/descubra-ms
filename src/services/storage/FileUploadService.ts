/**
 * Serviço de Upload de Arquivos
 * Gerencia upload de imagens, PDFs e outros arquivos
 */

export interface UploadOptions {
  folder?: string;
  maxSize?: number; // em MB
  allowedTypes?: string[];
  quality?: number; // para compressão de imagens
}

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

export class FileUploadService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      // Validar arquivo
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Comprimir imagem se necessário
      const processedFile = await this.processFile(file, options);

      // Gerar nome único
      const filename = this.generateUniqueFilename(file.name);

      // Upload para Supabase Storage
      const { data, error } = await this.uploadToSupabase(processedFile, filename, options.folder);

      if (error) {
        return {
          success: false,
          error: `Erro no upload: ${error.message}`
        };
      }

      return {
        success: true,
        url: data.path,
        filename: filename,
        size: processedFile.size
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: 'Erro interno no upload'
      };
    }
  }

  async uploadMultipleFiles(files: File[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, options);
      results.push(result);
    }

    return results;
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await this.deleteFromSupabase(filePath);
      return !error;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }
  }

  private validateFile(file: File, options: UploadOptions): { valid: boolean; error?: string } {
    // Verificar tamanho
    const maxSize = (options.maxSize || 10) * 1024 * 1024; // Converter MB para bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${options.maxSize || 10}MB`
      };
    }

    // Verificar tipo
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  private async processFile(file: File, options: UploadOptions): Promise<File> {
    // Se for imagem e tiver qualidade especificada, comprimir
    if (file.type.startsWith('image/') && options.quality && options.quality < 1) {
      return await this.compressImage(file, options.quality);
    }

    return file;
  }

  private async compressImage(file: File, quality: number): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para blob com qualidade especificada
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${random}.${extension}`;
  }

  private async uploadToSupabase(file: File, filename: string, folder?: string): Promise<any> {
    // Simulação de upload para Supabase
    // Em produção, usar o cliente Supabase real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: { path: `/${folder || 'uploads'}/${filename}` },
          error: null
        });
      }, 1000);
    });
  }

  private async deleteFromSupabase(filePath: string): Promise<any> {
    // Simulação de delete para Supabase
    // Em produção, usar o cliente Supabase real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ error: null });
      }, 500);
    });
  }

  // Método para obter URL pública do arquivo
  getPublicUrl(filePath: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${filePath}`;
  }

  // Método para obter URL assinada (temporária)
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    // Simulação de URL assinada
    // Em produção, usar o cliente Supabase real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`${this.supabaseUrl}/storage/v1/object/sign/${filePath}?expires=${Date.now() + expiresIn * 1000}`);
      }, 500);
    });
  }
}

export const fileUploadService = new FileUploadService();
