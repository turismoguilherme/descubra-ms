// Serviço ativo de IA do Guatá (única entrada consumida pelo app).
// Os antigos serviços paralelos (adaptive, restored, supabase, fallback,
// simple, ultra fast, intelligent, smart hybrid, instant, etc.) foram
// removidos por não estarem em uso.
export { guataTrueApiService } from "./guataTrueApiService";
export type { TrueApiQuery, TrueApiResponse } from "./guataTrueApiService";
