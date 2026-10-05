import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Props {
  data: { email: string; password: string } | null;
  onClose: () => void;
}

/** Mostra a senha temporária uma única vez para o administrador repassar. */
export function PasswordRevealDialog({ data, onClose }: Props) {
  const { toast } = useToast();
  return (
    <Dialog open={!!data} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Senha temporária</DialogTitle>
          <DialogDescription>
            Repasse esta senha para {data?.email}. Ela não será mostrada novamente.
          </DialogDescription>
        </DialogHeader>
        <code className="block rounded-md bg-muted p-4 text-center text-lg font-mono select-all">{data?.password}</code>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(data?.password ?? '');
              toast({ title: 'Senha copiada' });
            }}
          >
            Copiar
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
