/**
 * Resolução única de marca (Descubra MS x Guatá Labs) e montagem de links.
 *
 * Regra: os caminhos SEMPRE levam o prefixo da marca (`/descubrams`, `/viajar`),
 * em qualquer domínio. O domínio próprio serve apenas para redirecionar a raiz
 * (`descubrams.com/` → `/descubrams`, `guatalabs.com/` → `/viajar`).
 */

export type Brand = "ms" | "labs";

export const MS_PREFIX = "/descubrams";
export const LABS_PREFIX = "/viajar";

const MS_DOMAINS = ["descubrams.com", "descubra-ms.vercel.app"];
const LABS_DOMAINS = ["viajartur.com", "guatalabs.com", "guata-labs.com"];

function matchesDomain(hostname: string, domains: string[]): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

/** Marca determinada pelo domínio, ou null em domínios compartilhados (preview/localhost). */
export function brandFromHost(hostname: string = getHostname()): Brand | null {
  if (matchesDomain(hostname, MS_DOMAINS)) return "ms";
  if (matchesDomain(hostname, LABS_DOMAINS)) return "labs";
  return null;
}

function getHostname(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname;
}

function getPathname(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

/** Marca determinada pelo prefixo legado do caminho. */
export function brandFromPath(pathname: string = getPathname()): Brand | null {
  const p = pathname.toLowerCase();
  if (
    p === MS_PREFIX ||
    p.startsWith(`${MS_PREFIX}/`) ||
    p.startsWith("/descubramatogrossodosul") ||
    p === "/ms" ||
    p.startsWith("/ms/")
  ) {
    return "ms";
  }
  if (p === LABS_PREFIX || p.startsWith(`${LABS_PREFIX}/`) || p.startsWith("/viajartur")) {
    return "labs";
  }
  return null;
}

/** Marca efetiva: domínio → prefixo legado → padrão (Guatá Labs na raiz compartilhada). */
export function resolveBrand(hostname?: string, pathname?: string): Brand {
  return brandFromHost(hostname) ?? brandFromPath(pathname) ?? "labs";
}

/**
 * Prefixo a aplicar nos links da marca informada.
 * O prefixo existe em TODOS os domínios; o domínio apenas define para onde a raiz redireciona.
 */
export function brandPrefix(brand: Brand = resolveBrand()): string {
  return brand === "ms" ? MS_PREFIX : LABS_PREFIX;
}

/**
 * Monta um link interno da marca. Recebe sempre o caminho "limpo"
 * (`/passaporte`, `/parceiros`, `/`), e devolve com prefixo apenas quando necessário.
 */
export function withBrandPath(path: string, brand: Brand = resolveBrand()): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const prefix = brandPrefix(brand);
  return `${prefix}${clean}` || "/";
}

/** Caminho inicial da marca (home). */
export function brandHomePath(brand: Brand = resolveBrand()): string {
  return withBrandPath("/", brand);
}

/** Remove o prefixo legado de um caminho, devolvendo o caminho limpo. */
export function stripBrandPrefix(pathname: string): string {
  const cleaned = pathname
    .replace(/^\/descubramatogrossodosul/i, "")
    .replace(new RegExp(`^${MS_PREFIX}`, "i"), "")
    .replace(new RegExp(`^${LABS_PREFIX}`, "i"), "");
  return cleaned || "/";
}
