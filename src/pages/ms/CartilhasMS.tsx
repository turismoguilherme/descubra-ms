import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Loader2 } from 'lucide-react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { fetchPublicCartilhas } from '@/services/cartilhasService';
import type { CartilhaItem } from '@/data/cartilhasCatalog';
import { cn } from '@/lib/utils';

const themeStyles: Record<CartilhaItem['theme'], string> = {
  pantanal: 'from-emerald-900 via-emerald-800 to-slate-900',
  terracotta: 'from-orange-950 via-orange-800 to-stone-900',
  blue: 'from-sky-950 via-slate-800 to-slate-950',
  amber: 'from-amber-950 via-amber-800 to-stone-900',
  purple: 'from-purple-950 via-purple-800 to-slate-950',
};

const CartilhasMS = () => {
  const [cartilhas, setCartilhas] = useState<CartilhaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPublicCartilhas()
      .then(setCartilhas)
      .finally(() => setLoading(false));
  }, []);

  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-emerald-50 via-white to-sky-50">
        <div className="relative bg-gradient-to-r from-ms-pantanal-green via-ms-discovery-teal to-ms-primary-blue py-16 md:py-20">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative ms-container text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cartilhas do Guatá Capacita</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Materiais educativos para todos que desejam explorar, compreender e ampliar seus
              conhecimentos sobre o turismo.
            </p>
          </div>
        </div>

        <div className="ms-container py-14">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-ms-pantanal-green" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cartilhas.map((cartilha) => {
                const isAvailable = cartilha.status === 'available' && !!cartilha.htmlPath;

                return (
                  <article
                    key={cartilha.slug}
                    className={cn(
                      'rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col',
                      !isAvailable && 'opacity-90'
                    )}
                  >
                    <div
                      className={cn(
                        'relative min-h-[160px] p-6 text-white bg-gradient-to-br flex flex-col justify-between',
                        themeStyles[cartilha.theme] || themeStyles.pantanal
                      )}
                    >
                      {cartilha.coverUrl && (
                        <img
                          src={cartilha.coverUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-30"
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide bg-amber-400 text-slate-900 px-2.5 py-1 rounded-full">
                          {cartilha.audience || 'Cartilha'}
                        </span>
                        {!isAvailable && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            Em breve
                          </span>
                        )}
                      </div>
                      <div className="relative z-10 mt-6">
                        <BookOpen className="w-8 h-8 text-amber-300 mb-3" />
                        <h2 className="text-2xl font-bold leading-tight">{cartilha.title}</h2>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-sm text-slate-600 leading-relaxed flex-1">
                        {cartilha.subtitle}
                      </p>

                      {isAvailable ? (
                        <Link
                          to={`/descubrams/cartilhas/${cartilha.slug}`}
                          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-ms-pantanal-green hover:bg-emerald-800 text-white font-semibold text-sm px-4 py-3 transition-colors"
                        >
                          Abrir cartilha
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-500 font-semibold text-sm px-4 py-3">
                          Em desenvolvimento
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </UniversalLayout>
  );
};

export default CartilhasMS;
