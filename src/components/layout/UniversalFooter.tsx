import { Link } from "react-router-dom";
import { ShieldCheck, Facebook, Instagram, Twitter, Youtube, Building, Users, ChartBar, Headphones } from "lucide-react";
import { useInstitutionalContent } from "@/hooks/useInstitutionalContent";
import { useBrand } from "@/context/BrandContext";

const UniversalFooter = () => {
  const { getContentValue } = useInstitutionalContent();
  const { isFlowTrip, config } = useBrand();

  const description = getContentValue('footer_description');
  const facebookLink = getContentValue('footer_facebook_link');
  const instagramLink = getContentValue('footer_instagram_link');
  const twitterLink = getContentValue('footer_twitter_link');
  const youtubeLink = getContentValue('footer_youtube_link');
  const contactEmail = getContentValue('footer_contact_email');
  const contactPhone = getContentValue('footer_contact_phone');

  const getLinks = () => {
    if (isFlowTrip) {
      return {
        primary: [
          { to: "/", label: "Início" },
          { to: "/solucoes", label: "Soluções" },
          { to: "/casos-sucesso", label: "Cases" },
          { to: "/precos", label: "Preços" },
          { to: "/contato-flowtrip", label: "Contato" }
        ],
        secondary: [
          { to: "/documentacao", label: "Documentação" },
          { to: "/blog", label: "Blog" },
          { to: "/sobre-flowtrip", label: "Sobre FlowTrip" },
          { to: "/admin-login", label: "Portal Cliente", icon: ShieldCheck }
        ]
      };
    } else {
      return {
        primary: [
          { to: "/ms/", label: "Início" },
          { to: "/ms/destinos", label: "Destinos" },
          { to: "/ms/eventos", label: "Eventos" },
          { to: "/ms/parceiros", label: "Parceiros" },
          { to: "/ms/passaporte", label: "Passaporte" }
        ],
        secondary: [
          { to: "/ms/guata", label: "Guatá" },
          { to: "/ms/welcome", label: "Cadastre-se" },
          { to: "/admin-login", label: "Área Restrita", icon: ShieldCheck }
        ]
      };
    }
  };

  const getContactInfo = () => {
    if (isFlowTrip) {
      return {
        email: "contato@flowtrip.com.br",
        phone: "(11) 3000-0000",
        description: "FlowTrip - Plataforma SaaS para gestão de turismo estadual. Transforme a experiência turística do seu estado com tecnologia de ponta."
      };
    } else {
      return {
        email: contactEmail || 'contato@descubramsconline.com.br',
        phone: contactPhone || '(67) 3318-7600',
        description: description || 'Descubra as maravilhas do Pantanal, Cerrado e muito mais. Sua jornada pelo coração da América do Sul começa aqui.'
      };
    }
  };

  const getSocialIcons = () => {
    if (isFlowTrip) {
      return [
        { href: "https://linkedin.com/company/flowtrip", icon: Building, label: "LinkedIn" },
        { href: "https://twitter.com/flowtrip", icon: Twitter, label: "Twitter" },
        { href: "https://youtube.com/flowtrip", icon: Youtube, label: "YouTube" }
      ];
    } else {
      return [
        { href: facebookLink || "#", icon: Facebook, label: "Facebook" },
        { href: instagramLink || "#", icon: Instagram, label: "Instagram" },
        { href: twitterLink || "#", icon: Twitter, label: "Twitter" },
        { href: youtubeLink || "#", icon: Youtube, label: "YouTube" }
      ];
    }
  };

  const getAdditionalSections = () => {
    if (isFlowTrip) {
      return [
        {
          title: "Recursos",
          items: [
            { to: "/recursos/analytics", label: "Analytics Avançado", icon: ChartBar },
            { to: "/recursos/white-label", label: "White Label", icon: Building },
            { to: "/recursos/multi-tenant", label: "Multi-tenant", icon: Users },
            { to: "/suporte", label: "Suporte 24/7", icon: Headphones }
          ]
        }
      ];
    }
    return [];
  };

  const links = getLinks();
  const contact = getContactInfo();
  const socialIcons = getSocialIcons();
  const additionalSections = getAdditionalSections();

  return (
    <footer className={`${isFlowTrip 
      ? 'bg-gradient-to-r from-slate-900 to-slate-800' 
      : 'bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal'} text-white`}>
      <div className="ms-container py-16">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isFlowTrip ? '6' : '5'} gap-8`}>
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img 
                src={config.logo.src} 
                alt={config.logo.alt}
                className="h-14 w-auto object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div 
                className="hidden text-2xl font-bold text-white"
                style={{ display: 'none' }}
              >
                {config.logo.fallback}
              </div>
            </div>
            <p className="text-gray-100 mb-4 max-w-sm">
              {contact.description}
            </p>
            <p className="text-gray-200 text-sm">
              {isFlowTrip 
                ? "Desenvolvido por FlowTrip Labs" 
                : "Uma iniciativa de Guilherme Arevalo"}
            </p>
          </div>

          {/* Primary Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {isFlowTrip ? "Soluções" : "Links Rápidos"}
            </h3>
            <ul className="space-y-3">
              {links.primary.map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-100 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Secondary Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {isFlowTrip ? "Empresa" : "Mais"}
            </h3>
            <ul className="space-y-3">
              {links.secondary.map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-100 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {link.icon && <link.icon size={16} />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Sections for FlowTrip */}
          {additionalSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <Link 
                      to={item.to} 
                      className="text-gray-100 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {item.icon && <item.icon size={16} />}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact and Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {isFlowTrip ? "Conecte-se" : "Siga-nos"}
            </h3>
            <div className="flex space-x-4 mb-6">
              {socialIcons.map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={social.label}
                  className="text-gray-100 hover:text-white transition-colors"
                >
                  <social.icon size={24} />
                </a>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Contato</h3>
            <p className="text-gray-100 text-sm">
              {contact.email}<br />
              {contact.phone}
            </p>
          </div>
        </div>

        <div className={`border-t ${isFlowTrip 
          ? 'border-slate-700' 
          : 'border-ms-primary-blue/50'} mt-12 pt-8 text-center text-gray-100 text-sm`}>
          <p>
            © {new Date().getFullYear()} {config.logo.alt}. Todos os direitos reservados.
          </p>
          <p className="mt-2">
            {isFlowTrip 
              ? "FlowTrip® é uma marca registrada da FlowTrip Labs" 
              : "Desenvolvido por: Guilherme Arevalo"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default UniversalFooter;