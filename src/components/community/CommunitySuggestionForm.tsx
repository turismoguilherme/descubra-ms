import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { communityService } from '@/services/community/communityService';
import { CommunitySuggestion } from '@/types/community-contributions';

interface CommunitySuggestionFormProps {
  onSuggestionCreated?: (suggestion: CommunitySuggestion) => void;
}

const CommunitySuggestionForm: React.FC<CommunitySuggestionFormProps> = ({ onSuggestionCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CommunitySuggestion['category'] | ''>('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios (Título, Descrição, Categoria).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newSuggestion = await communityService.createSuggestion({
        title,
        description,
        category,
        location: location || undefined,
        image_url: imageUrl || undefined,
      });
      toast({
        title: "Sucesso!",
        description: "Sua sugestão foi enviada para moderação.",
      });
      setTitle('');
      setDescription('');
      setCategory('');
      setLocation('');
      setImageUrl('');
      onSuggestionCreated?.(newSuggestion);
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua sugestão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nova Sugestão para a Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Título da sua sugestão (ex: Mirante do Morro do Céu)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
          <Textarea
            placeholder="Descreva sua sugestão em detalhes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            disabled={loading}
          />
          <Select value={category} onValueChange={(value) => setCategory(value as CommunitySuggestion['category'])} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atrativo">Atrativo Turístico</SelectItem>
              <SelectItem value="evento">Evento Local</SelectItem>
              <SelectItem value="melhoria">Ideia de Melhoria</SelectItem>
              <SelectItem value="roteiro">Sugestão de Roteiro</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Localização (opcional, ex: Rua da Paz, 123)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
          />
          <Input
            placeholder="URL da Imagem (opcional, ex: https://exemplo.com/foto.jpg)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Sugestão'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommunitySuggestionForm; 