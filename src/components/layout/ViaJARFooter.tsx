import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Instagram, Linkedin, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ViaJARFooter: React.FC = () => {
  const { userProfile, user, loading } = useAuth();
  
  // Verificar se é admin - considerar diferentes formatos de role
  const userRole = userProfile?.role?.toLowerCase() || '';
  const isAdmin = !loading && 
                  user && 
                  userProfile && 
                  (userRole === 'admin' || 
                   userRole === 'master_admin' || 
                   userRole === 'tech' ||
                   userRole === 'master admin' ||
                   userRole === 'tech admin');

  // Debug temporário - remover depois
  React.useEffect(() => {
    if (user) {
      console.log('🔍 Footer Debug:', {
        user: user?.email,
        userProfile,
        role: userProfile?.role,
        userRole,
        isAdmin,
        loading
      });
    }
  }, [user, userProfile, userRole, isAdmin, loading]);

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo e Copyright */}
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold">
              <span className="text-blue-900">Viaj</span>
              <span className="text-cyan-500">AR</span>
            </div>
            <span className="text-gray-400 hidden md:inline">•</span>
            <span className="text-gray-500 text-sm">
              © 2025 ViaJAR. Todos os direitos reservados.
            </span>
          </div>

          {/* Links e Redes Sociais */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Links Legais */}
            <div className="flex gap-4 text-sm">
              <Link 
                to="/privacidade" 
                className="text-gray-500 hover:text-cyan-600 transition-colors"
              >
                Privacidade
              </Link>
              <Link 
                to="/termos" 
                className="text-gray-500 hover:text-cyan-600 transition-colors"
              >
                Termos
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-500 hover:text-cyan-600 transition-colors"
              >
                Cookies
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                to="/viajar/admin" 
                className="text-gray-500 hover:text-cyan-600 transition-colors text-xs flex items-center gap-1"
                title="Área Administrativa"
              >
                <Shield className="h-3 w-3" />
                <span>Admin</span>
              </Link>
            </div>

            {/* Separador */}
            <span className="text-gray-300 hidden md:inline">|</span>

            {/* Redes Sociais */}
            <div className="flex gap-3">
              <a 
                href="#" 
                className="text-gray-400 hover:text-cyan-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-cyan-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-cyan-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>

            {/* Contato */}
            <div className="flex items-center gap-3 text-sm">
              <a 
                href="mailto:contato@viajar.com.br" 
                className="text-gray-500 hover:text-cyan-600 transition-colors flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                <span className="hidden lg:inline">contato@viajar.com.br</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ViaJARFooter;
