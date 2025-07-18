
import React from 'react';
import { Mail, Phone, Linkedin, Facebook, Instagram } from 'lucide-react';
import FlowTripLogoProfessional from './FlowTripLogoProfessional';

const FlowTripFooter = () => {
  const quickLinks = [
    { name: 'Sobre', href: '#sobre' },
    { name: 'Funcionalidades', href: '#funcionalidades' },
    { name: 'Cases', href: '#cases' },
    { name: 'Contato', href: '#contato' }
  ];

  const solutions = [
    { name: 'Gestão Estadual', href: '#estadual' },
    { name: 'Gestão Municipal', href: '#municipal' },
    { name: 'Portal do Turista', href: '#portal' },
    { name: 'Analytics', href: '#analytics' }
  ];

  return (
    <footer className="bg-flowtrip-navy-primary text-white">
      <div className="flowtrip-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <FlowTripLogoProfessional 
                size="md" 
                className="text-white [&_*]:text-white" 
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Plataforma líder em gestão turística inteligente para governos estaduais 
              e municipais. Transformamos dados em experiências e destinos em referências.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Links Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Soluções</h3>
            <ul className="space-y-3">
              {solutions.map((solution) => (
                <li key={solution.name}>
                  <a 
                    href={solution.href} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {solution.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-600 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span className="text-gray-300">contato@flowtrip.com.br</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="text-gray-300">+55 (67) 3318-7600</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400 md:text-right">
              © 2024 FlowTrip. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FlowTripFooter;
