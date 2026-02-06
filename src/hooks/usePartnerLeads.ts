import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Partner } from "@/hooks/usePartners";

export type PartnerLeadRequestType =
  | "day_use"
  | "diaria"
  | "pacote_completo"
  | "passeio_especifico"
  | "gastronomia"
  | "transporte"
  | "evento_grupo"
  | "outro";

export interface CreatePartnerLeadInput {
  partner: Partner;
  fullName: string;
  email: string;
  phone?: string;
  desiredDate?: string;
  peopleCount?: number;
  requestType: PartnerLeadRequestType;
  message?: string;
}

interface CreateLeadResult {
  success: boolean;
  error?: string;
}

/**
 * Hook responsável por criar leads comerciais de turistas -> parceiros,
 * reaproveitando a infraestrutura de CRM de leads já existente no Supabase.
 *
 * IMPORTANTE:
 * - O usuário precisa estar autenticado (usando Supabase Auth) para que o RLS da tabela `leads`
 *   permita a criação do registro (campo `created_by`).
 * - O lead é criado com:
 *   - source_id: Website
 *   - status_id: New
 *   - priority_id: Medium
 *   - custom_fields: metadados específicos do Descubra MS (partner_id, tipo de pedido, etc.)
 */
export function usePartnerLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLead = async (input: CreatePartnerLeadInput): Promise<CreateLeadResult> => {
    if (!user?.id) {
      toast({
        title: "Faça login para enviar sua solicitação",
        description: "Você precisa estar autenticado para pedir reserva pelo Descubra MS.",
        variant: "destructive",
      });
      return { success: false, error: "Usuário não autenticado" };
    }

    setIsSubmitting(true);
    try {
      // IDs fixos criados na migration 20250127000004_create_leads_tables.sql
      const WEBSITE_SOURCE_ID = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a"; // lead_sources -> Website
      const STATUS_NEW_ID = "1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b"; // lead_statuses -> New
      const PRIORITY_MEDIUM_ID = "2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c2c"; // lead_priorities -> Medium

      const { partner, fullName, email, phone, desiredDate, peopleCount, requestType, message } =
        input;

      const notesLines: string[] = [];
      if (desiredDate) {
        notesLines.push(`Data desejada: ${desiredDate}`);
      }
      if (typeof peopleCount === "number" && !Number.isNaN(peopleCount)) {
        notesLines.push(`Número de pessoas: ${peopleCount}`);
      }
      if (message) {
        notesLines.push("");
        notesLines.push(message);
      }

      const notes = notesLines.join("\n");

      const { error } = await supabase.from("leads").insert({
        name: fullName,
        email,
        phone: phone || null,
        company: partner.name,
        source_id: WEBSITE_SOURCE_ID,
        status_id: STATUS_NEW_ID,
        priority_id: PRIORITY_MEDIUM_ID,
        value: null,
        notes: notes || null,
        custom_fields: {
          origin: "descubra-ms",
          partner_id: partner.id,
          partner_name: partner.name,
          partner_type: partner.partner_type,
          request_type: requestType,
          desired_date: desiredDate || null,
          people_count: peopleCount ?? null,
        },
        created_by: user.id,
      } as any);

      if (error) {
        console.error("Erro ao criar lead de parceiro:", error);
        toast({
          title: "Erro ao enviar solicitação",
          description:
            "Não foi possível registrar seu pedido agora. Tente novamente em alguns instantes.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Solicitação enviada!",
        description:
          "Seu pedido foi registrado e o parceiro receberá seus dados para entrar em contato.",
      });

      return { success: true };
    } catch (err: unknown) {
      console.error("Erro inesperado ao criar lead:", err);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return { success: false, error: err?.message || "Erro inesperado" };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createLead,
    isSubmitting,
  };
}

