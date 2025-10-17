import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  QrCode,
  Link,
  CheckCircle
} from 'lucide-react';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // URL base da aplicação
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/ms/profile/${userProfile.id}`;
  
  // Texto para compartilhamento
  const shareText = `Conheça o perfil de ${userProfile.full_name} no Descubra MS! 🏞️✨`;
  
  // Função para copiar link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Link Copiado!",
        description: "Link do perfil copiado para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive"
      });
    }
  };

  // Função para compartilhar via Web Share API
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${userProfile.full_name} - Descubra MS`,
          text: shareText,
          url: profileUrl
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      handleCopyLink();
    }
  };

  // Função para compartilhar no WhatsApp
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Função para compartilhar no Facebook
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  // Função para compartilhar no Twitter
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  // Função para compartilhar no LinkedIn
  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  // Função para compartilhar via email
  const handleEmailShare = () => {
    const subject = `Perfil de ${userProfile.full_name} - Descubra MS`;
    const body = `${shareText}\n\n${profileUrl}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  // Função para gerar QR Code
  const handleQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
            <span>Compartilhar Perfil</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Link do Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="h-5 w-5 mr-2" />
                Link do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profileUrl">URL do Perfil</Label>
                <div className="flex gap-2">
                  <Input
                    id="profileUrl"
                    value={profileUrl}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant={copied ? "default" : "outline"}
                    className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compartilhamento Rápido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Compartilhamento Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={handleWebShare}
                  className="flex flex-col items-center p-4 h-auto bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Compartilhar</span>
                </Button>

                <Button
                  onClick={handleWhatsAppShare}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-green-500 text-green-600 hover:bg-green-50"
                >
                  <MessageCircle className="h-6 w-6 mb-2" />
                  <span className="text-sm">WhatsApp</span>
                </Button>

                <Button
                  onClick={handleEmailShare}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Mail className="h-6 w-6 mb-2" />
                  <span className="text-sm">Email</span>
                </Button>

                <Button
                  onClick={handleQRCode}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  <QrCode className="h-6 w-6 mb-2" />
                  <span className="text-sm">QR Code</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Facebook className="h-5 w-5 mr-2" />
                Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={handleFacebookShare}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Facebook className="h-6 w-6 mb-2" />
                  <span className="text-sm">Facebook</span>
                </Button>

                <Button
                  onClick={handleTwitterShare}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-blue-400 text-blue-400 hover:bg-blue-50"
                >
                  <Twitter className="h-6 w-6 mb-2" />
                  <span className="text-sm">Twitter</span>
                </Button>

                <Button
                  onClick={handleLinkedInShare}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-blue-700 text-blue-700 hover:bg-blue-50"
                >
                  <Linkedin className="h-6 w-6 mb-2" />
                  <span className="text-sm">LinkedIn</span>
                </Button>

                <Button
                  onClick={() => toast({
                    title: "Instagram",
                    description: "Copie o link e cole no Instagram Stories ou Bio",
                  })}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-pink-500 text-pink-500 hover:bg-pink-50"
                >
                  <Instagram className="h-6 w-6 mb-2" />
                  <span className="text-sm">Instagram</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Perfil */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Prévia do Compartilhamento:</h4>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-bold">
                      {userProfile.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{userProfile.full_name}</p>
                    <p className="text-sm text-gray-600">Perfil no Descubra MS</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  {shareText}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileModal;





