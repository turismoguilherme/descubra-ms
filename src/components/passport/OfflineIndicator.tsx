import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOfflineCheckin } from '@/hooks/useOfflineCheckin';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OfflineIndicator: React.FC = () => {
  const { status, sync, pendingCheckins } = useOfflineCheckin();
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      const result = await sync();
      toast({
        title: 'Sincronização concluída',
        description: `${result.synced} check-ins sincronizados${result.failed > 0 ? `. ${result.failed} falharam.` : '.'}`,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro ao sincronizar',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (status.is_online && status.pending_checkins === 0) {
    return null; // Não mostrar se estiver online e sem pendências
  }

  return (
    <div className="flex items-center gap-2">
      {!status.is_online && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      )}
      {status.pending_checkins > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          {status.pending_checkins} pendente{status.pending_checkins > 1 ? 's' : ''}
        </Badge>
      )}
      {status.pending_checkins > 0 && status.is_online && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={status.syncing}
          className="h-7"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${status.syncing ? 'animate-spin' : ''}`} />
          Sincronizar
        </Button>
      )}
    </div>
  );
};

export default OfflineIndicator;

