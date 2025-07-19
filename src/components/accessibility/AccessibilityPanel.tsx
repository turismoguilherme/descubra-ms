import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Accessibility, 
  Volume2, 
  Eye, 
  Type, 
  Contrast, 
  HandHeart,
  Settings,
  X
} from 'lucide-react';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [vlibrasActive, setVlibrasActive] = useState(false);

  // Aplicar configurações de acessibilidade
  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // Tamanho da fonte
    root.style.fontSize = `${fontSize}px`;
    
    // Alto contraste
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduzir movimento
    if (reducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--reduced-motion');
    }
  };

  // Aplicar configurações quando mudarem
  React.useEffect(() => {
    applyAccessibilitySettings();
  }, [fontSize, highContrast, reducedMotion]);

  // Ativar/desativar VLibras
  const toggleVLibras = () => {
    const vlibrasButton = document.querySelector('[vw-access-button]') as HTMLElement;
    if (vlibrasButton) {
      vlibrasButton.click();
      setVlibrasActive(!vlibrasActive);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Painel de Acessibilidade
            </CardTitle>
            <CardDescription>
              Configure as opções de acessibilidade para melhorar sua experiência
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* VLibras */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-blue-600" />
                <Label className="text-base font-medium">VLibras - Tradutor de Libras</Label>
              </div>
              <Switch
                checked={vlibrasActive}
                onCheckedChange={toggleVLibras}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Tradutor oficial do governo brasileiro para Língua Brasileira de Sinais (Libras)
            </p>
          </div>

          <div className="border-t pt-4" />

          {/* Tamanho da Fonte */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              <Label className="text-base font-medium">Tamanho da Fonte</Label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                max={24}
                min={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Pequeno (12px)</span>
                <span>Atual: {fontSize}px</span>
                <span>Grande (24px)</span>
              </div>
            </div>
          </div>

          {/* Alto Contraste */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="w-5 h-5" />
              <Label className="text-base font-medium">Alto Contraste</Label>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          {/* Reduzir Movimento */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <Label className="text-base font-medium">Reduzir Movimento</Label>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>

          {/* Leitor de Tela */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              <Label className="text-base font-medium">Compatibilidade com Leitor de Tela</Label>
            </div>
            <Switch
              checked={screenReader}
              onCheckedChange={setScreenReader}
            />
          </div>

          <div className="border-t pt-4" />

          {/* Informações de Acessibilidade */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Recursos de Acessibilidade Disponíveis
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Navegação por teclado (Tab, Enter, Esc)</li>
              <li>• Suporte a leitores de tela</li>
              <li>• Tradução automática para Libras</li>
              <li>• Contraste ajustável</li>
              <li>• Tamanho de fonte personalizável</li>
              <li>• Redução de movimento</li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setFontSize(16);
                setHighContrast(false);
                setReducedMotion(false);
                setScreenReader(false);
                setVlibrasActive(false);
              }}
              className="flex-1"
            >
              Restaurar Padrão
            </Button>
            <Button onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityPanel; 