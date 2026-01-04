import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, Eye, Award, Users, ArrowRight, Brain, BarChart3, Building2, Instagram, Linkedin } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { supabase } from '@/integrations/supabase/client';

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

  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    loadTeamMembers();
  }, []);

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

  const values = [
    {
      icon: Brain,
      title: "Inovação",
      description: "IA e tecnologia de ponta para o turismo."
    },
    {
      icon: Users,
      title: "Colaboração",
      description: "Soluções que realmente funcionam."
    },
    {
      icon: BarChart3,
      title: "Resultados",
      description: "Métricas que impactam o setor."
    },
    {
      icon: Award,
      title: "Excelência",
      description: "Qualidade e confiabilidade."
    }
  ];

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

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Missão</h2>
              <p className="text-muted-foreground">
                Democratizar tecnologia de ponta para o setor turístico.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-viajar-blue to-viajar-cyan flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Visão</h2>
              <p className="text-muted-foreground">
                Ser a plataforma líder em gestão inteligente de turismo no Brasil.
              </p>
            </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossos Valores
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Os princípios que guiam nossa atuação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border hover:border-viajar-cyan/30 transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-xs text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
