import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Instagram, Linkedin, Users, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { supabase } from '@/integrations/supabase/client';
import { platformContentService } from '@/services/admin/platformContentService';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
}

const DEFAULT_SOBRE_PAGE_LEAD =
  'Somos um ecossistema de software e inteligência artificial focado em turismo. Apoiamos secretarias, empresários e equipes técnicas com dados confiáveis, produtos modulares e implementação acompanhada — do diagnóstico ao uso no dia a dia.';

const Sobre = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [heroLead, setHeroLead] = useState(DEFAULT_SOBRE_PAGE_LEAD);
  const [narrativa, setNarrativa] = useState<{ destaque: string; texto: string }>({
    destaque: '',
    texto: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    loadTeamMembers();
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_sobre_');
      const contentMap: Record<string, string> = {};
      contents.forEach(item => {
        contentMap[item.content_key] = item.content_value || '';
      });
      setHeroLead((contentMap['viajar_sobre_page_lead'] || '').trim() || DEFAULT_SOBRE_PAGE_LEAD);
      setNarrativa({
        destaque: contentMap['viajar_sobre_destaque'] || 'Transformar dados turísticos em decisões estratégicas que geram impacto real.',
        texto: contentMap['viajar_sobre_narrativa'] ||
          'A Guatá Labs existe para transformar dados turísticos em decisões estratégicas. Nosso propósito é estruturar o turismo como um sistema inteligente, integrado e orientado por evidências.\n\nNascemos da visão de que o turismo brasileiro merece ferramentas de gestão de excelência. Combinamos tecnologia de ponta, inteligência artificial e conhecimento profundo do setor para entregar soluções que realmente fazem diferença.\n\nNossa missão é democratizar o acesso à tecnologia turística, tornando-a acessível tanto para grandes destinos quanto para pequenas cidades que sonham em desenvolver seu potencial. Acreditamos que cada lugar tem uma história única para contar, e nossa plataforma ajuda a contá-la da melhor forma possível.'
      });
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('viajar_team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros da equipe:', error);
    } finally {
      setLoadingTeam(false);
    }
  };

  return (
    <div className="min-h-screen bg-guata-cream">
      <ViaJARNavbar />

      <section className="relative overflow-hidden min-h-[50vh] flex items-center bg-gradient-to-b from-guata-deep via-guata-forest to-slate-900">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--guata-gold) / 0.55) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-guata-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-guata-forest/40 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-guata-gold/35 bg-white/10 text-guata-cream text-sm font-semibold mb-6 shadow-sm backdrop-blur">
              <Building2 className="h-4 w-4 text-guata-gold" />
              <span>Quem somos</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-guata text-guata-cream mb-4">
              Sobre a Guatá Labs
            </h1>
            <p className="text-lg font-medium text-guata-cream/90 mb-3">
              Tecnologia e inovação para a gestão inteligente do turismo
            </p>
            <p className="text-base md:text-lg text-guata-cream/75 max-w-3xl mx-auto leading-relaxed">
              {heroLead}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 relative bg-guata-paper">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative rounded-2xl overflow-hidden mb-12 border border-guata-gold/25 bg-white shadow-sm">
            <div className="relative p-8 md:p-10 text-center">
              <blockquote>
                <p className="text-2xl md:text-3xl font-semibold font-guata text-guata-deep leading-relaxed italic">
                  &ldquo;{narrativa.destaque}&rdquo;
                </p>
              </blockquote>
            </div>
            <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-guata-gold/50 to-transparent" />
          </div>

          <div className="flex justify-center mb-12">
            <div className="w-24 h-1 bg-gradient-to-r from-guata-gold to-guata-forest rounded-full" />
          </div>

          <div className="text-center">
            <p className="text-lg text-guata-bark/85 leading-relaxed whitespace-pre-line">
              {narrativa.texto}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="py-20 relative bg-guata-cream">
          <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: `linear-gradient(hsl(var(--guata-forest) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--guata-forest) / 0.06) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-guata-forest/25 bg-white text-guata-forest text-sm font-semibold mb-6 shadow-sm">
                <Users className="h-4 w-4 text-guata-forest" />
                <span>Equipe</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-guata text-guata-deep mb-4">
                Nossa equipe
              </h2>
              <p className="text-lg text-guata-bark/80 max-w-2xl mx-auto">
                Os profissionais que fazem a Guatá Labs acontecer
              </p>
            </div>

            <div className={`grid gap-8 ${teamMembers.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {teamMembers.map((member) => (
                <div key={member.id} className="group relative rounded-2xl overflow-hidden border border-guata-gold/20 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-guata-gold/30 group-hover:border-guata-forest/40 transition-colors duration-300"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-guata-forest to-guata-deep flex items-center justify-center">
                          <Users className="h-12 w-12 text-guata-cream" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-guata-deep mb-2">{member.name}</h3>
                    <p className="text-guata-forest font-medium mb-3">{member.position}</p>
                    {member.bio && (
                      <p className="text-sm text-guata-bark/75 mb-4 leading-relaxed">{member.bio}</p>
                    )}
                    {(member.instagram_url || member.linkedin_url) && (
                      <div className="flex justify-center gap-4 mt-4">
                        {member.instagram_url && (
                          <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="text-guata-bark/50 hover:text-guata-gold transition-colors" aria-label="Instagram">
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}
                        {member.linkedin_url && (
                          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-guata-bark/50 hover:text-guata-forest transition-colors" aria-label="LinkedIn">
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 relative overflow-hidden bg-guata-deep text-guata-cream">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--guata-gold) / 0.35) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-guata-gold/35 bg-white/10 mb-6">
            <Sparkles className="h-4 w-4 text-guata-gold" />
            <span className="text-sm text-guata-cream font-medium">Junte-se a nós</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-guata text-guata-cream mb-6">
            Quer fazer parte dessa história?
          </h2>
          <p className="text-lg text-guata-cream/80 mb-10 max-w-2xl mx-auto">
            Entre em contato e descubra como podemos transformar a gestão turística na sua região.
          </p>
          <Link to="/contato">
            <Button
              size="lg"
              className="bg-guata-gold hover:bg-guata-gold-light text-guata-deep font-semibold px-8 h-14 text-lg gap-2 hover:-translate-y-1 transition-all duration-300 shadow-md"
            >
              Falar conosco
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Sobre;
