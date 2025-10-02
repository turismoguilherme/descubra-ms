import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Map, Users, BarChart3, Mail, Phone, MapPin, Brain } from 'lucide-react';
import ViaJARLogo from './ViaJARLogo';

const ViaJARFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-1">
            <ViaJARLogo />
            <p className="mt-4 text-gray-300 text-sm">
              Ecossistema inteligente de turismo. Soluções inovadoras para empresas do setor turístico 
              com inteligência artificial e tecnologia avançada. Criadores do <strong>Descubra MS</strong>, 
              nosso case de sucesso em Mato Grosso do Sul.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Serviços
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/servicos" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    IA Guilherme
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Relatórios Inteligentes
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Inventário Turístico
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Análise de Mercado
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Plataformas */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Nossas Plataformas
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/ms" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Descubra MS</div>
                      <div className="text-xs text-gray-400">Case de Sucesso</div>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/viajar/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    ViaJAR Dashboard
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/viajar/master-dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Master Dashboard
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Mail className="h-4 w-4 text-cyan-400" />
                contato@viajar.com.br
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Phone className="h-4 w-4 text-cyan-400" />
                +55 (67) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <MapPin className="h-4 w-4 text-cyan-400" />
                Campo Grande, MS
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2025 ViaJAR. Todos os direitos reservados.
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/privacidade" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Termos de Uso
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
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

