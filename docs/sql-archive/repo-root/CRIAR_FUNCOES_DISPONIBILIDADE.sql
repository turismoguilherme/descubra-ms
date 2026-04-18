-- =====================================================
-- CRIAR FUNÇÕES PARA GERENCIAR DISPONIBILIDADE
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Função para aumentar/diminuir booked_guests
CREATE OR REPLACE FUNCTION public.decrease_booked_guests(
  p_partner_id UUID,
  p_service_id UUID,
  p_date DATE,
  p_guests INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar ou criar registro de disponibilidade
  INSERT INTO public.partner_availability (
    partner_id,
    service_id,
    date,
    booked_guests,
    available
  )
  VALUES (
    p_partner_id,
    p_service_id,
    p_date,
    GREATEST(0, p_guests), -- Não permitir valores negativos
    true
  )
  ON CONFLICT (partner_id, service_id, date)
  DO UPDATE SET
    booked_guests = GREATEST(0, (partner_availability.booked_guests + p_guests)),
    updated_at = now();
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Função para verificar disponibilidade
CREATE OR REPLACE FUNCTION public.check_availability(
  p_partner_id UUID,
  p_service_id UUID,
  p_date DATE,
  p_guests INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available BOOLEAN;
  v_max_guests INTEGER;
  v_booked_guests INTEGER;
BEGIN
  -- Buscar disponibilidade
  SELECT 
    available,
    max_guests,
    booked_guests
  INTO
    v_available,
    v_max_guests,
    v_booked_guests
  FROM public.partner_availability
  WHERE partner_id = p_partner_id
    AND service_id = p_service_id
    AND date = p_date;
  
  -- Se não existe registro, verificar se produto está ativo
  IF v_available IS NULL THEN
    SELECT is_active INTO v_available
    FROM public.partner_pricing
    WHERE id = p_service_id
      AND partner_id = p_partner_id;
    
    -- Se produto está ativo e não há registro de disponibilidade, considerar disponível
    IF v_available = true THEN
      RETURN true;
    ELSE
      RETURN false;
    END IF;
  END IF;
  
  -- Se não está disponível, retornar false
  IF v_available = false THEN
    RETURN false;
  END IF;
  
  -- Se há limite de vagas, verificar
  IF v_max_guests IS NOT NULL THEN
    IF (v_booked_guests + p_guests) > v_max_guests THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Função para obter vagas disponíveis
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_partner_id UUID,
  p_service_id UUID,
  p_date DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_guests INTEGER;
  v_booked_guests INTEGER;
  v_available BOOLEAN;
BEGIN
  SELECT 
    max_guests,
    booked_guests,
    available
  INTO
    v_max_guests,
    v_booked_guests,
    v_available
  FROM public.partner_availability
  WHERE partner_id = p_partner_id
    AND service_id = p_service_id
    AND date = p_date;
  
  -- Se não existe registro, verificar se produto está ativo
  IF v_available IS NULL THEN
    SELECT is_active INTO v_available
    FROM public.partner_pricing
    WHERE id = p_service_id
      AND partner_id = p_partner_id;
    
    -- Se produto está ativo, retornar NULL (sem limite) ou max_guests do produto
    IF v_available = true THEN
      SELECT max_guests INTO v_max_guests
      FROM public.partner_pricing
      WHERE id = p_service_id;
      
      RETURN v_max_guests; -- NULL = sem limite
    ELSE
      RETURN 0;
    END IF;
  END IF;
  
  -- Se não está disponível, retornar 0
  IF v_available = false THEN
    RETURN 0;
  END IF;
  
  -- Se não há limite, retornar NULL (sem limite)
  IF v_max_guests IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Retornar vagas disponíveis
  RETURN GREATEST(0, v_max_guests - COALESCE(v_booked_guests, 0));
END;
$$;

-- Comentários
COMMENT ON FUNCTION public.decrease_booked_guests IS 'Aumenta ou diminui o número de hóspedes reservados (p_guests pode ser negativo para liberar)';
COMMENT ON FUNCTION public.check_availability IS 'Verifica se há disponibilidade para uma reserva específica';
COMMENT ON FUNCTION public.get_available_slots IS 'Retorna o número de vagas disponíveis (NULL = sem limite)';


