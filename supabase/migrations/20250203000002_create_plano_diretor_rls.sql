-- Migration: Create Plano Diretor RLS Policies
-- Description: Row Level Security policies for access control

-- Helper function to check if user is creator of plano diretor
CREATE OR REPLACE FUNCTION is_plano_diretor_creator(plano_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM plano_diretor_documents
        WHERE id = plano_id AND criador_id = user_id
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function to check if user is colaborador with specific permission
CREATE OR REPLACE FUNCTION is_plano_diretor_colaborador(plano_id UUID, user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    colaborador_record RECORD;
BEGIN
    SELECT nivel_acesso, permissoes, ativo
    INTO colaborador_record
    FROM plano_diretor_colaboradores
    WHERE plano_diretor_id = plano_id
    AND (usuario_id = user_id OR email = (SELECT email FROM auth.users WHERE id = user_id))
    AND ativo = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check nivel_acesso
    IF required_permission = 'visualizar' THEN
        RETURN true;
    ELSIF required_permission = 'editar' THEN
        RETURN colaborador_record.nivel_acesso IN ('editar', 'aprovar');
    ELSIF required_permission = 'aprovar' THEN
        RETURN colaborador_record.nivel_acesso = 'aprovar';
    END IF;
    
    -- Check custom permissions
    IF colaborador_record.permissoes ? required_permission THEN
        RETURN (colaborador_record.permissoes->>required_permission)::boolean;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function to check if user has access (creator or colaborador)
CREATE OR REPLACE FUNCTION has_plano_diretor_access(plano_id UUID, user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Creator has full access
    IF is_plano_diretor_creator(plano_id, user_id) THEN
        RETURN true;
    END IF;
    
    -- Check colaborador permissions
    RETURN is_plano_diretor_colaborador(plano_id, user_id, required_permission);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- RLS Policies for plano_diretor_documents
CREATE POLICY "Creators can view their own planos"
    ON plano_diretor_documents FOR SELECT
    USING (criador_id = auth.uid());

CREATE POLICY "Colaboradores can view planos they have access to"
    ON plano_diretor_documents FOR SELECT
    USING (has_plano_diretor_access(id, auth.uid(), 'visualizar'));

CREATE POLICY "Creators can insert their own planos"
    ON plano_diretor_documents FOR INSERT
    WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Creators can update their own planos"
    ON plano_diretor_documents FOR UPDATE
    USING (criador_id = auth.uid());

CREATE POLICY "Colaboradores with edit permission can update planos"
    ON plano_diretor_documents FOR UPDATE
    USING (has_plano_diretor_access(id, auth.uid(), 'editar'));

CREATE POLICY "Only creators can delete planos"
    ON plano_diretor_documents FOR DELETE
    USING (criador_id = auth.uid());

-- RLS Policies for plano_diretor_objetivos
CREATE POLICY "Users can view objetivos in planos they have access to"
    ON plano_diretor_objetivos FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users with edit permission can insert objetivos"
    ON plano_diretor_objetivos FOR INSERT
    WITH CHECK (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users with edit permission can update objetivos"
    ON plano_diretor_objetivos FOR UPDATE
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users with edit permission can delete objetivos"
    ON plano_diretor_objetivos FOR DELETE
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

-- RLS Policies for plano_diretor_estrategias
CREATE POLICY "Users can view estrategias in planos they have access to"
    ON plano_diretor_estrategias FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_objetivos o
            WHERE o.id = objetivo_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'visualizar')
        )
    );

CREATE POLICY "Users with edit permission can insert estrategias"
    ON plano_diretor_estrategias FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plano_diretor_objetivos o
            WHERE o.id = objetivo_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

CREATE POLICY "Users with edit permission can update estrategias"
    ON plano_diretor_estrategias FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_objetivos o
            WHERE o.id = objetivo_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

CREATE POLICY "Users with edit permission can delete estrategias"
    ON plano_diretor_estrategias FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_objetivos o
            WHERE o.id = objetivo_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

-- RLS Policies for plano_diretor_acoes
CREATE POLICY "Users can view acoes in planos they have access to"
    ON plano_diretor_acoes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_estrategias e
            JOIN plano_diretor_objetivos o ON e.objetivo_id = o.id
            WHERE e.id = estrategia_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'visualizar')
        )
    );

