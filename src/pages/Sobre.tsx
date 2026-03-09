import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Instagram, Linkedin, Users, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { supabase } from '@/integrations/supabase/client';
import { platformContentService } from '@/services/admin/platformContentService';
import FloatingTechElements from '@/components/home/FloatingTechElements';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
}

const Sobre = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
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
      setNarrativa({
        destaque: contentMap['viajar_sobre_destaque'] || 'Transformar dados turísticos em decisões estratégicas que geram impacto real.',
        texto: contentMap['viajar_sobre_narrativa'] ||
          'A ViajarTur existe para transformar dados turísticos em decisões estratégicas. Nosso propósito é estruturar o turismo como um sistema inteligente, integrado e orientado por evidências.\n\nNascemos da visão de que o turismo brasileiro merece ferramentas de gestão de excelência. Combinamos tecnologia de ponta, inteligência artificial e conhecimento profundo do setor para entregar soluções que realmente fazem diferença.\n\nNossa missão é democratizar o acesso à tecnologia turística, tornando-a acessível tanto para grandes destinos quanto para pequenas cidades que sonham em desenvolver seu potencial. Acreditamos que cada lugar tem uma história única para contar, e nossa plataforma ajuda a contá-la da melhor forma possível.'
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
    <div className="min-h-screen bg-travel-tech-dark-base">
      <ViaJARNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[55vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--travel-tech-turquoise)) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-travel-tech-turquoise/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-travel-tech-ocean-blue/5 blur-[100px]" />
        </div>
        <FloatingTechElements variant="section" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-travel-tech-turquoise/20 bg-travel-tech-turquoise/5 backdrop-blur-sm mb-6">
              <Building2 className="h-4 w-4 text-travel-tech-turquoise" />
              <span className="text-sm text-travel-tech-turquoise font-medium">Quem Somos</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-travel-tech-turquoise to-travel-tech-ocean-blue bg-clip-text text-transparent">
                Sobre a ViajARTur
              </span>
            </h1>
            <p className="text-lg text-white/50">
              Tecnologia e inovação para a gestão inteligente do turismo
            </p>
          </div>
        </div>
      </section>

      {/* Narrativa */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-travel-tech-dark-secondary/50" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Glassmorphism quote card */}
          <div className="relative rounded-2xl overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-travel-tech-turquoise/10 to-travel-tech-ocean-blue/10 backdrop-blur-md border border-white/10 rounded-2xl" />
            <div className="relative p-8 md:p-10 text-center">
              <blockquote>
                <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed italic">
                  "{narrativa.destaque}"
                </p>
              </blockquote>
            </div>
            {/* Neon accent */}
            <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-travel-tech-turquoise/50 to-transparent" />
          </div>

          {/* Decorative line */}
          <div className="flex justify-center mb-12">
            <div className="w-24 h-1 bg-gradient-to-r from-travel-tech-turquoise to-travel-tech-ocean-blue rounded-full" />
          </div>

          <div className="text-center">
            <p className="text-lg text-white/60 leading-relaxed whitespace-pre-line">
              {narrativa.texto}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="py-20 relative">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-travel-tech-ocean-blue/5 blur-[100px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-travel-tech-ocean-blue/20 bg-travel-tech-ocean-blue/5 backdrop-blur-sm mb-6">
                <Users className="h-4 w-4 text-travel-tech-ocean-blue" />
                <span className="text-sm text-travel-tech-ocean-blue font-medium">Equipe</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Nossa Equipe
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Os profissionais que fazem a ViajARTur acontecer
              </p>
            </div>

            <div className={`grid gap-8 ${teamMembers.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {teamMembers.map((member) => (
                <div key={member.id} className="group relative rounded-2xl overflow-hidden">
                  {/* Glassmorphism bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-travel-tech-turquoise/10 to-travel-tech-ocean-blue/10 backdrop-blur-md border border-white/10 rounded-2xl" />
                  {/* Neon hover border */}
                  <div className="absolute inset-0 rounded-2xl border border-travel-tech-turquoise/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-travel-tech-turquoise/20 group-hover:border-travel-tech-turquoise/50 transition-colors duration-300"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-travel-tech-turquoise to-travel-tech-ocean-blue flex items-center justify-center">
                          <Users className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-travel-tech-turquoise font-medium mb-3">{member.position}</p>
                    {member.bio && (
                      <p className="text-sm text-white/50 mb-4 leading-relaxed">{member.bio}</p>
                    )}
                    {(member.instagram_url || member.linkedin_url) && (
                      <div className="flex justify-center gap-4 mt-4">
                        {member.instagram_url && (
                          <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-travel-tech-sunset-orange transition-colors" aria-label="Instagram">
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}
                        {member.linkedin_url && (
                          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-travel-tech-ocean-blue transition-colors" aria-label="LinkedIn">
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-travel-tech-dark-secondary/50" />
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-travel-tech-turquoise/5 blur-[100px]" />
        </div>
        <FloatingTechElements variant="section" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-travel-tech-turquoise/20 bg-travel-tech-turquoise/5 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-travel-tech-turquoise" />
            <span className="text-sm text-travel-tech-turquoise font-medium">Junte-se a nós</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Quer fazer parte dessa história?
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto">
            Entre em contato e descubra como podemos transformar a gestão turística na sua região.
          </p>
          <Link to="/contato">
            <Button
              size="lg"
              className="bg-gradient-to-r from-travel-tech-turquoise to-travel-tech-ocean-blue hover:from-travel-tech-ocean-blue hover:to-travel-tech-sunset-orange text-white font-semibold px-8 h-14 text-lg gap-2 hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-travel-tech-turquoise/20"
            >
              Falar Conosco
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
