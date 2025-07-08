
import { Link } from "react-router-dom";
import { useInstitutionalContent } from "@/hooks/useInstitutionalContent";
import { Skeleton } from "@/components/ui/skeleton";

const Hero = () => {
  const { getContentValue, isLoading } = useInstitutionalContent();

  const title = getContentValue('hero_title');
  const subtitle = getContentValue('hero_subtitle');
  const buttonRegister = getContentValue('hero_button_register');
  const buttonPassport = getContentValue('hero_button_passport');
  const buttonDelinha = getContentValue('hero_button_delinha');

  if (isLoading) {
    return (
        <div className="relative h-[70vh] bg-gray-200">
            <div className="relative h-full flex items-center justify-center">
                <div className="ms-container text-center px-4 space-y-6">
                    <Skeleton className="h-12 w-96 mx-auto bg-gray-300" />
                    <Skeleton className="h-8 w-[500px] mx-auto bg-gray-300" />
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Skeleton className="h-12 w-32 bg-gray-400" />
                        <Skeleton className="h-12 w-40 bg-gray-400" />
                        <Skeleton className="h-12 w-48 bg-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="relative h-[70vh] bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://source.unsplash.com/photo-1482938289607-e9573fc25ebb')] bg-cover bg-center opacity-40"></div>
      
      <div className="relative h-full flex items-center justify-center">
        <div className="ms-container text-center px-4">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6 drop-shadow-lg">
            {title || 'Descubra Mato Grosso do Sul'}
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
            {subtitle || 'Do Pantanal ao Cerrado, uma experiência única de natureza, cultura e aventura'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/welcome" 
              className="bg-ms-secondary-yellow text-ms-primary-blue font-bold px-6 py-3 rounded-md hover:bg-ms-secondary-yellow/90 transition-colors shadow-lg"
            >
              {buttonRegister || 'Cadastre-se'}
            </Link>
            <Link 
              to="/passaporte" 
              className="bg-ms-primary-blue text-white font-medium px-6 py-3 rounded-md hover:bg-ms-primary-blue/90 transition-colors shadow-lg"
            >
              {buttonPassport || 'Passaporte Digital'}
            </Link>
            <Link 
              to="/delinha" 
              className="bg-white text-ms-primary-blue font-medium px-6 py-3 rounded-md hover:bg-gray-100 transition-colors shadow-lg"
            >
              {buttonDelinha || 'Converse com a Delinha'}
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Hero;
