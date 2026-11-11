import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PartnerOption {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

interface Props {
  value: string;
  error?: string;
  onChange: (name: string, partner?: PartnerOption) => void;
}

const MANUAL = '__manual__';

/** Lista de parceiros cadastrados + opção de digitar um parceiro avulso. */
const PartnerSelectField: React.FC<Props> = ({ value, error, onChange }) => {
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    supabase
      .from('commercial_partners')
      .select('id, company_name, trade_name, city, address, contact_phone, contact_email, status')
      .order('company_name')
      .then(({ data }) => {
        setPartners(
          (data || [])
            .filter((p) => p.status !== 'rejected')
            .map((p) => ({
              id: p.id,
              name: p.trade_name || p.company_name,
              city: p.city,
              address: p.address,
              phone: p.contact_phone,
              email: p.contact_email,
            }))
        );
      });
  }, []);

  const match = partners.find((p) => p.name === value);
  const showManual = manual || (!!value && !match);

  return (
    <div className="space-y-2">
      <Label className={error ? 'text-destructive' : ''}>Parceiro *</Label>
      <Select
        value={showManual ? MANUAL : match?.id || ''}
        onValueChange={(id) => {
          if (id === MANUAL) {
            setManual(true);
            return;
          }
          setManual(false);
          const p = partners.find((x) => x.id === id);
          if (p) onChange(p.name, p);
        }}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder="Selecione um parceiro cadastrado" />
        </SelectTrigger>
        <SelectContent>
          {partners.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
              {p.city ? ` — ${p.city}` : ''}
            </SelectItem>
          ))}
          <SelectItem value={MANUAL}>✏️ Digitar outro parceiro (avulso)</SelectItem>
        </SelectContent>
      </Select>
      {showManual && (
        <Input value={value} placeholder="Nome do parceiro" onChange={(e) => onChange(e.target.value)} />
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
};

export default PartnerSelectField;
