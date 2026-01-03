import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useKodaLanguage } from "@/hooks/useKodaLanguage";
import enTranslations from "@/locales/koda/en.json";
import frTranslations from "@/locales/koda/fr.json";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Instagram, Twitter, Linkedin, Globe, ExternalLink } from "lucide-react";

interface FooterSettings {
  viajar_link?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  disclaimer?: string;
  copyright?: string;
}

const KodaFooter = () => {
  const { language } = useKodaLanguage();
  const t = language === 'fr' ? frTranslations : enTranslations;
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<FooterSettings>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('platform', 'koda')
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar configurações do footer:', error);
      } else if (data?.setting_value) {
        setSettings(data.setting_value as FooterSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const hasSocialMedia = settings.social_media && (
    settings.social_media.facebook ||
    settings.social_media.instagram ||
    settings.social_media.twitter ||
    settings.social_media.linkedin
  );

  return (
    <footer className="border-t border-white/10 bg-black/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Disclaimer */}
          <p className="text-white/80 text-xs md:text-sm text-center md:text-left max-w-2xl">
            {settings.disclaimer || t.footer.disclaimer}
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <Link 
              to="/koda/privacy" 
              className="text-white/80 hover:text-white transition-colors underline"
            >
              {t.footer.privacy}
            </Link>
            <span className="text-white/40">|</span>
            <Link 
              to="/koda/terms" 
              className="text-white/80 hover:text-white transition-colors underline"
            >
              {t.footer.terms}
            </Link>
            {settings.viajar_link && (
              <>
                <span className="text-white/40">|</span>
                <a
                  href={settings.viajar_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors underline flex items-center gap-1"
                >
                  ViajARTur
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Media Icons */}
            {hasSocialMedia && (
              <div className="flex items-center gap-4">
                {settings.social_media?.facebook && (
                  <a
                    href={settings.social_media.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {settings.social_media?.instagram && (
                  <a
                    href={settings.social_media.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings.social_media?.twitter && (
                  <a
                    href={settings.social_media.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {settings.social_media?.linkedin && (
                  <a
                    href={settings.social_media.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            {/* Copyright */}
            <p className="text-white/60 text-xs text-center">
              {settings.copyright?.replace('2025', currentYear.toString()) || 
               t.footer.copyright.replace('2025', currentYear.toString())}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default KodaFooter;

