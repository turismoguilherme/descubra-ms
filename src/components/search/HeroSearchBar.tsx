// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Globe, Building2, X } from 'lucide-react';
import { searchAll, SearchResult, categoryLabels } from '@/services/searchService';

const categoryIconMap = {
  destino: MapPin,
  evento: Calendar,
  regiao: Globe,
  parceiro: Building2,
};

const HeroSearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchAll(term);
      setResults(data);
      setIsOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 300);
  };

  const selectResult = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    navigate(result.path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectResult(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Agrupar resultados por categoria
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto mb-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Buscar destinos, eventos, regiões..."
          className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/50 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all duration-300 shadow-lg"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {loading && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[2000] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[360px] overflow-y-auto py-2">
            {Object.entries(grouped).map(([cat, items]) => {
              const Icon = categoryIconMap[cat as SearchResult['category']];
              return (
                <div key={cat}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    {categoryLabels[cat as SearchResult['category']]}
                  </div>
                  {items.map((item) => {
                    const globalIdx = results.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectResult(item)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          globalIdx === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSearchBar;
