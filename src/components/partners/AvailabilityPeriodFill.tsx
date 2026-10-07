import { useState } from 'react';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpTooltip } from '@/components/admin/ui/HelpTooltip';

type DayConfig = { available: boolean; max_guests?: number };

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Preenche vários dias de uma vez (período + dias da semana) no calendário de disponibilidade. */
export default function AvailabilityPeriodFill({
  onApply,
}: {
  onApply: (entries: [string, DayConfig][]) => void;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [guests, setGuests] = useState('');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const apply = () => {
    if (!from || !to || to < from) return;
    const entries = eachDayOfInterval({ start: parseISO(from), end: parseISO(to) })
      .filter((d) => days.includes(d.getDay()) && format(d, 'yyyy-MM-dd') >= today)
      .map((d) => [
        format(d, 'yyyy-MM-dd'),
        { available: true, max_guests: guests ? parseInt(guests) : undefined },
      ] as [string, DayConfig]);
    onApply(entries);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <p className="text-sm font-semibold flex items-center">
        Aplicar para um período
        <HelpTooltip content="Libere vários dias de uma vez: escolha o período, os dias da semana e as vagas por dia. Depois você ainda pode clicar em um dia no calendário para mudar só ele (ex.: bloquear um feriado)." />
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><Label>De</Label><Input type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label>Até</Label><Input type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><Label>Vagas por dia</Label><Input type="number" min="1" placeholder="Sem limite" value={guests} onChange={(e) => setGuests(e.target.value)} /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((w, i) => (
          <Button key={w} type="button" size="sm" variant={days.includes(i) ? 'default' : 'outline'} onClick={() => toggleDay(i)}>
            {w}
          </Button>
        ))}
      </div>
      <Button type="button" onClick={apply} disabled={!days.length || to < from}>Aplicar ao período</Button>
    </div>
  );
}
