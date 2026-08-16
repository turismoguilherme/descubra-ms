-- Recuperação de senha usa exclusivamente o Supabase Auth; tabela/funções legadas
DROP FUNCTION IF EXISTS public.create_password_reset_token(text);
DROP FUNCTION IF EXISTS public.validate_password_reset_token(text, text);
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;

-- Módulo legado FlowTrip: tabela sem uso na aplicação
DROP TABLE IF EXISTS public.flowtrip_state_features CASCADE;