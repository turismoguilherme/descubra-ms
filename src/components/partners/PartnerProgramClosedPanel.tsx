import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

export function PartnerProgramClosedPanel() {
  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-950">
      <Info className="h-4 w-4" />
      <AlertTitle className="text-lg">Cadastro de novos parceiros pausado</AlertTitle>
      <AlertDescription className="mt-2 space-y-3 text-amber-900/90">
        <p>
          No momento não estamos aceitando novos cadastros pelo site. Se você já iniciou um cadastro
          anteriormente, use o link que recebeu por e-mail ou retome pelo painel, se aplicável.
        </p>
        <p className="text-sm">
          Para dúvidas ou parcerias especiais, fale com a equipe Descubra MS pelos canais oficiais.
        </p>
        <Button asChild variant="outline" className="border-amber-300 bg-white">
          <Link to="/descubrams">Voltar ao Descubra MS</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
