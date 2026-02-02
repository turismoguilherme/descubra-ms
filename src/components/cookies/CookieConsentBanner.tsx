import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X, Settings, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLocation } from 'react-router-dom';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentBannerProps {
  platform?: 'viajar' | 'descubra_ms';
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ platform = 'descubra_ms' }) => {
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Sempre true, não pode ser desabilitado
    analytics: false,
    marketing: false,
  });

  // Detectar plataforma baseado na rota se não fornecida
  const detectedPlatform = platform || (location.pathname.startsWith('/viajar') ? 'viajar' : 'descubra_ms');
  const storageKey = `cookie-consent-${detectedPlatform}`;
  const cookiesPagePath = detectedPlatform === 'viajar' ? '/viajar/cookies' : '/descubrams/cookies';

  useEffect(() => {
    // Verificar se já existe consentimento salvo
    const savedConsent = localStorage.getItem(storageKey);
    if (!savedConsent) {
      // Mostrar banner após um pequeno delay para melhor UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Carregar preferências salvas
      try {
        const saved = JSON.parse(savedConsent);
        setPreferences({
          essential: true, // Sempre true
          analytics: saved.analytics || false,
          marketing: saved.marketing || false,
        });
      } catch (e) {
        // Se houver erro ao parsear, mostrar banner novamente
        setShowBanner(true);
      }
    }
  }, [storageKey]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyEssential);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences: prefs,
    };
    localStorage.setItem(storageKey, JSON.stringify(consentData));
    
    // Aplicar preferências (por exemplo, desabilitar Google Analytics se rejeitado)
    if (!prefs.analytics) {
      // Desabilitar Google Analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
      // Desabilitar tracking próprio (será verificado automaticamente pelo InteractionTrackerService)
      console.log('🍪 Cookies de analytics rejeitados - tracking próprio desabilitado');
    } else {
      // Habilitar Google Analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
      // Habilitar tracking próprio (será verificado automaticamente pelo InteractionTrackerService)
      console.log('🍪 Cookies de analytics aceitos - tracking próprio habilitado');
    }
  };

  // Não mostrar banner se já tiver consentimento
  if (!showBanner) return null;

  // Cores baseadas na plataforma
  const isDescubraMS = detectedPlatform === 'descubra_ms';
  const primaryColor = isDescubraMS ? 'from-ms-primary-blue to-ms-discovery-teal' : 'from-viajar-cyan to-viajar-blue';
  const bgColor = isDescubraMS ? 'bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green' : 'bg-gradient-to-r from-viajar-slate to-slate-800';
  const buttonColor = isDescubraMS ? 'bg-ms-secondary-yellow hover:bg-ms-secondary-yellow/90 text-gray-900' : 'bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate';

  return (
    <>
      {/* Banner Fixo na Parte Inferior */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${bgColor} text-white shadow-2xl border-t-2 border-white/20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0`}>
                <Cookie className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Utilizamos Cookies</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. 
                  Ao continuar navegando, você concorda com nossa{' '}
                  <Link to={cookiesPagePath} className="underline hover:no-underline font-medium">
                    Política de Cookies
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                Personalizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Recusar
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className={buttonColor}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aceitar Todos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configurações */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Configurações de Cookies
            </DialogTitle>
            <DialogDescription>
              Gerencie suas preferências de cookies. Você pode habilitar ou desabilitar diferentes tipos de cookies abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Cookies Essenciais */}
            <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="essential" className="text-base font-semibold text-red-900 cursor-pointer">
                    Cookies Essenciais
                  </Label>
                  <p className="text-sm text-red-700 mt-1">
                    Necessários para o funcionamento básico do site. Não podem ser desativados.
                  </p>
                </div>
                <Switch
                  id="essential"
                  checked={preferences.essential}
                  disabled
                  className="opacity-50"
                />
              </div>
              <div className="text-xs text-red-600 space-y-1">
                <p><strong>Inclui:</strong> Autenticação, segurança, preferências de sessão</p>
              </div>
            </div>

            {/* Cookies de Análise */}
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="analytics" className="text-base font-semibold text-blue-900 cursor-pointer">
                    Cookies de Análise
                  </Label>
                  <p className="text-sm text-blue-700 mt-1">
                    Nos ajudam a entender como você usa o site para melhorar a experiência.
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, analytics: checked }))
                  }
                />
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <p><strong>Inclui:</strong> Google Analytics, métricas de uso</p>
              </div>
            </div>

            {/* Cookies de Marketing */}
            <div className="space-y-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="marketing" className="text-base font-semibold text-purple-900 cursor-pointer">
                    Cookies de Marketing
                  </Label>
                  <p className="text-sm text-purple-700 mt-1">
                    Usados para personalizar anúncios e medir a eficácia de campanhas.
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
              <div className="text-xs text-purple-600 space-y-1">
                <p><strong>Inclui:</strong> Cookies de terceiros para publicidade</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-4">
                Para mais informações, consulte nossa{' '}
                <Link to={cookiesPagePath} className="text-blue-600 hover:underline">
                  Política de Cookies completa
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePreferences} className={buttonColor}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvar Preferências
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Declaração global para gtag (Google Analytics)
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default CookieConsentBanner;

