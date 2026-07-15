import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

type SiteBrand = "descubrams" | "guata-labs";

const siteProfiles: Record<SiteBrand, {
  title: string;
  description: string;
  url: string;
  favicon: string;
  image: string;
  imageAlt: string;
  schema: Record<string, unknown>;
}> = {
  descubrams: {
    title: "Descubra Mato Grosso do Sul",
    description:
      "Escolha destinos, combine experiências e descubra o melhor de Mato Grosso do Sul com roteiros feitos para você. Turismo, cultura e natureza no Brasil.",
    url: "https://descubrams.com/",
    favicon: "/branding/descubra-ms-mark.png",
    image: "https://descubrams.com/branding/descubra-ms-mark.png",
    imageAlt: "Descubra Mato Grosso do Sul",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://descubrams.com/#website",
          name: "Descubra Mato Grosso do Sul",
          url: "https://descubrams.com/",
          inLanguage: "pt-BR",
          publisher: { "@id": "https://descubrams.com/#organization" },
        },
        {
          "@type": "TourismOrganization",
          "@id": "https://descubrams.com/#organization",
          name: "Descubra Mato Grosso do Sul",
          url: "https://descubrams.com/",
          logo: "https://descubrams.com/branding/descubra-ms-mark.png",
          areaServed: {
            "@type": "AdministrativeArea",
            name: "Mato Grosso do Sul",
            containedInPlace: { "@type": "Country", name: "Brasil" },
          },
        },
      ],
    },
  },
  "guata-labs": {
    title: "Guatá Labs — Tecnologia e IA para o Turismo",
    description:
      "Tecnologia, inteligência artificial e soluções digitais para destinos, empresas e organizações do turismo.",
    url: "https://viajartur.com/",
    favicon: "/branding/guata-labs-mark.svg",
    image: "https://viajartur.com/branding/guata-labs-share.svg",
    imageAlt: "Guatá Labs — Tecnologia e IA para o Turismo",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://viajartur.com/#website",
          name: "Guatá Labs",
          alternateName: "Guatá Labs — Tecnologia e IA para o Turismo",
          url: "https://viajartur.com/",
          inLanguage: "pt-BR",
          publisher: { "@id": "https://viajartur.com/#organization" },
        },
        {
          "@type": "Organization",
          "@id": "https://viajartur.com/#organization",
          name: "Guatá Labs",
          url: "https://viajartur.com/",
          logo: "https://viajartur.com/branding/guata-labs-mark.svg",
          description:
            "Empresa de tecnologia e inteligência artificial para o turismo.",
          knowsAbout: [
            "Inteligência artificial",
            "Tecnologia para turismo",
            "Gestão de destinos turísticos",
            "Transformação digital",
          ],
        },
      ],
    },
  },
};

function resolveSiteBrand(mode: string): SiteBrand {
  return mode === "guata-labs" ? "guata-labs" : "descubrams";
}

function siteIdentityPlugin(brand: SiteBrand): Plugin {
  const profile = siteProfiles[brand];
  return {
    name: "site-identity",
    transformIndexHtml() {
      return [
        { tag: "title", children: profile.title, injectTo: "head" as const },
        {
          tag: "meta",
          attrs: { name: "description", content: profile.description },
          injectTo: "head" as const,
        },
        {
          tag: "link",
          attrs: { rel: "canonical", href: profile.url },
          injectTo: "head" as const,
        },
        {
          tag: "link",
          attrs: { rel: "icon", href: profile.favicon, type: brand === "guata-labs" ? "image/svg+xml" : "image/png" },
          injectTo: "head" as const,
        },
        {
          tag: "link",
          attrs: { rel: "apple-touch-icon", href: profile.favicon },
          injectTo: "head" as const,
        },
        { tag: "meta", attrs: { property: "og:site_name", content: brand === "guata-labs" ? "Guatá Labs" : "Descubra Mato Grosso do Sul" }, injectTo: "head" as const },
        { tag: "meta", attrs: { property: "og:title", content: profile.title }, injectTo: "head" as const },
        { tag: "meta", attrs: { property: "og:description", content: profile.description }, injectTo: "head" as const },
        { tag: "meta", attrs: { property: "og:type", content: "website" }, injectTo: "head" as const },
        { tag: "meta", attrs: { property: "og:url", content: profile.url }, injectTo: "head" as const },
        { tag: "meta", attrs: { property: "og:locale", content: "pt_BR" }, injectTo: "head" as const },
        { tag: "meta", attrs: { property: "og:image", content: profile.image }, injectTo: "head" as const },
        { tag: "meta", attrs: { property: "og:image:alt", content: profile.imageAlt }, injectTo: "head" as const },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" }, injectTo: "head" as const },
        { tag: "meta", attrs: { name: "twitter:title", content: profile.title }, injectTo: "head" as const },
        { tag: "meta", attrs: { name: "twitter:description", content: profile.description }, injectTo: "head" as const },
        { tag: "meta", attrs: { name: "twitter:image", content: profile.image }, injectTo: "head" as const },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: JSON.stringify(profile.schema),
          injectTo: "head" as const,
        },
      ];
    },
    generateBundle() {
      const host = new URL(profile.url).hostname;
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${profile.url}sitemap.xml\nHost: ${host}\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source:
          brand === "guata-labs"
            ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://viajartur.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>https://viajartur.com/solucoes</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n  <url><loc>https://viajartur.com/casos-sucesso</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n  <url><loc>https://viajartur.com/sobre</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n  <url><loc>https://viajartur.com/contato</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>\n`
            : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://descubrams.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>https://descubrams.com/descubrams/destinos</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>\n  <url><loc>https://descubrams.com/descubrams/eventos</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n  <url><loc>https://descubrams.com/descubrams/roteiros</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>\n  <url><loc>https://descubrams.com/descubrams/parceiros</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n  <url><loc>https://descubrams.com/descubrams/sobre</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>\n`,
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const brand = resolveSiteBrand(mode);
  return {
  server: {
    host: "::",
    port: 8080,
    // Middleware para normalizar barras invertidas em URLs
    middlewareMode: false,
  },
  plugins: [
    siteIdentityPlugin(brand),
    react(),
    mode === 'development' && componentTagger(),
    // Plugin para normalizar barras invertidas em desenvolvimento
    mode === 'development' && {
      name: 'normalize-backslash',
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          if (req.url && req.url.includes('\\')) {
            const normalizedUrl = req.url.replace(/\\/g, '/');
            req.url = normalizedUrl;
          }
          next();
        });
      }
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Removido manualChunks para evitar problemas de ordem de inicialização no Vercel
    // O Vite gerenciará automaticamente o chunking de forma mais segura
    chunkSizeWarningLimit: 1000, // Aumentar limite para 1MB
    rollupOptions: {
      output: {
        // Garantir nomes de arquivo consistentes
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Evitar problemas de carregamento dinâmico
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    // Garantir que os assets sejam servidos corretamente
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'zod', '@hookform/resolvers', 'i18next', 'react-i18next', 'i18next-browser-languagedetector', '@tanstack/react-query'],
    // Garantir que zod seja pré-otimizado para evitar problemas de inicialização
    // Adicionar i18next e dependências ao optimizeDeps para forçar pré-otimização
    // Adicionar @tanstack/react-query para garantir resolução correta do React
  },
}});
