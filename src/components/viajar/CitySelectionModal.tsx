/**
 * CitySelectionModal
 * Modal obrigatório para seleção de cidade durante onboarding
 * Não pode ser fechado até que o usuário selecione uma cidade
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface City {
  id: string;
  name: string;
  region_id?: string;
}

interface CitySelectionModalProps {
  userId: string;
  onCitySelected: (cityId: string) => Promise<void>;
}

export function CitySelectionModal({ userId, onCitySelected }: CitySelectionModalProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar cidades do banco
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, region_id')
        .order('name');

      if (error) throw error;

      setCities(data || []);
    } catch (err: unknown) {
      console.error('Erro ao carregar cidades:', err);
      setError('Não foi possível carregar a lista de cidades. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCityId) {
      setError('Por favor, selecione uma cidade');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Atualizar user_profiles com city_id
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ city_id: selectedCityId })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Chamar callback
      await onCitySelected(selectedCityId);

      // Modal será fechado pelo componente pai
    } catch (err: unknown) {
      console.error('Erro ao salvar cidade:', err);
      setError('Erro ao salvar cidade. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} modal={true}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          // Prevenir fechamento clicando fora
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevenir fechamento com ESC
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Selecione sua Cidade
          </DialogTitle>
          <DialogDescription>
            Para personalizar sua experiência e fornecer análises precisas, precisamos saber em qual cidade seu negócio está localizado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">Carregando cidades...</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="city-select" className="text-sm font-medium text-gray-700">
                  Cidade do seu negócio *
                </label>
                <Select
                  value={selectedCityId}
                  onValueChange={(value) => {
                    setSelectedCityId(value);
                    setError(null);
                  }}
                >
                  <SelectTrigger id="city-select" className="w-full">
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {cities.length === 0 ? (
                      <SelectItem value="no-cities" disabled>
                        Nenhuma cidade disponível
                      </SelectItem>
                    ) : (
                      cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Esta informação é obrigatória e não pode ser alterada posteriormente sem contato com o suporte.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={!selectedCityId || isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Confirmar'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

