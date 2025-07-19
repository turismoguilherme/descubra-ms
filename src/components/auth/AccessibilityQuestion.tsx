import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { 
  Accessibility, 
  Eye, 
  Ear, 
  HandHeart, 
  Brain, 
  User,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export interface AccessibilityPreferences {
  hasAccessibilityNeeds: boolean;
  needs: {
    visual: boolean;
    auditory: boolean;
    motor: boolean;
    cognitive: boolean;
    other: boolean;
  };
  otherNeeds: string;
  prefersLargeText: boolean;
  prefersHighContrast: boolean;
  prefersReducedMotion: boolean;
  needsScreenReader: boolean;
  needsVLibras: boolean;
}

interface AccessibilityQuestionProps {
  onComplete: (preferences: AccessibilityPreferences) => void;
  onBack: () => void;
  loading?: boolean;
}

const AccessibilityQuestion: React.FC<AccessibilityQuestionProps> = ({
  onComplete,
  onBack,
  loading = false
}) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    hasAccessibilityNeeds: false,
    needs: {
      visual: false,
      auditory: false,
      motor: false,
      cognitive: false,
      other: false
    },
    otherNeeds: '',
    prefersLargeText: false,
    prefersHighContrast: false,
    prefersReducedMotion: false,
    needsScreenReader: false,
    needsVLibras: false
  });

  const handleNeedChange = (need: keyof typeof preferences.needs, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      needs: {
        ...prev.needs,
        [need]: checked
      },
      hasAccessibilityNeeds: Object.values({
        ...prev.needs,
        [need]: checked
      }).some(Boolean)
    }));
  };

  const handleSubmit = () => {
    console.log('🎯 ACCESSIBILITY: Preferências salvas:', preferences);
    onComplete(preferences);
  };

  const hasAnyNeeds = Object.values(preferences.needs).some(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header branco com logo */}
      <div className="bg-white py-6 shadow-sm">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/63490622-9b5f-483c-857e-2427e85a58a3.png" 
            alt="Descubra Mato Grosso do Sul" 
            className="h-[60px] w-auto" 
          />
        </div>
      </div>

      {/* Corpo com gradiente e card centralizado */}
      <div className="flex-1 bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <Card className="bg-white shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-2xl font-bold text-ms-primary-blue flex items-center justify-center gap-2">
                <Accessibility className="w-6 h-6" />
                Acessibilidade
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Ajude-nos a personalizar sua experiência de acordo com suas necessidades
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Pergunta principal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Você tem alguma necessidade de acessibilidade?
                </h3>
                
                <RadioGroup
                  value={preferences.hasAccessibilityNeeds ? 'yes' : 'no'}
                  onValueChange={(value) => {
                    setPreferences(prev => ({
                      ...prev,
                      hasAccessibilityNeeds: value === 'yes'
                    }));
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="text-base">Sim, tenho necessidades específicas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="text-base">Não, não tenho necessidades específicas</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Opções detalhadas se tiver necessidades */}
              {preferences.hasAccessibilityNeeds && (
                <div className="space-y-6 border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-800">
                    Quais são suas necessidades? (selecione todas que se aplicam)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id="visual"
                        checked={preferences.needs.visual}
                        onCheckedChange={(checked) => handleNeedChange('visual', checked as boolean)}
                      />
                      <Label htmlFor="visual" className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4" />
                        Visual (baixa visão, cegueira)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id="auditory"
                        checked={preferences.needs.auditory}
                        onCheckedChange={(checked) => handleNeedChange('auditory', checked as boolean)}
                      />
                      <Label htmlFor="auditory" className="flex items-center gap-2 text-sm">
                        <Ear className="w-4 h-4" />
                        Auditiva (surdez, deficiência auditiva)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id="motor"
                        checked={preferences.needs.motor}
                        onCheckedChange={(checked) => handleNeedChange('motor', checked as boolean)}
                      />
                      <Label htmlFor="motor" className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        Motora (mobilidade reduzida)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id="cognitive"
                        checked={preferences.needs.cognitive}
                        onCheckedChange={(checked) => handleNeedChange('cognitive', checked as boolean)}
                      />
                      <Label htmlFor="cognitive" className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4" />
                        Cognitiva (dificuldades de aprendizagem)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id="other"
                        checked={preferences.needs.other}
                        onCheckedChange={(checked) => handleNeedChange('other', checked as boolean)}
                      />
                      <Label htmlFor="other" className="flex items-center gap-2 text-sm">
                        <HandHeart className="w-4 h-4" />
                        Outras necessidades
                      </Label>
                    </div>
                  </div>

                  {/* Outras necessidades */}
                  {preferences.needs.other && (
                    <div className="space-y-2">
                      <Label htmlFor="otherNeeds" className="text-sm font-medium">
                        Descreva suas outras necessidades:
                      </Label>
                      <Textarea
                        id="otherNeeds"
                        placeholder="Conte-nos sobre suas necessidades específicas..."
                        value={preferences.otherNeeds}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          otherNeeds: e.target.value
                        }))}
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                  {/* Preferências específicas */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-md font-semibold text-gray-800">
                      Preferências de acessibilidade:
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="largeText"
                          checked={preferences.prefersLargeText}
                          onCheckedChange={(checked) => setPreferences(prev => ({
                            ...prev,
                            prefersLargeText: checked as boolean
                          }))}
                        />
                        <Label htmlFor="largeText" className="text-sm">
                          Prefiro texto maior
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="highContrast"
                          checked={preferences.prefersHighContrast}
                          onCheckedChange={(checked) => setPreferences(prev => ({
                            ...prev,
                            prefersHighContrast: checked as boolean
                          }))}
                        />
                        <Label htmlFor="highContrast" className="text-sm">
                          Prefiro alto contraste
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="reducedMotion"
                          checked={preferences.prefersReducedMotion}
                          onCheckedChange={(checked) => setPreferences(prev => ({
                            ...prev,
                            prefersReducedMotion: checked as boolean
                          }))}
                        />
                        <Label htmlFor="reducedMotion" className="text-sm">
                          Prefiro movimento reduzido
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="screenReader"
                          checked={preferences.needsScreenReader}
                          onCheckedChange={(checked) => setPreferences(prev => ({
                            ...prev,
                            needsScreenReader: checked as boolean
                          }))}
                        />
                        <Label htmlFor="screenReader" className="text-sm">
                          Uso leitor de tela
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="vlibras"
                          checked={preferences.needsVLibras}
                          onCheckedChange={(checked) => setPreferences(prev => ({
                            ...prev,
                            needsVLibras: checked as boolean
                          }))}
                        />
                        <Label htmlFor="vlibras" className="text-sm">
                          Preciso do VLibras (tradução para Libras)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informação adicional */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Suas preferências de acessibilidade serão salvas e aplicadas automaticamente 
                  em sua experiência na plataforma. Você pode alterá-las a qualquer momento nas configurações do seu perfil.
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold"
                >
                  {loading ? 'Salvando...' : 'Continuar'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityQuestion; 