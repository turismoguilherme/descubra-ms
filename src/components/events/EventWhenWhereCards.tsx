import { Calendar, Clock, MapPin } from 'lucide-react';

export interface EventWhenWhereCardsProps {
  startDateLabel: string;
  endDateLabel?: string | null;
  sameDay?: boolean;
  timeLabel?: string | null;
  locationLabel: string;
}

export function EventWhenWhereCards({
  startDateLabel,
  endDateLabel,
  sameDay,
  timeLabel,
  locationLabel,
}: EventWhenWhereCardsProps) {
  const showEnd = Boolean(endDateLabel && !sameDay);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="relative overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-sm ring-1 ring-black/[0.03]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ms-primary-blue via-sky-500 to-ms-discovery-teal" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-md shadow-blue-500/25">
              <Calendar className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700/90">
                Data e horário
              </p>
              <p className="text-lg font-semibold leading-snug text-gray-900">{startDateLabel}</p>
              {showEnd && (
                <p className="text-sm text-gray-600">
                  até <span className="font-medium text-gray-800">{endDateLabel}</span>
                </p>
              )}
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 shrink-0 text-ms-cerrado-orange" aria-hidden />
                <span>{timeLabel?.trim() ? timeLabel : 'Horário a definir'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-white shadow-sm ring-1 ring-black/[0.03]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-ms-discovery-teal" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
              <MapPin className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800/90">
                Localização
              </p>
              <p className="text-lg font-semibold leading-snug text-gray-900 break-words">
                {locationLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
