import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBrand } from '@/context/BrandContext';

const UniversalFooter = () => {
  const { isOverflowOne } = useBrand();

  if (isOverflowOne) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
          {/* Coluna Esquerda - Logo e Descrição */}
          <div>
            <div className="flex items-center mb-3">
              <img 
                src="/images/logo-descubra-ms.png?v=5" 
                alt="Descubra Mato Grosso do Sul" 
                className="h-10 w-auto mr-3"
              />
              <div>
                <h3 className="text-lg font-bold text-white">DESCUBRA</h3>
                <h4 className="text-sm font-semibold text-white">MATO GROSSO DO SUL</h4>
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              Descubra as maravilhas do Pantanal, Cerrado e muito mais.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Coluna Direita - Links e Contato */}
          <div className="grid grid-cols-2 gap-6">
            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/ms" className="text-blue-100 hover:text-white text-sm transition-colors">
                    Início
                  </Link>
                </li>
                <li>
                  <Link to="/ms/destinos" className="text-blue-100 hover:text-white text-sm transition-colors">
                    Destinos
                  </Link>
                </li>
                <li>
                  <Link to="/ms/eventos" className="text-blue-100 hover:text-white text-sm transition-colors">
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link to="/ms/parceiros" className="text-blue-100 hover:text-white text-sm transition-colors">
                    Parceiros
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Contato</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-blue-100 text-sm">
                  <Mail className="h-3 w-3" />
                  contato@descubramsconline.com.br
                </li>
                <li className="flex items-center gap-2 text-blue-100 text-sm">
                  <Phone className="h-3 w-3" />
                  (67) 3318-7600
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Linha separadora e Copyright */}
        <div className="border-t border-blue-300 pt-4">
          <div className="text-center">
            <p className="text-blue-200 text-sm">
              © 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UniversalFooter;