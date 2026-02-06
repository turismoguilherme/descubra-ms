import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Instagram, Linkedin, Users } from 'lucide-react';
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

const Sobre = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [narrativa, setNarrativa] = useState<{ destaque: string; texto: string }>({
    destaque: '',
    texto: ''
  });

  // Scroll para o topo quando a página carregar
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
      
      // Narrativa unificada
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
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-viajar-blue/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Building2 className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Quem Somos</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Sobre
            </h1>
            <p className="text-lg text-white/70">
              Tecnologia e inovação para o turismo
            </p>
          </div>
        </div>
      </section>

      {/* Narrativa - Texto Único */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Frase de destaque */}
          <blockquote className="text-center mb-12">
            <p className="text-2xl md:text-3xl font-semibold text-foreground leading-relaxed italic">
              "{narrativa.destaque}"
            </p>
          </blockquote>
          
          {/* Linha decorativa */}
          <div className="flex justify-center mb-12">
            <div className="w-24 h-1 bg-gradient-to-r from-viajar-cyan to-viajar-blue rounded-full" />
          </div>
          
          {/* Texto narrativo */}
          <div className="text-center">
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {narrativa.texto}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nossa Equipe
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Os profissionais que fazem a ViajARTur acontecer
              </p>
            </div>

            <div className={`grid gap-8 ${teamMembers.length === 1 ? 'grid-cols-1 justify-center max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-viajar-cyan/30 transition-all duration-300 hover:shadow-lg text-center"
                >
                  <div className="flex justify-center mb-4">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-viajar-cyan/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center">
                        <Users className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{member.name}</h3>
                  <p className="text-viajar-cyan font-medium mb-3">{member.position}</p>
                  {member.bio && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                  {(member.instagram_url || member.linkedin_url) && (
                    <div className="flex justify-center gap-4 mt-4">
                      {member.instagram_url && (
                        <a
                          href={member.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-500 hover:text-pink-600 transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Quer fazer parte dessa história?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Entre em contato e descubra como podemos transformar o turismo na sua região.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2">
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
