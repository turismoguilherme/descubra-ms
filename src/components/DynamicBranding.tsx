import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ajusta dinamicamente título, favicon e meta tags de compartilhamento conforme o produto atual.
 * Crawlers usam o HTML do build; isto alinha abas e previews em SPA após navegação.
 */
const BRANDS = {
  ms: {
    title: "Descubra Mato Grosso do Sul",
    description:
      "Plataforma oficial de turismo de Mato Grosso do Sul — destinos, eventos, roteiros e passaporte digital.",
    favicon: "/branding/descubra-ms-mark.png",
    faviconType: "image/png",
    ogImage: "https://descubrams.com/branding/descubra-ms-share.jpg",
    siteName: "Descubra Mato Grosso do Sul",
  },
  guata: {
    title: "Guatá Labs",
    description:
      "Tecnologia, inteligência artificial e soluções digitais para destinos, empresas e organizações do turismo.",
    favicon: "/branding/guata-labs-mark.svg",
    faviconType: "image/svg+xml",
    ogImage: "https://viajartur.com/branding/guata-labs-share.png",
    siteName: "Guatá Labs",
  },
} as const;

function isDescubraMsPath(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return (
    path.startsWith("/descubrams") ||
    path.startsWith("/descubramatogrossodosul") ||
    path.startsWith("/ms")
  );
}

function isDescubraMsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "descubrams.com" || host.endsWith(".descubrams.com") || host.includes("descubrams");
}

function isGuataLabsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "viajartur.com" ||
    host.endsWith(".viajartur.com") ||
    host.includes("viajartur") ||
    host === "guatalabs.com" ||
    host.endsWith(".guatalabs.com")
  );
}

function resolveBrand(pathname: string): keyof typeof BRANDS {
  const host = window.location.hostname;
  if (isDescubraMsHost(host)) return "ms";
  if (isGuataLabsHost(host)) return "guata";
  return isDescubraMsPath(pathname) ? "ms" : "guata";
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setFavicon(href: string, type: string) {
  const head = document.head;
  head.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((n) => n.remove());

  const link = document.createElement("link");
  link.rel = "icon";
  link.type = type;
  link.href = href;
  head.appendChild(link);

  const apple = document.createElement("link");
  apple.rel = "apple-touch-icon";
  apple.href = href;
  head.appendChild(apple);
}

const DynamicBranding: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const key = resolveBrand(pathname);
    const brand = BRANDS[key];
    document.title = brand.title;
    setFavicon(brand.favicon, brand.faviconType);

    upsertMeta("name", "description", brand.description);
    upsertMeta("property", "og:site_name", brand.siteName);
    upsertMeta("property", "og:title", brand.title);
    upsertMeta("property", "og:description", brand.description);
    upsertMeta("property", "og:image", brand.ogImage);
    upsertMeta("name", "twitter:title", brand.title);
    upsertMeta("name", "twitter:description", brand.description);
    upsertMeta("name", "twitter:image", brand.ogImage);
  }, [pathname]);

  return null;
};

export default DynamicBranding;
