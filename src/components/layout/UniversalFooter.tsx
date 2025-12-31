import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBrand } from '@/context/BrandContext';
import { useFooterSettings } from '@/hooks/useFooterSettings';

const enableDebugLogs = import.meta.env.VITE_DEBUG_LOGS === 'true';
const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const safeLog = (payload: any) => {
  if (!enableDebugLogs || !isDev) return;
  try {
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...payload,timestamp:Date.now(),sessionId:'debug-session',runId:payload?.runId||'run1'})
    }).catch(()=>{});
  } catch (error) {
    // Silenciosamente falha em produção
  }
};

const UniversalFooter = () => {
  // Verificar se o BrandProvider está disponível
  let brandContext = null;
  try {
    brandContext = useBrand();
  } catch (error) {
    console.error('UniversalFooter: BrandProvider não disponível:', error);
    // Retornar footer básico sem branding
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300 text-sm">
              © 2025. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  const { isOverflowOne } = brandContext;
  safeLog({location:'UniversalFooter.tsx:40',message:'UniversalFooter verificando isOverflowOne',data:{isOverflowOne},hypothesisId:'B'});
  const { settings: msSettings, loading: msLoading, refetch: refetchMsSettings } = useFooterSettings('ms');
  
  // Log para debug
  useEffect(() => {
    console.log('📄 [UniversalFooter] Settings do MS carregados:', msSettings);
  }, [msSettings]);

  if (isOverflowOne) {
    safeLog({location:'UniversalFooter.tsx:43',message:'UniversalFooter renderizando footer overflow-one',data:{isOverflowOne},hypothesisId:'B'});
    // Footer para OverFlow One
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sobre OverFlow One */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sobre OverFlow One</h3>
              <p className="text-gray-300 text-sm">
                Plataforma SaaS completa para gestão turística governamental 
                com IA, analytics e passaporte digital.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Soluções</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/solucoes" className="text-gray-300 hover:text-white">Funcionalidades</Link></li>
                <li><Link to="/precos" className="text-gray-300 hover:text-white">Preços</Link></li>
                <li><Link to="/casos-sucesso" className="text-gray-300 hover:text-white">Casos de Sucesso</Link></li>
                <li><Link to="/documentacao" className="text-gray-300 hover:text-white">Documentação</Link></li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-gray-300">Brasil</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-gray-300">contato@overflowone.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-gray-300">www.overflowone.com</span>
                </li>
              </ul>
            </div>

            {/* Redes Sociais */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm">
                © 2024 OverFlow One. Todos os direitos reservados.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/privacidade" className="text-gray-300 hover:text-white text-sm">
                  Política de Privacidade
                </a>
                <a href="/termos" className="text-gray-300 hover:text-white text-sm">
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Footer equilibrado para Descubra MS
  return (
    <footer className="bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green text-white">
      <div className="ms-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
          {/* Coluna Esquerda - Logo, Descrição e Redes */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <img 
                src="/images/logo-descubra-ms.png?v=3" 
                alt="Descubra Mato Grosso do Sul" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-blue-100 text-xs mb-3">
              Descubra as maravilhas do Pantanal, Cerrado e muito mais.
            </p>
            <div className="flex space-x-3 justify-center lg:justify-start">
              {msSettings.social_media.facebook && (
                <a href={msSettings.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {msSettings.social_media.instagram && (
                <a href={msSettings.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {msSettings.social_media.twitter && (
                <a href={msSettings.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Coluna Direita - Links em 3 Colunas */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4 items-start">
            {/* Explore */}
            <div className="text-center lg:text-left">
              <h3 className="text-xs font-semibold mb-2 text-white">Explore</h3>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/descubrams" className="text-blue-100 hover:text-white text-xs transition-colors block">
                    Início
                  </Link>
                </li>
                <li>
                  <Link to="/descubrams/destinos" className="text-blue-100 hover:text-white text-xs transition-colors block">
                    Destinos
                  </Link>
                </li>
                <li>
                  <Link to="/descubrams/eventos" className="text-blue-100 hover:text-white text-xs transition-colors block">
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link to="/descubrams/parceiros" className="text-blue-100 hover:text-white text-xs transition-colors block">
                    Parceiros
                  </Link>
                </li>
                <li>
                  <Link to="/descubrams/partner/login" className="text-blue-100 hover:text-white text-xs transition-colors block">
                    Área do Parceiro
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div className="text-center lg:text-left">
              <h3 className="text-xs font-semibold mb-2 text-white">Contato</h3>
              <ul className="space-y-2">
                {msSettings.email && (
                  <li className="text-blue-100 text-xs">
                    <div className="flex items-start justify-center lg:justify-start gap-1.5 max-w-full">
                      <Mail className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="break-words leading-relaxed hyphens-auto" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>
                        {msSettings.email}
                      </span>
                    </div>
                  </li>
                )}
                {msSettings.phone && (
                  <li className="flex items-center justify-center lg:justify-start gap-1.5 text-blue-100 text-xs">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span>{msSettings.phone}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Legal */}
            <div className="text-center lg:text-left">
              <h3 className="text-xs font-semibold mb-2 text-white">Legal</h3>
              <ul className="space-y-1.5">
                <li>
                  <Link 
                    to="/descubrams/privacidade" 
                    className="text-blue-100 hover:text-white text-xs transition-colors block"
                  >
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/descubrams/termos" 
                    className="text-blue-100 hover:text-white text-xs transition-colors block"
                  >
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logos de Parceiros */}
        {msSettings.partner_logos && msSettings.partner_logos.length > 0 && (
          <div className="border-t border-blue-300/30 pt-6 mt-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {msSettings.partner_logos
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

        {/* Linha separadora e Copyright */}
        <div className="border-t border-blue-300/30 pt-3 mt-4">
          <div className="text-center">
            <p className="text-blue-200 text-xs">
              {msSettings.copyright || '© 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UniversalFooter;