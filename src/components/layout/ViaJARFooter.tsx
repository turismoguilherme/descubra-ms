import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Shield, FlaskConical, Send } from 'lucide-react';
import { useFooterSettings } from '@/hooks/useFooterSettings';
import { useGuataLabsContent } from '@/hooks/useGuataLabsContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ViaJARFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { brandName, brandTagline } = useGuataLabsContent();
  const { settings } = useFooterSettings('viajar');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setNewsletterLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers' as any)
        .insert({ email: newsletterEmail.trim().toLowerCase(), platform: 'viajar' } as any);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Já inscrito!",
            description: "Este email já está cadastrado na nossa newsletter.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Inscrição realizada!",
          description: `Você receberá nossas novidades da ${brandName}.`,
        });
      }
      setNewsletterEmail('');
    } catch (error) {
      toast({
        title: "Erro ao inscrever",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Função para fazer scroll para o topo ao clicar em links
  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const defaultCopyright = `© ${currentYear} ${brandName}. Todos os direitos reservados.`;
  const storedCopyright = settings.copyright?.trim();
  const isLegacyDescubraCopyright =
    !!storedCopyright && /descubra\s+mato\s+grosso\s+do\s+sul/i.test(storedCopyright);
  const copyrightLine = isLegacyDescubraCopyright
    ? defaultCopyright
    : storedCopyright || defaultCopyright;

  return (
    <footer className="bg-guata-deep text-guata-cream relative overflow-hidden">
      <div className="relative z-20 h-2.5 bg-guata-cream shadow-sm" aria-hidden />
      {/* Circuit grid background */}
      <div className="absolute left-0 right-0 bottom-0 top-2.5 opacity-[0.12]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--guata-gold) / 0.12) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--guata-gold) / 0.12) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* Top border with glow */}
      <div className="border-t border-guata-gold/25 shadow-[0_-2px_15px_rgba(201,162,76,0.12)]" />

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Coluna 1 - Logo, Descrição, Contato e Redes Sociais */}
          <div className="text-center lg:text-left">
            <div className="text-2xl font-extrabold font-guata mb-3 tracking-tight text-guata-cream">
              {brandName}
            </div>
            <p className="text-guata-cream/75 text-sm mb-6 max-w-xs mx-auto lg:mx-0">
              {brandTagline}
            </p>
            
            {/* Contato */}
            <div className="space-y-3 mb-6">
              {settings.email && (
                <div className="flex items-center justify-center lg:justify-start gap-3 text-guata-cream/75 text-sm group">
                  <Mail className="h-4 w-4 flex-shrink-0 text-guata-gold" />
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="hover:text-guata-gold transition-colors duration-300"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center justify-center lg:justify-start gap-3 text-guata-cream/75 text-sm group">
                  <Phone className="h-4 w-4 flex-shrink-0 text-guata-gold" />
                  <a 
                    href={`tel:${settings.phone.replace(/\D/g, '')}`} 
                    className="hover:text-guata-gold transition-colors duration-300"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.address && (
                <div className="flex items-start justify-center lg:justify-start gap-3 text-guata-cream/75 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-guata-gold" />
                  <span className="break-words">{settings.address}</span>
                </div>
              )}
            </div>

            {/* Redes Sociais */}
            <div className="flex space-x-4 justify-center lg:justify-start">
              {settings.social_media.facebook && (
                <a 
                  href={settings.social_media.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm border border-guata-gold/20 flex items-center justify-center text-guata-cream/75 hover:text-guata-gold hover:border-guata-gold/50 hover:bg-guata-gold/10 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.social_media.instagram && (
                <a 
                  href={settings.social_media.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm border border-guata-gold/20 flex items-center justify-center text-guata-cream/75 hover:text-guata-gold hover:border-guata-gold/50 hover:bg-guata-gold/10 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.social_media.linkedin && (
                <a 
                  href={settings.social_media.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm border border-guata-gold/20 flex items-center justify-center text-guata-cream/75 hover:text-guata-gold hover:border-guata-gold/50 hover:bg-guata-gold/10 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {settings.social_media.twitter && (
                <a 
                  href={settings.social_media.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm border border-guata-gold/20 flex items-center justify-center text-guata-cream/75 hover:text-guata-gold hover:border-guata-gold/50 hover:bg-guata-gold/10 transition-all duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Coluna 2 - Links Principais */}
          <div className="text-center lg:text-left">
            <h3 className="text-sm font-bold mb-6 text-guata-cream font-guata">Links Principais</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/solucoes" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Soluções
                </Link>
              </li>
              <li>
                <Link 
                  to="/casos-sucesso" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Cases
                </Link>
              </li>
              <li>
                <Link 
                  to="/precos" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Preços
                </Link>
              </li>
              <li>
                <Link 
                  to="/contato" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Acesso + Links Secundários */}
          <div className="text-center lg:text-left">
            <h3 className="text-sm font-bold mb-6 text-guata-cream font-guata">Acesso</h3>
            <ul className="space-y-3 mb-8">
              <li>
                <Link 
                  to="/viajar/login" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <FlaskConical className="h-4 w-4 text-guata-gold opacity-70 group-hover:opacity-100" />
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/viajar/admin" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <Shield className="h-4 w-4 text-guata-gold opacity-70 group-hover:opacity-100" />
                  Admin
                </Link>
              </li>
            </ul>
            
            <h3 className="text-sm font-bold mb-6 text-guata-cream font-guata">Mais</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/sobre" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Sobre
                </Link>
              </li>
              <li>
                <Link 
                  to="/dados-turismo" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Dados
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Newsletter + Legal */}
          <div className="text-center lg:text-left">
            <h3 className="text-sm font-bold mb-4 text-guata-cream font-guata">Newsletter</h3>
            <p className="text-guata-cream/70 text-xs mb-3">Receba novidades da {brandName}</p>
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Seu e-mail..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-white border-guata-gold/40 text-guata-deep placeholder:text-guata-bark/50 focus:border-guata-forest focus:ring-1 focus:ring-guata-forest/30 h-9 text-sm"
                />
                <Button
                  type="submit"
                  disabled={newsletterLoading}
                  className="bg-guata-gold hover:bg-guata-gold-light text-guata-deep font-semibold w-full h-9 text-sm"
                >
                  {newsletterLoading ? 'Enviando...' : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Inscrever
                    </>
                  )}
                </Button>
              </div>
            </form>

            <h3 className="text-sm font-bold mb-4 text-guata-cream font-guata">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/viajar/privacidade" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  to="/viajar/termos" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Termos
                </Link>
              </li>
              <li>
                <Link 
                  to="/viajar/cookies" 
                  onClick={handleLinkClick} 
                  className="text-guata-cream/75 hover:text-guata-gold text-sm transition-colors duration-300 flex items-center gap-2 justify-center lg:justify-start group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-guata-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logos de Parceiros */}
      {settings.partner_logos && settings.partner_logos.length > 0 && (
        <div className="border-t border-guata-gold/15 pt-8 mt-8 relative">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {settings.partner_logos
              .sort((a, b) => a.order - b.order)
              .map((logo) => (
                <div key={logo.id} className="flex items-center justify-center">
                  <img
                    src={logo.logo_url}
                    alt={logo.alt_text || logo.name}
                    className="h-12 w-auto object-contain max-w-[150px] opacity-60 hover:opacity-90 transition-opacity duration-300 filter grayscale hover:grayscale-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,${encodeURIComponent(`<svg width="150" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="60" fill="#374151"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="#9CA3AF" text-anchor="middle" dominant-baseline="middle">Logo não disponível</text></svg>`)}`;
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className="border-t border-guata-gold/15 pt-6 mt-8 relative">
        <div className="text-center">
          <p className="text-guata-cream/55 text-sm">
            {copyrightLine}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ViaJARFooter;