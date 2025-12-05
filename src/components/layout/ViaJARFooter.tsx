import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Shield, Users, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ViaJARFooter: React.FC = () => {
  const { userProfile, user, loading } = useAuth();
  
  const userRole = userProfile?.role?.toLowerCase() || '';
  const isAdmin = !loading && 
                  user && 
                  userProfile && 
                  (userRole === 'admin' || 
                   userRole === 'master_admin' || 
                   userRole === 'tech' ||
                   userRole === 'master admin' ||
                   userRole === 'tech admin');

  const currentYear = new Date().getFullYear();

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
              <a 
                href="https://facebook.com/viajartur" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-viajar-cyan/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-gray-300 hover:text-viajar-cyan" />
              </a>
              <a 
                href="https://instagram.com/viajartur" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-viajar-cyan/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-gray-300 hover:text-viajar-cyan" />
              </a>
              <a 
                href="https://linkedin.com/company/viajartur" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-viajar-cyan/20 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-gray-300 hover:text-viajar-cyan" />
              </a>
              <a 
                href="https://twitter.com/viajartur" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-viajar-cyan/20 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-gray-300 hover:text-viajar-cyan" />
              </a>
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
            </ul>
          </div>

          {/* Access Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Acesso
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/viajar/login" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Login Setor Privado
                </Link>
              </li>
              <li>
                <Link to="/test-login" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Login Setor Público
                </Link>
              </li>
              <li>
                <Link to="/viajar/register" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Criar Conta
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/viajar/admin" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Área Administrativa
                  </Link>
                </li>
              )}
              <li>
                <Link to="/ms" className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm">
                  Descubra MS
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
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                <a 
                  href="mailto:contato@viajartur.com.br" 
                  className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm"
                >
                  contato@viajartur.com.br
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                <a 
                  href="tel:+556730000000" 
                  className="text-gray-400 hover:text-viajar-cyan transition-colors text-sm"
                >
                  (67) 3000-0000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Campo Grande - MS<br />
                  Brasil
                </span>
              </li>
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
              © {currentYear} ViajARTur. Todos os direitos reservados.
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
      </div>
    </footer>
  );
};

export default ViaJARFooter;
