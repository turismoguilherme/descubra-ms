import { useState } from 'react';
import { Database, ExternalLink, Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import SupabaseDataLoader from '@/components/admin/SupabaseDataLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type PublicTable = keyof Database['public']['Tables'];

const PRESET_TABLES: { value: PublicTable; label: string }[] = [
  { value: 'platform_policies', label: 'platform_policies' },
  { value: 'site_settings', label: 'site_settings' },
  { value: 'institutional_partners', label: 'institutional_partners' },
  { value: 'partner_terms_acceptances', label: 'partner_terms_acceptances' },
  { value: 'pending_refunds', label: 'pending_refunds' },
  { value: 'partner_cancellation_policies', label: 'partner_cancellation_policies' },
  { value: 'events', label: 'events' },
];

function supabaseStudioProjectUrl(): string {
  const raw = import.meta.env.VITE_SUPABASE_URL;
  if (!raw) return 'https://supabase.com/dashboard';
  try {
    const host = new URL(raw).hostname;
    const ref = host.replace(/\.supabase\.co$/i, '').replace(/^db\./i, '');
    if (!ref || ref === 'localhost' || ref === 'your-project') {
      return 'https://supabase.com/dashboard';
    }
    return `https://supabase.com/dashboard/project/${ref}`;
  } catch {
    return 'https://supabase.com/dashboard';
  }
}

export default function DatabaseManager() {
  const [table, setTable] = useState<PublicTable>(PRESET_TABLES[0].value);
  const [rowsJson, setRowsJson] = useState('');
  const [loading, setLoading] = useState(false);
  const studioHref = supabaseStudioProjectUrl();

  const loadPreview = async () => {
    setLoading(true);
    setRowsJson('');
    try {
      const { data, error } = await supabase.from(table).select('*').limit(50);
      if (error) {
        toast.error(error.message || 'Não foi possível ler a tabela');
        return;
      }
      setRowsJson(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(e);
      toast.error('Erro ao consultar o Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-6">
      <AdminPageHeader
        title="Banco de dados (Supabase)"
        description="Visualização de dados e atalhos para o painel do Supabase. Alterações de schema devem ser feitas no Studio ou via migrations versionadas."
        helpText="A pré-visualização limita a 50 linhas e respeita as políticas RLS da sessão atual."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Supabase Studio
          </CardTitle>
          <CardDescription>
            SQL, migrations, storage e políticas RLS no painel oficial do projeto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href={studioHref} target="_blank" rel="noopener noreferrer">
              Abrir dashboard do projeto
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pré-visualização de tabela</CardTitle>
          <CardDescription>
            Leitura rápida (somente consulta) de tabelas usadas com frequência no admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[220px] flex-1 space-y-2">
              <span className="text-sm font-medium text-gray-700">Tabela</span>
              <Select
                value={table}
                onValueChange={(v) => setTable(v as PublicTable)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_TABLES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={loadPreview} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando
                </>
              ) : (
                'Carregar até 50 linhas'
              )}
            </Button>
          </div>
          {rowsJson ? (
            <ScrollArea className="h-[min(420px,50vh)] w-full rounded-md border bg-muted/30 p-3">
              <pre className="whitespace-pre-wrap break-all text-xs font-mono text-gray-800">
                {rowsJson}
              </pre>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">
              Escolha uma tabela e clique em carregar para ver o JSON retornado pelo PostgREST.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <SupabaseDataLoader />
      </div>
    </div>
  );
}
