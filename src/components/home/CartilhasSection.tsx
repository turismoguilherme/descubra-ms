import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { fetchPublicCartilhas } from '@/services/cartilhasService';
import type { CartilhaItem } from '@/data/cartilhasCatalog';
import { cn } from '@/lib/utils';

const themeStyles: Record<
  CartilhaItem['theme'],
  { card: string; badge: string; accent: string }
> = {
  pantanal: {
    card: 'from-emerald-900 via-emerald-800 to-slate-900',
    badge: 'bg-amber-400 text-slate-900',
    accent: 'text-emerald-200',
  },
  terracotta: {
    card: 'from-orange-950 via-orange-800 to-stone-900',
    badge: 'bg-amber-300 text-stone-900',
    accent: 'text-orange-200',
  },
  blue: {
    card: 'from-sky-950 via-slate-800 to-slate-950',
    badge: 'bg-sky-300 text-slate-900',
    accent: 'text-sky-200',
  },
  amber: {
    card: 'from-amber-950 via-amber-800 to-stone-900',
    badge: 'bg-yellow-300 text-stone-900',
    accent: 'text-amber-100',
  },
  purple: {
    card: 'from-purple-950 via-purple-800 to-slate-950',
    badge: 'bg-fuchsia-300 text-slate-900',
    accent: 'text-purple-200',
  },
};

const CartilhasSection = () => {
  const [cartilhas, setCartilhas] = useState<CartilhaItem[]>([]);

  useEffect(() => {
    fetchPublicCartilhas().then((items) => {
      setCartilhas(items.filter((c) => c.featured));
    });
  }, []);

  if (cartilhas.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-ms-pantanal-green/5 via-white to-ms-primary-blue/5">
      <div className="ms-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-4">
              Cartilhas do Guatá Capacita
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Materiais educativos para todos que desejam explorar, compreender e ampliar seus
              conhecimentos sobre o turismo.
            </p>
          </div>

          <Link
            to="/descubrams/cartilhas"
            className="inline-flex items-center gap-2 self-start md:self-auto text-ms-primary-blue font-semibold hover:gap-3 transition-all"
          >
            Ver todas as cartilhas
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cartilhas.map((cartilha, idx) => {
            const styles = themeStyles[cartilha.theme] || themeStyles.pantanal;
            const isAvailable = cartilha.status === 'available' && !!cartilha.htmlPath;
            const Wrapper = isAvailable ? Link : 'div';
            const wrapperProps = isAvailable
              ? { to: `/descubrams/cartilhas/${cartilha.slug}` }
              : {};

            return (
              <Wrapper
                key={cartilha.slug}
                {...(wrapperProps as { to: string })}
                className={cn(
                  'group relative overflow-hidden rounded-3xl p-6 min-h-[280px] flex flex-col justify-between text-white shadow-lg transition-all duration-500',
                  `bg-gradient-to-br ${styles.card}`,
                  isAvailable && 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer',
                  !isAvailable && 'opacity-90'
                )}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {cartilha.coverUrl && (
                  <img
                    src={cartilha.coverUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                  />
                )}
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span
                      className={cn(
                        'text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full',
                        styles.badge
                      )}
                    >
                      {cartilha.audience || 'Cartilha'}
                    </span>
                    {!isAvailable && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        Em breve
                      </span>
                    )}
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-amber-300" />
                  </div>

                  <h3 className="text-2xl font-bold leading-tight mb-2">{cartilha.title}</h3>
                  <p className={cn('text-sm leading-relaxed line-clamp-3', styles.accent)}>
                    {cartilha.subtitle}
                  </p>
                </div>

                <div className="relative z-10 pt-5 flex items-center justify-between border-t border-white/10 mt-6">
                  <span className="text-xs font-medium text-white/70">
                    {isAvailable ? 'Abrir cartilha' : 'Disponível em breve'}
                  </span>
                  {isAvailable && (
                    <span className="w-9 h-9 rounded-full bg-white/15 group-hover:bg-amber-400 group-hover:text-slate-900 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CartilhasSection;
