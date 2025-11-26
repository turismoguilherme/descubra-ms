-- Migration: Create Plano Diretor Functions and Triggers
-- Description: Functions and triggers for automatic updates and validations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plano_diretor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_plano_diretor_documents_updated_at
    BEFORE UPDATE ON plano_diretor_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_objetivos_updated_at
    BEFORE UPDATE ON plano_diretor_objetivos
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_estrategias_updated_at
    BEFORE UPDATE ON plano_diretor_estrategias
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_acoes_updated_at
    BEFORE UPDATE ON plano_diretor_acoes
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_indicadores_updated_at
    BEFORE UPDATE ON plano_diretor_indicadores
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_colaboradores_updated_at
    BEFORE UPDATE ON plano_diretor_colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

CREATE TRIGGER update_plano_diretor_comentarios_updated_at
    BEFORE UPDATE ON plano_diretor_comentarios
    FOR EACH ROW
    EXECUTE FUNCTION update_plano_diretor_updated_at();

-- Function to calculate objetivo progress based on estrategias and acoes
CREATE OR REPLACE FUNCTION calculate_objetivo_progress(objetivo_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_estrategias INTEGER;
    concluidas_estrategias INTEGER;
    total_acoes INTEGER;
    concluidas_acoes INTEGER;
    progress_value NUMERIC;
BEGIN
    -- Count total estrategias
    SELECT COUNT(*) INTO total_estrategias
    FROM plano_diretor_estrategias
    WHERE objetivo_id = objetivo_uuid
    AND status != 'cancelada';
    
    -- Count completed estrategias
    SELECT COUNT(*) INTO concluidas_estrategias
    FROM plano_diretor_estrategias
    WHERE objetivo_id = objetivo_uuid
    AND status = 'concluida';
    
    -- Count total acoes
    SELECT COUNT(*) INTO total_acoes
    FROM plano_diretor_acoes a
    JOIN plano_diretor_estrategias e ON a.estrategia_id = e.id
    WHERE e.objetivo_id = objetivo_uuid
    AND a.status != 'cancelada';
    
    -- Count completed acoes
    SELECT COUNT(*) INTO concluidas_acoes
    FROM plano_diretor_acoes a
    JOIN plano_diretor_estrategias e ON a.estrategia_id = e.id
    WHERE e.objetivo_id = objetivo_uuid
    AND a.status = 'concluida';
    
    -- Calculate weighted progress
    IF total_estrategias = 0 AND total_acoes = 0 THEN
        RETURN 0;
    END IF;
    
    IF total_estrategias > 0 AND total_acoes > 0 THEN
        -- Weight: 40% estrategias, 60% acoes
        progress_value := (
            (concluidas_estrategias::NUMERIC / NULLIF(total_estrategias, 0) * 40) +
            (concluidas_acoes::NUMERIC / NULLIF(total_acoes, 0) * 60)
        );
    ELSIF total_estrategias > 0 THEN
        progress_value := (concluidas_estrategias::NUMERIC / NULLIF(total_estrategias, 0) * 100);
    ELSE
        progress_value := (concluidas_acoes::NUMERIC / NULLIF(total_acoes, 0) * 100);
    END IF;
    
    RETURN LEAST(100, GREATEST(0, ROUND(progress_value, 2)));
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to validate colaborador permissions
CREATE OR REPLACE FUNCTION check_colaborador_permission(
    colaborador_uuid UUID,
    required_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    colaborador_record RECORD;
    has_permission BOOLEAN := false;
BEGIN
    SELECT nivel_acesso, permissoes, ativo
    INTO colaborador_record
    FROM plano_diretor_colaboradores
    WHERE id = colaborador_uuid;
    
    IF NOT FOUND OR NOT colaborador_record.ativo THEN
        RETURN false;
    END IF;
    
    -- Check nivel_acesso
    IF required_permission = 'visualizar' THEN
        has_permission := true; -- Everyone can view
    ELSIF required_permission = 'editar' THEN
        has_permission := colaborador_record.nivel_acesso IN ('editar', 'aprovar');
    ELSIF required_permission = 'aprovar' THEN
        has_permission := colaborador_record.nivel_acesso = 'aprovar';
    END IF;
    
    -- Check custom permissions in JSONB
    IF colaborador_record.permissoes ? required_permission THEN
        has_permission := (colaborador_record.permissoes->>required_permission)::boolean;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to create historico entry automatically
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

-- Trigger for historico (only on main tables)
CREATE TRIGGER trigger_plano_diretor_documents_historico
    AFTER INSERT OR UPDATE ON plano_diretor_documents
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

CREATE TRIGGER trigger_plano_diretor_objetivos_historico
    AFTER INSERT OR UPDATE ON plano_diretor_objetivos
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

CREATE TRIGGER trigger_plano_diretor_estrategias_historico
    AFTER INSERT OR UPDATE ON plano_diretor_estrategias
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

CREATE TRIGGER trigger_plano_diretor_acoes_historico
    AFTER INSERT OR UPDATE ON plano_diretor_acoes
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

CREATE TRIGGER trigger_plano_diretor_indicadores_historico
    AFTER INSERT OR UPDATE ON plano_diretor_indicadores
    FOR EACH ROW
    EXECUTE FUNCTION create_plano_diretor_historico_entry();

-- Function to auto-update objetivo progress when estrategias/acoes change
CREATE OR REPLACE FUNCTION auto_update_objetivo_progress()
RETURNS TRIGGER AS $$
DECLARE
    objetivo_uuid UUID;
BEGIN
    -- Get objetivo_id
    IF TG_TABLE_NAME = 'plano_diretor_estrategias' THEN
        objetivo_uuid := NEW.objetivo_id;
    ELSIF TG_TABLE_NAME = 'plano_diretor_acoes' THEN
        SELECT e.objetivo_id INTO objetivo_uuid
        FROM plano_diretor_estrategias e
        WHERE e.id = NEW.estrategia_id;
    END IF;
    
    IF objetivo_uuid IS NOT NULL THEN
        UPDATE plano_diretor_objetivos
        SET progresso = calculate_objetivo_progress(objetivo_uuid),
            updated_at = NOW()
        WHERE id = objetivo_uuid;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update progress
CREATE TRIGGER trigger_auto_update_progress_estrategias
    AFTER INSERT OR UPDATE OR DELETE ON plano_diretor_estrategias
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_objetivo_progress();

CREATE TRIGGER trigger_auto_update_progress_acoes
    AFTER INSERT OR UPDATE OR DELETE ON plano_diretor_acoes
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_objetivo_progress();

