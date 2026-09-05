# Prefixos fixos por marca + redirecionamento pelo domínio

Ajuste conforme o pedido: os endereços continuam sempre com `/descubrams` (Descubra MS) e `/viajar` (Guatá Labs), em qualquer domínio. O domínio só decide para onde a raiz redireciona.

## Comportamento final

- `descubrams.com/` → redireciona para `descubrams.com/descubrams`
- `guatalabs.com/` (e `viajartur.com`) → redireciona para `/viajar`
- Preview da Lovable e localhost: continuam como hoje, escolhendo a marca pelo prefixo do endereço.
- Endereços já divulgados (links, e-mails, QR codes) seguem funcionando sem mudança, porque o prefixo não desaparece mais.
- `/descubramatogrossodosul/...` e `/ms/...` continuam redirecionando para `/descubrams`.

## O que muda no código

1. `src/lib/brandRoutes.ts`
   - `brandPrefix()` passa a devolver sempre `/descubrams` ou `/viajar` (remove a dependência de `isCleanUrlDomain`).
   - Mantém `brandFromHost`, `brandFromPath`, `resolveBrand` e `stripBrandPrefix`; `isCleanUrlDomain` deixa de ser usada para montar links.

2. `src/App.tsx`
   - Remove o modo "URL limpa": deixa de registrar as rotas do MS na raiz e apaga `RedirectToCleanUrl`.
   - A marca exibida volta a ser decidida pelo prefixo do caminho (`showMS` / `showViajar`), sem o `cleanUrls`.
   - Adiciona um único redirecionador de raiz: se o caminho é `/` e o domínio identifica a marca, `Navigate` para `/descubrams` ou `/viajar`.
   - Fallback `*` continua na marca correspondente ao prefixo/domínio.

3. Montagem de links (`Navbar`, menus/footer, `authRedirect.ts`, `passwordReset.ts`)
   - Passam a usar `withBrandPath`, que agora sempre inclui o prefixo — elimina as cadeias de `if` por hostname e a lógica de tenant duplicada na `Navbar`.

## Fora deste escopo

- Separação de bancos de dados entre as duas plataformas.
- Pacote de código isolado do Passaporte Digital + Parceiros (Parte 2 do plano anterior) — feito depois, se você quiser.
