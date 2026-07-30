import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Button } from '@/components/ui/button';
import { parseRankingShareSearch, rankingShareText } from '@/utils/rankingShare';
import { Medal, Trophy, ArrowRight } from 'lucide-react';

export default function RankingSharePage() {
  const location = useLocation();
  const payload = parseRankingShareSearch(location.search);

  const title = payload
    ? payload.pos > 0
      ? `${payload.name} está em #${payload.pos} no Passaporte Digital`
      : `${payload.name} no Passaporte Digital`
    : 'Ranking do Passaporte Digital';

  useEffect(() => {
    document.title = `${title} | Descubra MS`;
  }, [title]);

  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-12 px-4">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl bg-white/95 shadow-xl p-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-ms-primary-blue/10 px-3 py-1 text-sm font-medium text-ms-primary-blue">
              <Trophy className="h-4 w-4" />
              Passaporte Digital
            </div>

            {!payload ? (
              <>
                <h1 className="text-2xl font-bold text-ms-primary-blue">Ranking Descubra MS</h1>
                <p className="text-muted-foreground text-sm">
                  Link incompleto. Abra o ranking no passaporte para compartilhar seu resultado.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal text-white">
                  <Medal className="h-10 w-10 text-ms-secondary-yellow" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {payload.period}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-ms-primary-blue">{payload.name}</h1>
                  {payload.pos > 0 && (
                    <p className="mt-3 text-5xl font-bold text-ms-pantanal-green">#{payload.pos}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{rankingShareText(payload)}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-ms-primary-blue/5 p-4">
                    <p className="text-2xl font-bold text-ms-primary-blue">{payload.pts}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                  <div className="rounded-xl bg-ms-pantanal-green/10 p-4">
                    <p className="text-2xl font-bold text-ms-pantanal-green">{payload.stamps}</p>
                    <p className="text-xs text-muted-foreground">carimbos</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="bg-ms-primary-blue hover:bg-ms-primary-blue/90">
                <Link to="/descubrams/passaporte">
                  Ver ranking completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/descubrams">Explorar Descubra MS</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
}
