/**
 * LanguageSelector Component
 * Dropdown minimalista para seleção de idioma - apenas bandeira
 */

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { SUPPORTED_LANGUAGES, getMainLanguages, type LanguageCode } from '@/utils/translationHelpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const { language, changeLanguage, isLoading } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const mainLanguages = getMainLanguages();
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
  const displayLanguages = showAll ? SUPPORTED_LANGUAGES : mainLanguages;

  const handleLanguageChange = async (langCode: LanguageCode) => {
    if (langCode !== language && !isLoading) {
      await changeLanguage(langCode);
      setShowAll(false); // Reset ao mudar idioma
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100/80 transition-colors"
                disabled={isLoading}
                aria-label={currentLanguage?.nativeName || 'Idioma'}
              >
                <span className="text-lg leading-none">
                  {currentLanguage?.flag || '🌐'}
                </span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p>{currentLanguage?.nativeName || 'Idioma'}</p>
          </TooltipContent>
          
          <DropdownMenuContent align="end" className="w-44">
            {displayLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "flex items-center gap-3 cursor-pointer py-2",
                  language === lang.code && "bg-accent font-medium"
                )}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-sm">{lang.nativeName}</span>
                {language === lang.code && (
                  <span className="text-xs text-muted-foreground">✓</span>
                )}
              </DropdownMenuItem>
            ))}
            {!showAll && SUPPORTED_LANGUAGES.length > mainLanguages.length && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowAll(true)}
                  className="cursor-pointer text-xs text-muted-foreground justify-center py-2"
                >
                  Ver todos →
                </DropdownMenuItem>
              </>
            )}
            {showAll && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowAll(false)}
                  className="cursor-pointer text-xs text-muted-foreground justify-center py-2"
                >
                  Ver menos ↑
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}
