import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, ExternalLink } from 'lucide-react';

/** Explica ao parceiro como recebe e saca os valores (via Stripe Connect). */
const StripePayoutInfoCard = () => (
  <Card className="border-primary/30 bg-primary/5">
    <CardContent className="pt-6 flex flex-col md:flex-row md:items-center gap-4">
      <Landmark className="w-8 h-8 text-primary shrink-0" />
      <div className="flex-1 space-y-1">
        <p className="font-semibold">Como você recebe o dinheiro</p>
        <p className="text-sm text-muted-foreground">
          O valor das reservas vai direto para a sua conta bancária pela Stripe, de forma automática
          (normalmente em poucos dias). A plataforma não guarda o seu dinheiro. Saldo a liberar,
          extratos e alteração de dados bancários ficam no seu painel Stripe.
        </p>
      </div>
      <Button asChild variant="outline">
        <a href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer">
          Abrir painel Stripe <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </Button>
    </CardContent>
  </Card>
);

export default StripePayoutInfoCard;
