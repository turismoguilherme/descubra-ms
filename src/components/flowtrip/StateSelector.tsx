import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFlowTripAuth } from '@/hooks/useFlowTripAuth';

export const StateSelector: React.FC = () => {
  const { currentState, userStates, switchState, isMasterAdmin } = useFlowTripAuth();

  if (!userStates || userStates.length === 0) {
    return null;
  }

  // Master admins podem ver todos os estados
  if (isMasterAdmin()) {
    return (
      <div className="state-selector">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
          <Globe className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-primary">FlowTrip Master</p>
            <p className="text-xs text-muted-foreground">Acesso Global</p>
          </div>
        </div>
      </div>
    );
  }

  // Usuários com múltiplos estados
  if (userStates.length > 1) {
    return (
      <div className="state-selector">
        <Select value={currentState?.code} onValueChange={switchState}>
          <SelectTrigger className="w-full min-w-[200px]">
            <div className="flex items-center gap-3">
              {currentState?.logo_url && (
                <img 
                  src={currentState.logo_url} 
                  alt={`${currentState.name} Logo`}
                  className="w-6 h-6 rounded"
                />
              )}
              <div className="text-left">
                <SelectValue placeholder="Selecionar Estado">
                  <div>
                    <p className="text-sm font-medium">{currentState?.name}</p>
                    <p className="text-xs text-muted-foreground">{currentState?.code?.toUpperCase()}</p>
                  </div>
                </SelectValue>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            {userStates.map((state) => (
              <SelectItem key={state.state_id} value={state.state_code}>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{state.state_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {state.user_role.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Usuário com apenas um estado
  const singleState = userStates[0];
  return (
    <div className="state-selector">
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
        {currentState?.logo_url && (
          <img 
            src={currentState.logo_url} 
            alt={`${currentState.name} Logo`}
            className="w-8 h-8 rounded"
          />
        )}
        <div>
          <p className="text-sm font-medium text-primary">{singleState.state_name}</p>
          <p className="text-xs text-muted-foreground">
            {singleState.user_role.replace('_', ' ')}
          </p>
        </div>
      </div>
    </div>
  );
};