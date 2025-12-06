-- Migration: Fix historico function to handle plano_diretor_documents correctly
-- Description: Fixes the trigger function that was trying to access non-existent campo

-- Recreate the function with correct logic
CREATE OR REPLACE FUNCTION create_plano_diretor_historico_entry()
RETURNS TRIGGER AS $$
DECLARE
    historico_tipo TEXT;
    historico_secao TEXT;
    historico_secao_id UUID;
    alteracoes_data JSONB;
    target_plano_diretor_id UUID;
BEGIN
    -- Determine tipo de alteração
    IF TG_OP = 'INSERT' THEN
        historico_tipo := 'criacao';
    ELSIF TG_OP = 'UPDATE' THEN
        historico_tipo := 'edicao';
    ELSE
        RETURN NULL;
    END IF;
    
    -- Determine secao based on table
    IF TG_TABLE_NAME = 'plano_diretor_documents' THEN
        historico_secao := 'geral';
        historico_secao_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_objetivos' THEN
        historico_secao := 'objetivo';
        historico_secao_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_estrategias' THEN
        historico_secao := 'estrategia';
        historico_secao_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_acoes' THEN
        historico_secao := 'acao';
        historico_secao_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_indicadores' THEN
        historico_secao := 'indicador';
        historico_secao_id := NEW.id;
    ELSE
        RETURN NEW;
    END IF;
    
    -- Build alteracoes JSONB
    IF TG_OP = 'UPDATE' THEN
        alteracoes_data := jsonb_build_object(
            'campo', 'multiple',
            'valor_anterior', to_jsonb(OLD),
            'valor_novo', to_jsonb(NEW)
        );
    ELSE
        alteracoes_data := to_jsonb(NEW);
    END IF;
    
    -- Get plano_diretor_id based on table
    IF TG_TABLE_NAME = 'plano_diretor_documents' THEN
        target_plano_diretor_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_objetivos' THEN
        target_plano_diretor_id := NEW.plano_diretor_id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_estrategias' THEN
        target_plano_diretor_id := NEW.plano_diretor_id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_acoes' THEN
        SELECT e.plano_diretor_id INTO target_plano_diretor_id
        FROM plano_diretor_estrategias e
        WHERE e.id = NEW.estrategia_id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_indicadores' THEN
        target_plano_diretor_id := NEW.plano_diretor_id;
    END IF;
    
    -- Insert historico entry
    INSERT INTO plano_diretor_historico (
        plano_diretor_id,
        versao,
        autor_id,
        tipo_alteracao,
        secao,
        secao_id,
        alteracoes
    )
    VALUES (
        target_plano_diretor_id,
        (SELECT versao FROM plano_diretor_documents WHERE id = target_plano_diretor_id),
        COALESCE(
            (SELECT current_setting('request.jwt.claim.user_id', true)::uuid),
            auth.uid()
        ),
        historico_tipo,
        historico_secao,
        historico_secao_id,
        alteracoes_data
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;























