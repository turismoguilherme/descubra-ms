import { Link } from "react-router-dom";
import { useBrand } from "@/context/BrandContext";
import { useInstitutionalContent } from "@/hooks/useInstitutionalContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

// Componente de loading otimizado
const HeroLoadingSkeleton = () => (
  <div className="relative h-[70vh] bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green">
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="relative h-full flex items-center justify-center">
      <div className="ms-container text-center px-4 space-y-6">
        <Skeleton className="h-12 w-96 mx-auto bg-white/30" />
        <Skeleton className="h-8 w-[500px] mx-auto bg-white/30" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Skeleton className="h-12 w-32 bg-white/40" />
          <Skeleton className="h-12 w-40 bg-white/40" />
          <Skeleton className="h-12 w-48 bg-white/40" />
        </div>
      </div>
    </div>
  </div>
);

const UniversalHero = () => {
  const { config, isMS } = useBrand();
  const { getContentValue, isLoading } = useInstitutionalContent();

  // Para MS, usar o conteúdo institucional; para FlowTrip, usar config estático
  const title = isMS ? (getContentValue('hero_title') || config.hero.title) : config.hero.title;
  const subtitle = isMS ? (getContentValue('hero_subtitle') || config.hero.subtitle) : config.hero.subtitle;

  // Se estiver carregando e for MS, mostrar skeleton
  if (isLoading && isMS) {
    return <HeroLoadingSkeleton />;
  }

  return (
    <div className="relative h-[70vh] bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://source.unsplash.com/photo-1482938289607-e9573fc25ebb')] bg-cover bg-center opacity-30"></div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-ms-secondary-yellow/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-ms-cerrado-orange/30 rounded-full blur-lg animate-pulse-slow delay-1000"></div>
      
      <div className="relative h-full flex items-center justify-center">
        <div className="ms-container text-center px-4">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6 drop-shadow-lg">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={config.hero.buttons.primary.path}
              className="bg-ms-secondary-yellow text-gray-800 font-bold px-8 py-4 rounded-xl hover:bg-ms-secondary-yellow/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              {config.hero.buttons.primary.text}
            </Link>
            <Link 
              to={config.hero.buttons.secondary.path}
              className="bg-ms-pantanal-green text-white font-medium px-8 py-4 rounded-xl hover:bg-ms-pantanal-green/90 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              {config.hero.buttons.secondary.text}
            </Link>
            <Link 
              to={config.hero.buttons.tertiary.path}
              className="bg-white/90 backdrop-blur-sm text-ms-primary-blue font-medium px-8 py-4 rounded-xl hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              {config.hero.buttons.tertiary.text}
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default UniversalHero;