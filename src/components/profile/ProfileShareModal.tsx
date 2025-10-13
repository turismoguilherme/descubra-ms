import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Download, 
  MessageCircle, 
  Mail, 
  Facebook, 
  Twitter,
  Instagram,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_animal: string;
  avatar_history: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
}

interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name: string;
  image: string;
  habitat: string;
  diet: string;
  curiosities: string[];
  conservation_status: string;
  unlock_requirement?: string;
  is_unlocked: boolean;
}

interface ProfileShareModalProps {
  profile: UserProfile;
  currentAnimal: PantanalAnimal | undefined;
  onClose: () => void;
}

const ProfileShareModal: React.FC<ProfileShareModalProps> = ({
  profile,
  currentAnimal,
  onClose
}) => {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  React.useEffect(() => {
    // Gerar URL de compartilhamento
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/ms/profile/${profile.id}`;
    setShareUrl(profileUrl);
    
    // Gerar mensagem personalizada
    const message = `Olha só meu perfil no Descubra Mato Grosso do Sul! 🐾\n\n` +
      `Meu avatar é o ${currentAnimal?.name || 'animal do Pantanal'} e estou explorando ` +
      `todos os roteiros incríveis do MS! 🌿\n\n` +
      `Venha descobrir o Pantanal comigo: ${profileUrl}`;
    setCustomMessage(message);
  }, [profile, currentAnimal]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Sucesso",
        description: "URL copiada para a área de transferência!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a URL.",
        variant: "destructive",
      });
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      toast({
        title: "Sucesso",
        description: "Mensagem copiada para a área de transferência!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedMessage = encodeURIComponent(customMessage);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram não suporta compartilhamento direto de links
        toast({
          title: "Instagram",
          description: "Copie a mensagem e cole no seu story ou post!",
        });
        return;
      case 'email':
        shareUrl = `mailto:?subject=Meu perfil no Descubra MS&body=${encodedMessage}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleDownloadProfile = () => {
    // Criar um canvas com o perfil para download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 600;
    
    // Fundo
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Título
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Descubra Mato Grosso do Sul', canvas.width / 2, 60);
    
    // Avatar
    if (currentAnimal) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`Avatar: ${currentAnimal.name}`, canvas.width / 2, 120);
    }
    
    // Nome do usuário
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(profile.full_name || 'Usuário', canvas.width / 2, 180);
    
    // Conquistas
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.fillText(`Conquistas: ${profile.achievements.length}`, canvas.width / 2, 220);
    
    // URL
    ctx.fillStyle = '#3b82f6';
    ctx.font = '14px Arial';
    ctx.fillText(shareUrl, canvas.width / 2, 280);
    
    // Download
    const link = document.createElement('a');
    link.download = `perfil-${profile.full_name || 'usuario'}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Sucesso",
      description: "Imagem do perfil baixada com sucesso!",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-ms-primary-blue">
            🐾 Compartilhar Perfil
          </DialogTitle>
          <p className="text-center text-gray-600">
            Mostre ao mundo seu avatar do Pantanal e suas conquistas!
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview do Perfil */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentAnimal?.image} alt={currentAnimal?.name} />
                  <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                    {currentAnimal?.name.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {profile.full_name || 'Usuário'}
                  </h3>
                  <p className="text-gray-600">{profile.email}</p>
                  {currentAnimal && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {currentAnimal.name}
                      </Badge>
                      <Badge variant="outline">
                        {currentAnimal.conservation_status}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ms-primary-blue">
                    {profile.achievements.length}
                  </div>
                  <div className="text-sm text-gray-600">Conquistas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* URL de Compartilhamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Link do Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyUrl} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mensagem Personalizada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mensagem Personalizada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="message">Personalize sua mensagem:</Label>
                <textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none"
                  placeholder="Digite sua mensagem personalizada..."
                />
                <Button onClick={handleCopyMessage} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar Mensagem
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compartilhar em Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => handleSocialShare('facebook')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => handleSocialShare('twitter')}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleSocialShare('instagram')}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram
                </Button>
                <Button
                  onClick={() => handleSocialShare('email')}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  onClick={handleDownloadProfile}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileShareModal;
