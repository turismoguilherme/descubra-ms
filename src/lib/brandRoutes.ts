/**
 * Resolução única de marca (Descubra MS x Guatá Labs) e montagem de links.
 *
 * Ordem de decisão:
 *  1. Domínio próprio (descubrams.com / viajartur.com|guatalabs.com) → marca definida,
 *     e as URLs ficam SEM prefixo (`/passaporte`, `/parceiros`, ...).
 *  2. Domínio compartilhado (preview da Lovable, localhost, vercel.app) → a marca é
 *     definida pelo prefixo do caminho, que continua existindo para poder alternar.
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

/** True quando as URLs devem ser servidas sem prefixo (domínio próprio). */
export function isCleanUrlDomain(hostname?: string): boolean {
  return brandFromHost(hostname) !== null;
}

/**
 * Prefixo a aplicar nos links da marca informada (vazio em domínio próprio).
 * `brand` padrão = marca efetiva do contexto atual.
 */
export function brandPrefix(brand: Brand = resolveBrand()): string {
  if (isCleanUrlDomain()) return "";
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
