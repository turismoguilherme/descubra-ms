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
import { MessageCircle, MapPin, Calendar, Globe, Building2, Loader2, Search, Compass, Ticket } from "lucide-react";
const categoryIconMap = {
  destino: MapPin,
  evento: Calendar,
  regiao: Globe,
  parceiro: Building2,
};

const QUICK_SEARCHES = [
  { label: "Bonito", query: "Bonito" },
  { label: "Pantanal", query: "Pantanal" },
  { label: "Eventos", query: "eventos" },
  { label: "Passaporte", path: "/descubrams/passaporte" },
  { label: "Guatá", path: "/descubrams/guata" },
];

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
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
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
    close();
    navigate(`/descubrams/guata?${params.toString()}`);
  };

  const handleQuickSearch = (item: (typeof QUICK_SEARCHES)[0]) => {
    if (item.path) {
      close();
      navigate(item.path);
      return;
    }
    if (item.query) {
      setQuery(item.query);
    }
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const showAskGuata = isNaturalLanguageQuery(query);
  const hasResults = Object.keys(grouped).length > 0;

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <div className="border-b border-ms-primary-blue/10 bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Search className="h-5 w-5 shrink-0 opacity-90" />
          <p className="text-sm font-semibold tracking-wide">Buscar no Descubra MS</p>
        </div>
      </div>

      <CommandInput
        placeholder="Destinos, eventos, regiões ou pergunta ao Guatá..."
        value={query}
        onValueChange={setQuery}
        className="h-12 border-0 border-b border-border/40 rounded-none text-base focus-visible:ring-0"
      />

      <CommandList className="max-h-[min(70vh,520px)]">
        {!loading && query.length < 2 && (
          <div className="px-4 py-5 space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ms-primary-blue/10">
                <Compass className="h-6 w-6 text-ms-primary-blue" />
              </div>
              <p className="text-sm font-medium text-foreground">O que você quer descobrir?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Digite ao menos 2 caracteres ou use um atalho abaixo
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickSearch(item)}
                  className="rounded-full border border-ms-primary-blue/20 bg-ms-primary-blue/5 px-3 py-1.5 text-xs font-medium text-ms-primary-blue transition-colors hover:bg-ms-primary-blue/15"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && showAskGuata && query.length >= 2 && (
          <CommandGroup heading="Guatá IA">
            <CommandItem
              onSelect={handleAskGuata}
              className="mx-2 my-1 rounded-lg border border-ms-discovery-teal/25 bg-gradient-to-r from-ms-discovery-teal/10 to-ms-primary-blue/10"
            >
              <MessageCircle className="mr-3 h-5 w-5 shrink-0 text-ms-discovery-teal" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">Perguntar ao Guatá</span>
                <span className="truncate text-xs text-muted-foreground">{query}</span>
              </div>
            </CommandItem>
          </CommandGroup>
        )}

        {!loading && hasResults && showAskGuata && <CommandSeparator className="my-1" />}

        {!loading &&
          Object.entries(grouped).map(([cat, items]) => {
            const Icon = categoryIconMap[cat as SearchResult["category"]];
            return (
              <CommandGroup
                key={cat}
                heading={
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-ms-primary-blue" />
                    {categoryLabels[cat as SearchResult["category"]]}
                  </span>
                }
              >
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelectResult(item)}
                    className="mx-2 rounded-lg"
                  >
                    <Icon className="mr-3 h-4 w-4 shrink-0 text-ms-primary-blue/80" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

        {loading && (
          <div className="flex items-center justify-center gap-3 px-6 py-12">
            <Loader2 className="h-5 w-5 animate-spin text-ms-primary-blue" />
            <span className="text-sm text-muted-foreground">Buscando...</span>
          </div>
        )}

        {!loading && query.length >= 2 && !hasResults && !showAskGuata && (
          <div className="px-6 py-10 text-center">
            <Ticket className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum resultado encontrado</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Tente outro termo ou{" "}
              <button
                type="button"
                className="font-medium text-ms-discovery-teal underline-offset-2 hover:underline"
                onClick={handleAskGuata}
              >
                pergunte ao Guatá
              </button>
            </p>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearchCommand;
