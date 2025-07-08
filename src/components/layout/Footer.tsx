
import { Link } from "react-router-dom";
import { ShieldCheck, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useInstitutionalContent } from "@/hooks/useInstitutionalContent";

const Footer = () => {
  const { getContentValue } = useInstitutionalContent();

  const description = getContentValue('footer_description');
  const initiative = getContentValue('footer_initiative');
  const facebookLink = getContentValue('footer_facebook_link');
  const instagramLink = getContentValue('footer_instagram_link');
  const twitterLink = getContentValue('footer_twitter_link');
  const youtubeLink = getContentValue('footer_youtube_link');
  const contactEmail = getContentValue('footer_contact_email');
  const contactPhone = getContentValue('footer_contact_phone');

  return (
    <footer className="bg-ms-rivers-blue text-white">
      <div className="ms-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/1e2f844e-0cd3-4b3b-84b6-85904f67ebc7.png" 
                alt="Isto é Mato Grosso do Sul" 
                className="h-12 filter invert brightness-0"
              />
            </div>
            <p className="text-gray-100 mb-4 max-w-sm">
              {description || 'Sua plataforma digital para explorar as maravilhas do Mato Grosso do Sul, conhecer a cultura local e planejar suas viagens.'}
            </p>
            <p className="text-gray-200 text-sm">
              {initiative || 'Uma iniciativa da Fundtur-MS'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Links Rápidos</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-100 hover:text-white transition-colors">Início</Link></li>
              <li><Link to="/destinos" className="text-gray-100 hover:text-white transition-colors">Destinos</Link></li>
              <li><Link to="/eventos" className="text-gray-100 hover:text-white transition-colors">Eventos</Link></li>
              <li><Link to="/parceiros" className="text-gray-100 hover:text-white transition-colors">Parceiros</Link></li>
              <li><Link to="/passaporte" className="text-gray-100 hover:text-white transition-colors">Passaporte</Link></li>
            </ul>
          </div>
          
          {/* More Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Mais</h3>
            <ul className="space-y-3">
              <li><Link to="/delinha" className="text-gray-100 hover:text-white transition-colors">Delinha</Link></li>
              <li><Link to="/welcome" className="text-gray-100 hover:text-white transition-colors">Cadastre-se</Link></li>
              <li>
                <Link to="/admin-login" className="text-gray-100 hover:text-white transition-colors flex items-center gap-1">
                  <ShieldCheck size={16} />
                  Área Restrita
                </Link>
              </li>
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
              {contactEmail || 'contato@istoems.com.br'}<br />
              {contactPhone || '(67) 3318-7600'}
            </p>
          </div>
        </div>

        <div className="border-t border-ms-primary-blue/50 mt-12 pt-8 text-center text-gray-100 text-sm">
          <p>
            © {new Date().getFullYear()} Isto é Mato Grosso do Sul. Todos os direitos reservados.
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
