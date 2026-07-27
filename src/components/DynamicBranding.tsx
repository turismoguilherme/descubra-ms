import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ajusta dinamicamente o <title> e o favicon da aba conforme o produto atual.
 * Alinhado a BrandContext + host (Descubra MS vs Guatá Labs).
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

function isDescubraMsPath(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return (
    path.startsWith("/descubrams") ||
    path.startsWith("/descubramatogrossodosul") ||
    path.startsWith("/ms") ||
    path.startsWith("/partner") ||
    path.startsWith("/eventos") ||
    path.startsWith("/roteiros") ||
    path.startsWith("/passaporte") ||
    path.startsWith("/cartilhas")
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
    host === "viajar.com"
  );
}

function resolveBrand(pathname: string): keyof typeof BRANDS {
  const host = window.location.hostname;
  if (isDescubraMsHost(host)) return "ms";
  if (isGuataLabsHost(host)) return "guata";
  // localhost / preview: path decides
  return isDescubraMsPath(pathname) ? "ms" : "guata";
}

function setFavicon(href: string, type: string) {
  const head = document.head;
  head.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((n) => n.remove());

  const ico = document.createElement("link");
  ico.rel = "icon";
  ico.href = "/favicon.ico";
  ico.setAttribute("sizes", "any");
  head.appendChild(ico);

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
  }, [pathname]);

  return null;
};

export default DynamicBranding;
