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

  // Footer original para Descubra MS
  return (
    <footer className="bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre MS Turismo */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src="/images/logo-descubra-ms-v2.png" 
                alt="Descubra Mato Grosso do Sul" 
                className="h-12 w-auto mr-4"
                loading="lazy"
              />
              <h3 className="text-2xl font-bold">Descubra MS</h3>
            </div>
            <p className="text-gray-100 text-lg mb-6 leading-relaxed">
              Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade 
              no coração da América do Sul. Descubra Mato Grosso do Sul!
            </p>
            <div className="flex items-center text-gray-100">
              <Heart className="h-5 w-5 mr-2 text-red-400" />
              <span className="text-sm">Feito com amor para o turismo sul-mato-grossense</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/ms/destinos" className="text-gray-100 hover:text-ms-secondary-yellow transition-colors flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Destinos
                </Link>
              </li>
              <li>
                <Link to="/ms/roteiros" className="text-gray-100 hover:text-ms-secondary-yellow transition-colors flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Roteiros
                </Link>
              </li>
              <li>
                <Link to="/ms/eventos" className="text-gray-100 hover:text-ms-secondary-yellow transition-colors flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Eventos
                </Link>
              </li>
              <li>
                <Link to="/ms/parceiros" className="text-gray-100 hover:text-ms-secondary-yellow transition-colors flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Parceiros
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Contato</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-ms-secondary-yellow mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-100 block">Campo Grande, MS</span>
                  <span className="text-gray-200 text-xs">Capital do Estado</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-ms-secondary-yellow flex-shrink-0" />
                <span className="text-gray-100">(67) 3318-5000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-ms-secondary-yellow flex-shrink-0" />
                <span className="text-gray-100">contato@ms.gov.br</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-100 hover:text-ms-secondary-yellow transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-100 hover:text-ms-secondary-yellow transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-100 hover:text-ms-secondary-yellow transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacidade" className="text-gray-200 hover:text-ms-secondary-yellow transition-colors">
                Política de Privacidade
              </a>
              <a href="/termos" className="text-gray-200 hover:text-ms-secondary-yellow transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-200 text-sm">
              © 2024 Governo de Mato Grosso do Sul. Todos os direitos reservados.
            </p>
            <p className="text-gray-300 text-xs mt-2">
              Desenvolvido com tecnologia OverFlow One
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UniversalFooter;