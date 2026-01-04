import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Shield, FlaskConical } from 'lucide-react';
import { useFooterSettings } from '@/hooks/useFooterSettings';

const ViaJARFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { settings, loading } = useFooterSettings('viajar');
  
  // Log para debug
  React.useEffect(() => {
    console.log('📄 [ViaJARFooter] Settings do ViaJAR carregados:', settings);
  }, [settings]);

  return (
    <footer className="bg-viajar-slate text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Coluna 1 - Logo, Descrição, Contato e Redes Sociais */}
          <div className="text-center lg:text-left">
            <div className="text-xl font-bold mb-2">
              <span className="text-white">Viaj</span>
              <span className="text-viajar-cyan">AR</span>
              <span className="text-white">Tur</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">
              Ecossistema inteligente de turismo.
            </p>
            
            {/* Contato */}
            <div className="space-y-1 mb-3">
              {settings.email && (
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-gray-400 text-xs">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="hover:text-viajar-cyan transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-gray-400 text-xs">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <a 
                    href={`tel:${settings.phone.replace(/\D/g, '')}`} 
                    className="hover:text-viajar-cyan transition-colors"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.address && (
                <div className="flex items-start justify-center lg:justify-start gap-1.5 text-gray-400 text-xs">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{settings.address}</span>
                </div>
              )}
            </div>

            {/* Redes Sociais */}
            <div className="flex space-x-3 justify-center lg:justify-start mt-2">
              {settings.social_media.facebook && (
                <a 
                  href={settings.social_media.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-viajar-cyan transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.social_media.instagram && (
                <a 
                  href={settings.social_media.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-viajar-cyan transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.social_media.linkedin && (
                <a 
                  href={settings.social_media.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-viajar-cyan transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {settings.social_media.twitter && (
                <a 
                  href={settings.social_media.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-viajar-cyan transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Coluna 2 - Links Principais */}
          <div className="text-center lg:text-left">
            <h3 className="text-xs font-bold mb-2 text-white">Links Principais</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/solucoes" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Soluções
                </Link>
              </li>
              <li>
                <Link to="/casos-sucesso" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Cases
                </Link>
              </li>
              <li>
                <Link to="/precos" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Preços
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Acesso + Links Secundários */}
          <div className="text-center lg:text-left">
            <h3 className="text-xs font-bold mb-2 text-white">Acesso</h3>
            <ul className="space-y-1 mb-4">
              <li>
                <Link to="/test-login" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-1.5 justify-center lg:justify-start">
                  <FlaskConical className="h-3 w-3" />
                  Login de Testes
                </Link>
              </li>
              <li>
                <Link to="/viajar/admin" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-1.5 justify-center lg:justify-start">
                  <Shield className="h-3 w-3" />
                  Admin
                </Link>
              </li>
            </ul>
            
            <h3 className="text-xs font-bold mb-2 text-white mt-4">Mais</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/sobre" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/dados-turismo" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Dados
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Legal */}
          <div className="text-center lg:text-left">
            <h3 className="text-xs font-bold mb-2 text-white">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/viajar/privacidade" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/viajar/termos" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Termos
                </Link>
              </li>
              <li>
                <Link to="/viajar/cookies" className="text-gray-400 hover:text-viajar-cyan text-xs transition-colors flex items-center gap-2 justify-center lg:justify-start">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logos de Parceiros */}
      {settings.partner_logos && settings.partner_logos.length > 0 && (
        <div className="border-t border-white/10 pt-3 mt-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {settings.partner_logos
              .sort((a, b) => a.order - b.order)
              .map((logo) => (
                <div key={logo.id} className="flex items-center justify-center">
                  <img
                    src={logo.logo_url}
                    alt={logo.alt_text || logo.name}
                    className="h-8 w-auto object-contain max-w-[120px] opacity-90 hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,${encodeURIComponent(`<svg width="150" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="60" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">Logo não disponível</text></svg>`)}`;
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className="border-t border-white/10 pt-2 mt-2">
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            {settings.copyright || `© ${currentYear} ViajARTur. Todos os direitos reservados.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ViaJARFooter;


