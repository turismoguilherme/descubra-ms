import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SearchItem {
  label: string;
  path: string;
  category: string;
  icon?: string;
}

const searchItems: SearchItem[] = [
  // Dashboard
  { label: 'Dashboard', path: '/viajar/admin', category: 'Geral' },
  
  // ViajARTur
  { label: 'Funcionários', path: '/viajar/admin/viajar/employees', category: 'ViajARTur' },
  { label: 'Clientes', path: '/viajar/admin/viajar/clients', category: 'ViajARTur' },
  { label: 'Assinaturas', path: '/viajar/admin/viajar/subscriptions', category: 'ViajARTur' },
  { label: 'Páginas ViajARTur', path: '/viajar/admin/viajar/pages', category: 'ViajARTur' },
  { label: 'Configurações ViajARTur', path: '/viajar/admin/viajar/settings', category: 'ViajARTur' },
  
  // Descubra MS
  { label: 'Homepage Descubra MS', path: '/viajar/admin/descubra-ms/homepage', category: 'Descubra MS' },
  { label: 'Destinos', path: '/viajar/admin/descubra-ms/destinations', category: 'Descubra MS' },
  { label: 'Eventos', path: '/viajar/admin/descubra-ms/events', category: 'Descubra MS' },
  { label: 'Parceiros', path: '/viajar/admin/descubra-ms/partners', category: 'Descubra MS' },
  { label: 'Passaporte Digital', path: '/viajar/admin/descubra-ms/passport', category: 'Descubra MS' },
  { label: 'Conteúdo Descubra MS', path: '/viajar/admin/descubra-ms/content', category: 'Descubra MS' },
  { label: 'Usuários Descubra MS', path: '/viajar/admin/descubra-ms/users', category: 'Descubra MS' },
  { label: 'Configurações Descubra MS', path: '/viajar/admin/descubra-ms/settings', category: 'Descubra MS' },
  
  // Financeiro
  { label: 'Gestão Financeira', path: '/viajar/admin/financial', category: 'Financeiro' },
  { label: 'Pagamentos', path: '/viajar/admin/financial/payments', category: 'Financeiro' },
  { label: 'Relatórios Financeiros', path: '/viajar/admin/financial/reports', category: 'Financeiro' },
  
  // Sistema
  { label: 'Fallback', path: '/viajar/admin/system/fallback', category: 'Sistema' },
  { label: 'Monitoramento', path: '/viajar/admin/system/monitoring', category: 'Sistema' },
  { label: 'Auditoria', path: '/viajar/admin/system/logs', category: 'Sistema' },
  
  // IA
  { label: 'Chat IA', path: '/viajar/admin/ai/chat', category: 'IA Administradora' },
  { label: 'Sugestões IA', path: '/viajar/admin/ai/suggestions', category: 'IA Administradora' },
  { label: 'Ações Pendentes IA', path: '/viajar/admin/ai/actions', category: 'IA Administradora' },
];

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const getFilteredItems = () => {
    if (!query.trim()) return searchItems;
    const lowerQuery = query.toLowerCase();
    return searchItems.filter(item =>
      item.label.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  };

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K para abrir busca
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // ESC para fechar
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }
      
      // Arrow keys para navegar
      if (isOpen) {
        const filtered = getFilteredItems();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        }
        if (e.key === 'Enter' && filtered.length > 0) {
          e.preventDefault();
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  const filteredItems = getFilteredItems();
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Find...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-gray-100 border border-gray-300 rounded text-gray-600">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setQuery('');
          setSelectedIndex(0);
        }
      }}>
        <DialogContent className="max-w-2xl p-0 border-gray-200 bg-white shadow-lg dark:bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Find pages, settings, features..."
                className="pl-10 h-12 text-base border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-600 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto bg-white">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p className="text-sm">No results found</p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {category}
                    </div>
                    {items.map((item, index) => {
                      const globalIndex = filteredItems.indexOf(item);
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                            globalIndex === selectedIndex
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          )}
                        >
                          <span className="flex-1">{item.label}</span>
                          <kbd className="px-1.5 py-0.5 text-xs bg-gray-50 border border-gray-200 rounded text-gray-600">
                            ↵
                          </kbd>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

