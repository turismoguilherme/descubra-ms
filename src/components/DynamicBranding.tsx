import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ajusta dinamicamente o <title> e o favicon da aba conforme o produto atual:
 * - /descubrams/**       → Descubra Mato Grosso do Sul
 * - demais rotas         → Guatá Labs
 * Substitui também o favicon padrão do Lovable pelas marcas próprias.
 */
const BRANDS = {
  ms: {
    title: "Descubra Mato Grosso do Sul",
    favicon: "/branding/descubra-ms-mark.png",
    faviconType: "image/png",
  },
  guata: {
    title: "Guatá Labs",
    favicon: "/branding/guata-labs-mark.svg",
    faviconType: "image/svg+xml",
  },
} as const;

function setFavicon(href: string, type: string) {
  const head = document.head;
  // Remove todos os icon links existentes para não sobreporem
  head.querySelectorAll('link[rel~="icon"]').forEach((n) => n.remove());
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = type;
  link.href = href;
  head.appendChild(link);
}

const DynamicBranding: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const brand = pathname.startsWith("/descubrams") ? BRANDS.ms : BRANDS.guata;
    document.title = brand.title;
    setFavicon(brand.favicon, brand.faviconType);
  }, [pathname]);

  return null;
};

export default DynamicBranding;