CREATE POLICY "Users with edit permission can insert acoes"
    ON plano_diretor_acoes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plano_diretor_estrategias e
            JOIN plano_diretor_objetivos o ON e.objetivo_id = o.id
            WHERE e.id = estrategia_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

CREATE POLICY "Users with edit permission can update acoes"
    ON plano_diretor_acoes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_estrategias e
            JOIN plano_diretor_objetivos o ON e.objetivo_id = o.id
            WHERE e.id = estrategia_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

CREATE POLICY "Users with edit permission can delete acoes"
    ON plano_diretor_acoes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM plano_diretor_estrategias e
            JOIN plano_diretor_objetivos o ON e.objetivo_id = o.id
            WHERE e.id = estrategia_id
            AND has_plano_diretor_access(o.plano_diretor_id, auth.uid(), 'editar')
        )
    );

-- RLS Policies for plano_diretor_indicadores
CREATE POLICY "Users can view indicadores in planos they have access to"
    ON plano_diretor_indicadores FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users with edit permission can insert indicadores"
    ON plano_diretor_indicadores FOR INSERT
    WITH CHECK (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users with edit permission can update indicadores"
    ON plano_diretor_indicadores FOR UPDATE
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users with edit permission can delete indicadores"
    ON plano_diretor_indicadores FOR DELETE
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

-- RLS Policies for plano_diretor_colaboradores
CREATE POLICY "Creators can view colaboradores of their planos"
    ON plano_diretor_colaboradores FOR SELECT
    USING (is_plano_diretor_creator(plano_diretor_id, auth.uid()));

CREATE POLICY "Colaboradores can view their own colaborador record"
    ON plano_diretor_colaboradores FOR SELECT
    USING (usuario_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Only creators can insert colaboradores"
    ON plano_diretor_colaboradores FOR INSERT
    WITH CHECK (is_plano_diretor_creator(plano_diretor_id, auth.uid()));

CREATE POLICY "Only creators can update colaboradores"
    ON plano_diretor_colaboradores FOR UPDATE
    USING (is_plano_diretor_creator(plano_diretor_id, auth.uid()));

CREATE POLICY "Colaboradores can update their own acceptance"
    ON plano_diretor_colaboradores FOR UPDATE
    USING (
        (usuario_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
    WITH CHECK (
        (usuario_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        AND data_aceite IS NOT NULL
    );

CREATE POLICY "Only creators can delete colaboradores"
    ON plano_diretor_colaboradores FOR DELETE
    USING (is_plano_diretor_creator(plano_diretor_id, auth.uid()));

-- RLS Policies for plano_diretor_comentarios
CREATE POLICY "Users can view comentarios in planos they have access to"
    ON plano_diretor_comentarios FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users with access can insert comentarios"
    ON plano_diretor_comentarios FOR INSERT
    WITH CHECK (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users can update their own comentarios"
    ON plano_diretor_comentarios FOR UPDATE
    USING (autor_id = auth.uid());

CREATE POLICY "Creators and users with edit permission can resolve comentarios"
    ON plano_diretor_comentarios FOR UPDATE
    USING (
        autor_id = auth.uid() OR
        is_plano_diretor_creator(plano_diretor_id, auth.uid()) OR
        is_plano_diretor_colaborador(plano_diretor_id, auth.uid(), 'editar')
    );

CREATE POLICY "Users can delete their own comentarios"
    ON plano_diretor_comentarios FOR DELETE
    USING (autor_id = auth.uid());

-- RLS Policies for plano_diretor_documentos_anexos
CREATE POLICY "Users can view documentos in planos they have access to"
    ON plano_diretor_documentos_anexos FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

CREATE POLICY "Users with edit permission can insert documentos"
    ON plano_diretor_documentos_anexos FOR INSERT
    WITH CHECK (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'editar'));

CREATE POLICY "Users can update documentos they uploaded"
    ON plano_diretor_documentos_anexos FOR UPDATE
    USING (uploader_id = auth.uid());

CREATE POLICY "Users can delete documentos they uploaded"
    ON plano_diretor_documentos_anexos FOR DELETE
    USING (uploader_id = auth.uid());

-- RLS Policies for plano_diretor_historico
CREATE POLICY "Users can view historico of planos they have access to"
    ON plano_diretor_historico FOR SELECT
    USING (has_plano_diretor_access(plano_diretor_id, auth.uid(), 'visualizar'));

-- Historico is insert-only (no UPDATE or DELETE policies)

