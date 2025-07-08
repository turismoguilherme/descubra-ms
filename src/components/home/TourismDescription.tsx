
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TourismDescription = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-[#003087] to-[#2E7D32] text-white">
      <div className="ms-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">"Isto é Mato Grosso do Sul" – Viva essa experiência!</h2>
          
          <p className="mb-6 text-lg">
            Prepare-se para descobrir o melhor de MS de um jeito inovador e inteligente. 
            Com a ajuda da Delinha, sua guia virtual inspirada na cultura local, 
            você explora atrativos como Bonito, Pantanal, Serra da Bodoquena e muito mais!
          </p>
          
          <p className="mb-8 text-lg">
            Crie seu passaporte digital, desbloqueie selos temáticos com animais do Cerrado e do Pantanal, 
            participe de roteiros interativos, receba recompensas e viva momentos inesquecíveis!
            Cadastre-se para explorar mais e ajudar a melhorar o turismo local!
          </p>
          
          <Link to="/welcome">
            <Button className="bg-ms-secondary-yellow hover:bg-ms-secondary-yellow/90 text-black font-medium px-8 py-6 text-lg">
              Cadastre-se
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TourismDescription;
