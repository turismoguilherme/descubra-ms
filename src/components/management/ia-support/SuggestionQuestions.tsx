
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SuggestionQuestionsProps {
  setIaQuery: (query: string) => void;
}

const SuggestionQuestions = ({ setIaQuery }: SuggestionQuestionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-sm font-medium mb-2">Perguntas frequentes:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => setIaQuery("Qual a melhor época para visitar o Pantanal?")}>
          Melhor época para o Pantanal?
        </Button>
        <Button variant="outline" onClick={() => setIaQuery("Quais os principais atrativos de Campo Grande?")}>
          Atrativos de Campo Grande?
        </Button>
        <Button variant="outline" onClick={() => setIaQuery("Como chegar em Bonito?")}>
          Como chegar em Bonito?
        </Button>
        <Button variant="outline" onClick={() => setIaQuery("Documentos necessários para visitar o Brasil?")}>
          Documentos para turistas?
        </Button>
      </div>
    </motion.div>
  );
};

export default SuggestionQuestions;
