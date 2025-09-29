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

  // Footer original para Descubra MS - baseado na imagem
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Logo e Descrição */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-900 font-bold text-sm">MS</span>
              </div>
              <h3 className="text-lg font-bold">DESCUBRA MATO GROSSO DO SUL</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Descubra as maravilhas do Pantanal, Cerrado e muito mais. 
              Sua jornada pelo coração da América do Sul começa aqui.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Coluna Meio - Explore */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ms" className="text-gray-300 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/ms/destinos" className="text-gray-300 hover:text-white transition-colors">
                  Destinos
                </Link>
              </li>
              <li>
                <Link to="/ms/eventos" className="text-gray-300 hover:text-white transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link to="/ms/parceiros" className="text-gray-300 hover:text-white transition-colors">
                  Parceiros
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna Direita - Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">
                contato@descubramsconline.com.br
              </li>
              <li className="text-gray-300">
                (67) 3318-7600
              </li>
            </ul>
          </div>
        </div>

        {/* Linha separadora e Copyright */}
        <div className="mt-8 pt-4 border-t border-blue-800">
          <div className="text-center">
            <p className="text-gray-300 text-sm">
              © 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UniversalFooter;