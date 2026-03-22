// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { searchAll, SearchResult, categoryLabels, isNaturalLanguageQuery } from "@/services/searchService";
import { useSearchOverlay } from "@/context/SearchOverlayContext";
import { MessageCircle, MapPin, Calendar, Globe, Building2, Loader2 } from "lucide-react";

const categoryIconMap = {
  destino: MapPin,
  evento: Calendar,
  regiao: Globe,
  parceiro: Building2,
};

const GlobalSearchCommand: React.FC = () => {
  const { isOpen, close } = useSearchOverlay();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;

    const runSearch = async () => {
      setLoading(true);
      try {
        const data = await searchAll(query);
        if (!cancelled) {
          setResults(data);
        }
      } catch (error) {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const debounce = setTimeout(runSearch, 250);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    close();
    navigate(result.path);
  };

  const handleAskGuata = () => {
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query.trim() });
    const targetUrl = `/descubrams/guata?${params.toString()}`;
    close();
    navigate(targetUrl);
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const showAskGuata = isNaturalLanguageQuery(query);
  const hasResults = Object.keys(grouped).length > 0;

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <CommandInput
        placeholder="Busque destinos, eventos, regiões ou faça uma pergunta para o Guatá..."
        value={query}
        onValueChange={setQuery}
        className="h-12"
      />
      <CommandList>
        {/* Renderizar "Perguntar ao Guatá" PRIMEIRO se for pergunta - sempre dentro de CommandGroup */}
        {!loading && showAskGuata && query.length >= 2 && (
          <CommandGroup heading="🦦 Guatá IA">
            <CommandItem 
              onSelect={handleAskGuata}
              className="bg-gradient-to-r from-ms-discovery-teal/10 to-ms-primary-blue/10 border border-ms-discovery-teal/20 hover:from-ms-discovery-teal/15 hover:to-ms-primary-blue/15 hover:border-ms-discovery-teal/30 transition-all duration-200"
            >
              <MessageCircle className="mr-3 h-6 w-6 text-ms-discovery-teal shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-base text-foreground">Perguntar ao Guatá</span>
                <span className="text-sm text-muted-foreground truncate mt-1">
                  {query}
                </span>
              </div>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Separador apenas se tiver resultados E pergunta */}
        {!loading && hasResults && showAskGuata && <CommandSeparator className="my-2" />}

        {/* Resultados da busca */}
        {!loading && Object.entries(grouped).map(([cat, items]) => {
          const Icon = categoryIconMap[cat as SearchResult["category"]];
          return (
            <CommandGroup 
              key={cat} 
              heading={
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-ms-primary-blue" />
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {categoryLabels[cat as SearchResult["category"]]}
                  </span>
                </div>
              }
            >
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelectResult(item)}
                  className="hover:bg-accent/50 transition-all duration-200"
                >
                  <Icon className="mr-3 h-5 w-5 text-ms-primary-blue/70 shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-sm text-foreground truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground truncate mt-1">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        {/* Estados de loading e empty */}
        {loading && (
          <div className="flex items-center justify-center px-6 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-ms-primary-blue mr-3" />
            <span className="text-base text-muted-foreground font-medium">Buscando...</span>
          </div>
        )}

        {!loading && query.length < 2 && (
          <div className="px-6 py-12 text-center">
            <p className="text-base text-muted-foreground font-medium mb-2">Digite pelo menos 2 caracteres para buscar.</p>
            <p className="text-sm text-muted-foreground">Ou faça uma pergunta para o Guatá 🦦</p>
          </div>
        )}

        {/* Mensagem de "sem resultados" apenas se NÃO for pergunta */}
        {!loading && query.length >= 2 && !hasResults && !showAskGuata && (
          <div className="px-6 py-12 text-center">
            <p className="text-base text-muted-foreground font-medium mb-2">Nenhum resultado encontrado.</p>
            <p className="text-sm text-muted-foreground">Tente buscar por outro termo ou faça uma pergunta para o Guatá.</p>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearchCommand;

