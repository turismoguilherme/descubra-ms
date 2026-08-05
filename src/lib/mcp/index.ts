import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchEvents from "./tools/search-events";
import searchPartners from "./tools/search-partners";
import listPassportRoutes from "./tools/list-passport-routes";
import getMyPassportProgress from "./tools/get-my-passport-progress";
import listMyReservations from "./tools/list-my-reservations";

// O issuer OAuth precisa ser o host direto do Supabase, construído a partir do project ref.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "descubra-ms",
  title: "descubra-ms",
  version: "0.1.0",
  instructions:
    "Ferramentas do Descubra MS (turismo de Mato Grosso do Sul). Use `search_events` para eventos, `search_partners` para parceiros, `list_passport_routes` para roteiros do Passaporte Digital, `get_my_passport_progress` para os selos do usuário logado e `list_my_reservations` para as reservas dele. Todas as ferramentas agem como o usuário autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchEvents,
    searchPartners,
    listPassportRoutes,
    getMyPassportProgress,
    listMyReservations,
  ],
});
