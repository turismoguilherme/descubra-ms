
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Facebook, Instagram, Twitter, Youtube, Settings } from "lucide-react";
import { useInstitutionalContent } from "@/hooks/useInstitutionalContent";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from '@/context/BrandContext'; // Importar useBrand

const Footer = () => {
  const { getContentValue } = useInstitutionalContent();
  const { user } = useAuth();
  const location = useLocation();
  const { config } = useBrand(); // Usar o contexto da marca
  
  // Detectar tenant do path atual
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTenant = pathSegments[0]; // 'ms', 'mt', etc.
  const isTenantPath = currentTenant && currentTenant.length === 2;
  
  console.log("🏛️ FOOTER: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath);

  const description = getContentValue('footer_description');
  const facebookLink = getContentValue('footer_facebook_link');
  const instagramLink = getContentValue('footer_instagram_link');
  const twitterLink = getContentValue('footer_twitter_link');
  const youtubeLink = getContentValue('footer_youtube_link');
  const contactEmail = getContentValue('footer_contact_email');
  const contactPhone = getContentValue('footer_contact_phone');
  
  const getPathWithTenant = (path: string) => {
    return isTenantPath ? `/${currentTenant}${path}` : path;
  };

  return (
    <footer className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white">
      <div className="ms-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img 
                src={config.logo.src} 
                alt={config.logo.alt}
                className="h-14 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <p className="text-gray-100 mb-4 max-w-sm">
              {description || 'Descubra as maravilhas do Pantanal, Cerrado e muito mais. Sua jornada pelo coração da América do Sul começa aqui.'}
            </p>
            <p className="text-gray-200 text-sm">
              Uma iniciativa de Guilherme Arevalo
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Links Rápidos</h3>
            <ul className="space-y-3">
              <li><Link to={getPathWithTenant("/")} className="text-gray-100 hover:text-white transition-colors">Início</Link></li>
              <li><Link to={getPathWithTenant("/destinos")} className="text-gray-100 hover:text-white transition-colors">Destinos</Link></li>
              <li><Link to={getPathWithTenant("/eventos")} className="text-gray-100 hover:text-white transition-colors">Eventos</Link></li>
              <li><Link to={getPathWithTenant("/parceiros")} className="text-gray-100 hover:text-white transition-colors">Parceiros</Link></li>
              <li><Link to={getPathWithTenant("/passaporte")} className="text-gray-100 hover:text-white transition-colors">Passaporte</Link></li>
            </ul>
          </div>
          
          {/* More Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Mais</h3>
            <ul className="space-y-3">
              <li><Link to={getPathWithTenant("/guata")} className="text-gray-100 hover:text-white transition-colors">Guatá</Link></li>
              <li><Link to={getPathWithTenant("/welcome")} className="text-gray-100 hover:text-white transition-colors">Cadastre-se</Link></li>
              <li>
                <Link to="/admin-login" className="text-gray-100 hover:text-white transition-colors flex items-center gap-1">
                  <ShieldCheck size={16} />
                  Área Restrita
                </Link>
              </li>
              {/* Master Dashboard - apenas para admins */}
              {user && (
                <li>
                  <Link to="/master-dashboard" className="text-gray-100 hover:text-white transition-colors flex items-center gap-1">
                    <Settings size={16} />
                    Master Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact and Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Siga-nos</h3>
            <div className="flex space-x-4 mb-6">
              <a href={facebookLink || "#"} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-100 hover:text-white transition-colors">
                <Facebook size={24} />
              </a>
              <a href={instagramLink || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-100 hover:text-white transition-colors">
                <Instagram size={24} />
              </a>
              <a href={twitterLink || "#"} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-100 hover:text-white transition-colors">
                <Twitter size={24} />
              </a>
              <a href={youtubeLink || "#"} target="_blank" rel="noopener noreferrer" aria-label="Youtube" className="text-gray-100 hover:text-white transition-colors">
                <Youtube size={24} />
              </a>
            </div>
             <h3 className="text-lg font-semibold mb-2 text-white">Contato</h3>
            <p className="text-gray-100 text-sm">
              {contactEmail || 'contato@descubramsconline.com.br'}<br />
              {contactPhone || '(67) 3318-7600'}
            </p>
          </div>
        </div>

        <div className="border-t border-ms-primary-blue/50 mt-12 pt-8 text-center text-gray-100 text-sm">
          <p>
            © {new Date().getFullYear()} Descubra Mato Grosso do Sul. Todos os direitos reservados.
          </p>
          <p className="mt-2">
            Desenvolvido por: Guilherme Arevalo
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
