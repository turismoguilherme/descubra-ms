import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const UniversalFooterSimple = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sobre MS Turismo</h3>
            <p className="text-gray-300 text-sm">
              Descubra as belezas naturais e culturais de Mato Grosso do Sul. 
              Pantanal, Bonito, Campo Grande e muito mais.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/destinos" className="text-gray-300 hover:text-white">Destinos</a></li>
              <li><a href="/roteiros" className="text-gray-300 hover:text-white">Roteiros</a></li>
              <li><a href="/eventos" className="text-gray-300 hover:text-white">Eventos</a></li>
              <li><a href="/dicas" className="text-gray-300 hover:text-white">Dicas de Viagem</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-gray-300">Campo Grande, MS</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-gray-300">(67) 3318-5000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-gray-300">contato@ms.gov.br</span>
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
              © 2024 Governo de Mato Grosso do Sul. Todos os direitos reservados.
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
};

export default UniversalFooterSimple;