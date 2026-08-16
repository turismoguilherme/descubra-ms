import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  text: string;
  url: string;
}

const ShareButtons = ({ title, text, url }: ShareButtonsProps) => {
  const { toast } = useToast();

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast({
          title: "Compartilhado com sucesso!",
          description: "O conteúdo foi compartilhado.",
        });
      } catch (error) {
        console.error("Erro ao usar Web Share API:", error);
        toast({
          title: "Erro ao Compartilhar",
          description: "Não foi possível usar o compartilhamento nativo. Tente as opções abaixo.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Compartilhamento Não Suportado",
        description: "Seu navegador não suporta a API de compartilhamento nativo.",
        variant: "destructive",
      });
    }
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToWhatsapp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} - ${url}`)}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      {navigator.share ? (
        <Button onClick={handleWebShare} size="sm" className="flex items-center gap-1">
          <Share2 className="w-4 h-4" /> Compartilhar
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button onClick={shareToWhatsapp} size="icon" variant="outline">
            <MessageCircle className="w-4 h-4 text-green-500" />
          </Button>
          <Button onClick={shareToFacebook} size="icon" variant="outline">
            <Facebook className="w-4 h-4 text-blue-600" />
          </Button>
          <Button onClick={shareToTwitter} size="icon" variant="outline">
            <Twitter className="w-4 h-4 text-blue-400" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShareButtons; 