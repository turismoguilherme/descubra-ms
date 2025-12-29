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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="text-2xl font-bold mb-4">
              <span className="text-white">Viaj</span>
              <span className="text-viajar-cyan">AR</span>
              <span className="text-white">Tur</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Ecossistema inteligente de turismo. Transformamos dados em decisões estratégicas 
              com analytics avançado e IA para o setor público e privado.
            </p>
            <div className="flex gap-3">
              {settings.social_media.facebook && (
                <a 
                  href={settings.social_media.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-viajar-cyan/20 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4 text-gray-300 hover:text-viajar-cyan" />
                </a>
              )}
              {settings.social_media.instagram && (
                <a 
                  href={settings.social_media.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-viajar-cyan/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4 text-gray-300 hover:text-viajar-cyan" />
                </a>
              )}
              {settings.social_media.linkedin && (
                <a 
                  href={settings.social_media.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-viajar-cyan/20 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 text-gray-300 hover:text-viajar-cyan" />
                </a>
              )}
              {settings.social_media.twitter && (
                <a 
                  href={settings.social_media.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-viajar-cyan/20 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4 text-gray-300 hover:text-viajar-cyan" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Navegação
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/solucoes" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Soluções
                </Link>
              </li>
              <li>
                <Link to="/casos-sucesso" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Cases de Sucesso
                </Link>
              </li>
              <li>
                <Link to="/precos" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Preços
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/dados-turismo" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Dados de Turismo
                </Link>
              </li>
            </ul>
          </div>

          {/* Access Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Acesso
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/test-login" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Login de Testes
                </Link>
              </li>
              <li>
                <Link to="/viajar/admin" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Área Administrativa
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Contato
            </h3>
            <ul className="space-y-3">
              {settings.email && (
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                  <a 
                    href={`tel:${settings.phone.replace(/\D/g, '')}`} 
                    className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">
                    {settings.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              {settings.copyright || `© ${currentYear} ViajARTur. Todos os direitos reservados.`}
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link 
                to="/viajar/privacidade" 
                className="text-gray-400 hover:text-viajar-cyan transition-colors"
              >
                Privacidade
              </Link>
              <Link 
                to="/viajar/termos" 
                className="text-gray-400 hover:text-viajar-cyan transition-colors"
              >
                Termos de Uso
              </Link>
              <Link 
                to="/viajar/cookies" 
                className="text-gray-400 hover:text-viajar-cyan transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>

        {/* Logos de Parceiros */}
        {settings.partner_logos && settings.partner_logos.length > 0 && (
          <div className="border-t border-gray-700 pt-6 mt-8">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {settings.partner_logos
                .sort((a, b) => a.order - b.order)
                .map((logo) => (
                  <div key={logo.id} className="flex items-center justify-center">
                    <img
                      src={logo.logo_url}
                      alt={logo.alt_text || logo.name}
                      className="h-12 w-auto object-contain max-w-[150px] opacity-90 hover:opacity-100 transition-opacity"
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
      </div>
    </footer>
  );
};

export default ViaJARFooter;
