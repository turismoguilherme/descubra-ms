import { cn } from '@/lib/utils';

type GuataTooltipBubbleProps = {
  message: string;
  avatarUrl: string;
  className?: string;
  side?: 'left' | 'right';
};

/**
 * Avatar circular + balão curto (seções estratégicas da landing ViaJAR).
 */
export default function GuataTooltipBubble({
  message,
  avatarUrl,
  className,
  side = 'left',
}: GuataTooltipBubbleProps) {
  if (!message.trim()) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 max-w-md',
        side === 'right' && 'flex-row-reverse text-right',
        className
      )}
    >
      <div className="shrink-0 w-14 h-14 rounded-full border-2 border-guata-gold/50 overflow-hidden bg-guata-paper shadow-md ring-2 ring-guata-forest/10">
        <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div
        className={cn(
          'rounded-2xl px-4 py-3 text-sm md:text-base leading-snug',
          'bg-guata-cream/95 text-guata-deep border border-guata-gold/30 shadow-sm'
        )}
      >
        {message}
      </div>
    </div>
  );
}
