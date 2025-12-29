import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Calendar as CalendarIcon, Users, DollarSign, Loader2, ArrowLeft, MapPin, Lock, Shield, Check, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PartnerPricing {
  id: string;
  service_name: string;
  pricing_type: 'fixed' | 'per_person' | 'per_night' | 'package';
  base_price: number;
  price_per_person?: number;
  price_per_night?: number;
  min_guests: number;
  max_guests?: number;
  description?: string;
  gallery_images?: string[];
  youtube_url?: string;
}

interface Partner {
  id: string;
  name: string;
  address?: string;
  logo_url?: string;
}

export default function PartnerReservationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [pricingList, setPricingList] = useState<PartnerPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [selectedService, setSelectedService] = useState<string>('');
  const [reservationDate, setReservationDate] = useState<Date | undefined>(undefined);
  const [reservationTime, setReservationTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      loadPartnerData();
      loadPricing();
    }
  }, [id]);

  // Removido redirecionamento automático - mostra mensagem na página em vez disso

  const loadPartnerData = async () => {
    if (!id) return;
    
    try {
      // #region agent log
      const { data: sessionData } = await supabase.auth.getSession();
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:63',message:'loadPartnerData iniciado',data:{partnerId:id,hasUser:!!user,userEmail:user?.email,hasSession:!!sessionData?.session,userId:sessionData?.session?.user?.id,userRole:sessionData?.session?.user?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Tentar fazer refresh do token se houver sessão (para garantir token válido)
      if (sessionData?.session && sessionData.session.refresh_token) {
        const expiresAt = sessionData.session.expires_at ? sessionData.session.expires_at * 1000 : 0;
        const now = Date.now();
        const isExpired = expiresAt > 0 && expiresAt <= now;
        const timeUntilExpiry = expiresAt > 0 ? expiresAt - now : 0;
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:72',message:'Verificando token',data:{partnerId:id,hasSession:true,expiresAt:expiresAt > 0 ? new Date(expiresAt).toISOString() : null,now:new Date(now).toISOString(),isExpired,timeUntilExpiryMs:timeUntilExpiry,hasRefreshToken:!!sessionData.session.refresh_token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        // Tentar refresh se expirado ou próximo de expirar (menos de 5 minutos)
        if (isExpired || timeUntilExpiry < 5 * 60 * 1000) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:80',message:'Tentando refresh do token',data:{partnerId:id,isExpired,timeUntilExpiryMs:timeUntilExpiry},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:85',message:'Erro ao fazer refresh, limpando sessão',data:{partnerId:id,refreshError:refreshError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              // Se não conseguir fazer refresh, limpar sessão para fazer requisições sem JWT
              await supabase.auth.signOut();
            } else {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:90',message:'Token refresh concluído com sucesso',data:{partnerId:id,hasNewSession:!!refreshData.session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
            }
          } catch (refreshError) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:94',message:'Exceção ao fazer refresh, limpando sessão',data:{partnerId:id,refreshError:refreshError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            // Se não conseguir fazer refresh, limpar sessão para fazer requisições sem JWT
            await supabase.auth.signOut();
          }
        }
      }
      
      let { data, error } = await supabase
        .from('institutional_partners')
        .select('id, name, address, logo_url, status')
        .eq('id', id)
        .single();

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:110',message:'Query institutional_partners resultado',data:{hasData:!!data,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,errorDetails:error?.details,errorHint:error?.hint,partnerStatus:data?.status,is401:error?.code === 'PGRST301' || error?.status === 401,is403:error?.code === '42501' || error?.status === 403},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Se erro 401 com JWT expired, limpar sessão e retentar sem JWT
      if (error && (error.code === 'PGRST301' || error.message?.includes('JWT expired'))) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:115',message:'JWT expirado detectado, limpando sessão e retentando',data:{partnerId:id,errorCode:error.code,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        await supabase.auth.signOut();
        
        // Retentar sem JWT (usando políticas públicas)
        const retryResult = await supabase
          .from('institutional_partners')
          .select('id, name, address, logo_url, status')
          .eq('id', id)
          .single();
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:123',message:'Retry sem JWT resultado',data:{hasData:!!retryResult.data,hasError:!!retryResult.error,errorCode:retryResult.error?.code,errorMessage:retryResult.error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (retryResult.error) {
          console.error('Erro ao buscar parceiro (após limpar sessão):', retryResult.error);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:128',message:'Erro ao buscar parceiro após limpar sessão',data:{errorCode:retryResult.error.code,errorMessage:retryResult.error.message,errorDetails:retryResult.error.details,errorHint:retryResult.error.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          throw retryResult.error;
        }
        
        data = retryResult.data;
        error = null;
      } else if (error) {
        console.error('Erro ao buscar parceiro:', error);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:135',message:'Erro ao buscar parceiro',data:{errorCode:error.code,errorMessage:error.message,errorDetails:error.details,errorHint:error.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw error;
      }

      if (!data) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:85',message:'Parceiro não encontrado (data null)',data:{partnerId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        throw new Error('Parceiro não encontrado');
      }

      // Verificar se parceiro está aprovado e ativo
      if (data.status !== 'approved') {
        console.warn('Parceiro não está aprovado:', data.status);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:91',message:'Parceiro não aprovado',data:{partnerId:id,status:data.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // Não bloquear, apenas avisar
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:97',message:'Parceiro carregado com sucesso',data:{partnerId:data.id,partnerName:data.name,status:data.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      setPartner(data);
    } catch (error: any) {
      console.error('Erro ao carregar parceiro:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:103',message:'Erro final ao carregar parceiro',data:{errorMessage:error.message,errorCode:error.code,partnerId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível carregar as informações do parceiro.',
        variant: 'destructive',
      });
      setPartner(null);
    }
  };

  const loadPricing = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // #region agent log
      const { data: sessionData } = await supabase.auth.getSession();
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:100',message:'loadPricing iniciado',data:{partnerId:id,hasUser:!!user,userEmail:user?.email,hasSession:!!sessionData?.session,userId:sessionData?.session?.user?.id,userRole:sessionData?.session?.user?.role,authRole:user ? 'authenticated' : 'anonymous'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Tentar fazer refresh do token se houver sessão (para garantir token válido)
      if (sessionData?.session && sessionData.session.refresh_token) {
        const expiresAt = sessionData.session.expires_at ? sessionData.session.expires_at * 1000 : 0;
        const now = Date.now();
        const isExpired = expiresAt > 0 && expiresAt <= now;
        const timeUntilExpiry = expiresAt > 0 ? expiresAt - now : 0;
        
        // Tentar refresh se expirado ou próximo de expirar (menos de 5 minutos)
        if (isExpired || timeUntilExpiry < 5 * 60 * 1000) {
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              // Se não conseguir fazer refresh, limpar sessão para fazer requisições sem JWT
              await supabase.auth.signOut();
            }
          } catch (refreshError) {
            // Se não conseguir fazer refresh, limpar sessão para fazer requisições sem JWT
            await supabase.auth.signOut();
          }
        }
      }
      
      let { data, error } = await supabase
        .from('partner_pricing')
        .select('*')
        .eq('partner_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:230',message:'Query partner_pricing resultado',data:{hasData:!!data,dataLength:data?.length,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,errorDetails:error?.details,is401:error?.code === 'PGRST301' || error?.status === 401},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Se erro 401 com JWT expired, limpar sessão e retentar sem JWT
      if (error && (error.code === 'PGRST301' || error.message?.includes('JWT expired'))) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:235',message:'JWT expirado detectado em pricing, limpando sessão e retentando',data:{partnerId:id,errorCode:error.code,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        await supabase.auth.signOut();
        
        // Retentar sem JWT (usando políticas públicas)
        const retryResult = await supabase
          .from('partner_pricing')
          .select('*')
          .eq('partner_id', id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:245',message:'Retry pricing sem JWT resultado',data:{hasData:!!retryResult.data,dataLength:retryResult.data?.length,hasError:!!retryResult.error,errorCode:retryResult.error?.code,errorMessage:retryResult.error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (retryResult.error) {
          console.error('Erro ao carregar preços (após limpar sessão):', retryResult.error);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:250',message:'Erro ao buscar preços após limpar sessão',data:{errorCode:retryResult.error.code,errorMessage:retryResult.error.message,errorDetails:retryResult.error.details,errorHint:retryResult.error.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          throw retryResult.error;
        }
        
        data = retryResult.data;
        error = null;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:111',message:'Query partner_pricing resultado',data:{hasData:!!data,dataLength:data?.length,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,errorDetails:error?.details,errorHint:error?.hint,is401:error?.code === 'PGRST301' || error?.status === 401,is403:error?.code === '42501' || error?.status === 403,isRLSError:error?.message?.includes('permission denied') || error?.message?.includes('row-level security')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:116',message:'Erro ao buscar preços',data:{errorCode:error.code,errorMessage:error.message,errorDetails:error.details,errorHint:error.hint,isTableMissing:error.code === 'PGRST116' || error.message?.includes('does not exist')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('Tabela partner_pricing ainda não foi criada.');
          setPricingList([]);
          return;
        }
        throw error;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:127',message:'Preços carregados com sucesso',data:{pricingCount:data?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      setPricingList(data || []);
      if (data && data.length > 0) {
        // Se houver apenas 1 produto, selecionar automaticamente
        if (data.length === 1) {
          setSelectedService(data[0].id);
          setGuests(data[0].min_guests);
        } else if (!selectedService) {
          // Se houver múltiplos, selecionar o primeiro
          setSelectedService(data[0].id);
          setGuests(data[0].min_guests);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar preços:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:137',message:'Erro final ao carregar preços',data:{errorMessage:error.message,errorCode:error.code,partnerId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os preços.',
          variant: 'destructive',
        });
      }
      setPricingList([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedPricing = pricingList.find(p => p.id === selectedService);

  // Funções para manipular vídeo do YouTube (similar ao PartnerDetailModal)
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const getYouTubeEmbedUrl = (videoId: string, autoplay: boolean = false): string => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=${autoplay ? 1 : 0}&controls=1&enablejsapi=1&origin=${window.location.origin}`;
  };

  const getYouTubeThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const handleVideoClick = (productId: string) => {
    setVideoPlaying(prev => ({ ...prev, [productId]: true }));
  };

  // Reset video playing state when modal closes or product changes
  useEffect(() => {
    if (!selectedService) {
      setVideoPlaying({});
    }
  }, [selectedService]);

  const calculateTotal = () => {
    if (!selectedPricing) return 0;

    let total = selectedPricing.base_price;

    if (selectedPricing.pricing_type === 'per_person' && selectedPricing.price_per_person) {
      total = selectedPricing.base_price + (selectedPricing.price_per_person * guests);
    } else if (selectedPricing.pricing_type === 'per_night' && selectedPricing.price_per_night) {
      total = selectedPricing.base_price + (selectedPricing.price_per_night * 1);
    }

    return total;
  };

  const handleReserve = async () => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para fazer uma reserva',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedService || !reservationDate || !id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione um serviço e uma data',
        variant: 'destructive',
      });
      return;
    }

    const dateString = format(reservationDate, 'yyyy-MM-dd');

    if (!selectedPricing) return;

    if (guests < selectedPricing.min_guests) {
      toast({
        title: 'Número mínimo de pessoas',
        description: `Este serviço requer no mínimo ${selectedPricing.min_guests} ${selectedPricing.min_guests === 1 ? 'pessoa' : 'pessoas'}`,
        variant: 'destructive',
      });
      return;
    }

    if (selectedPricing.max_guests && guests > selectedPricing.max_guests) {
      toast({
        title: 'Número máximo de pessoas',
        description: `Este serviço aceita no máximo ${selectedPricing.max_guests} pessoas`,
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const totalAmount = calculateTotal();

      // Chamar Edge Function para criar checkout
      const { data, error } = await supabase.functions.invoke('reservation-checkout', {
        body: {
          partnerId: id,
          serviceId: selectedService, // Adicionar service_id
          reservationType: 'other',
          serviceName: selectedPricing.service_name,
          reservationDate: dateString,
          reservationTime: reservationTime || null,
          guests,
          totalAmount,
          guestName: user.user_metadata?.full_name || user.email,
          guestEmail: user.email,
          guestPhone: user.user_metadata?.phone || null,
          specialRequests: specialRequests || null,
          successUrl: `${window.location.origin}/minhas-reservas`,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        // Redirecionar para Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: 'Erro ao criar reserva',
        description: error.message || 'Não foi possível criar a reserva. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <UniversalLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-ms-primary-blue mx-auto mb-4" />
            <p className="text-gray-500">Carregando informações...</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  if (!partner) {
    return (
      <UniversalLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Parceiro não encontrado</p>
            <Button asChild>
              <Link to="/descubramatogrossodosul/parceiros">Voltar para Parceiros</Link>
            </Button>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  if (pricingList.length === 0) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:257',message:'No pricing available - showing unavailable message',data:{pricingListLength:pricingList.length,partnerId:id,loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return (
      <UniversalLayout>
        <div className="ms-container py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/descubramatogrossodosul/parceiros">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Parceiros
            </Link>
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Reserva Indisponível</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Este parceiro ainda não possui serviços disponíveis para reserva online.
              </p>
              <Button asChild>
                <Link to="/descubramatogrossodosul/parceiros">Voltar para Parceiros</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <main className="flex-grow">
        {/* Header */}
        <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal py-12">
          <div className="ms-container">
            <Button variant="ghost" asChild className="mb-6 text-white hover:text-white/80">
              <Link to="/descubramatogrossodosul/parceiros">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Parceiros
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              {partner.logo_url && (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-lg"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{partner.name}</h1>
                {partner.address && (
                  <p className="text-white/90 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {partner.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-gradient-to-b from-white via-blue-50/30 to-green-50/30">
          <div className="ms-container py-12">
            <div className="max-w-6xl mx-auto">
              {/* Seção de Seleção de Produtos */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-ms-primary-blue mb-6">Selecione o Serviço</h2>
                
                {pricingList.length === 1 ? (
                  // Se houver apenas 1 produto, mostrar como card único (já selecionado)
                  <div className="max-w-md mx-auto">
                    {pricingList.map((pricing) => {
                      const isSelected = selectedService === pricing.id;
                      const mainImage = pricing.gallery_images && pricing.gallery_images.length > 0 
                        ? pricing.gallery_images[0] 
                        : null;
                      const youtubeVideoId = pricing.youtube_url ? getYouTubeVideoId(pricing.youtube_url) : null;
                      const isVideoPlaying = videoPlaying[pricing.id] || false;
                      
                      return (
                        <Card
                          key={pricing.id}
                          className={cn(
                            "overflow-hidden cursor-pointer transition-all duration-300 h-full",
                            isSelected 
                              ? "ring-2 ring-ms-primary-blue ring-offset-2 bg-ms-primary-blue/5 shadow-lg" 
                              : "hover:shadow-md border-gray-200"
                          )}
                          onClick={() => {
                            setSelectedService(pricing.id);
                            setGuests(pricing.min_guests);
                          }}
                        >
                          {/* Imagem ou Vídeo */}
                          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10">
                            {youtubeVideoId && !isVideoPlaying ? (
                              <div 
                                className="relative w-full h-full cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVideoClick(pricing.id);
                                }}
                              >
                                <img
                                  src={getYouTubeThumbnailUrl(youtubeVideoId)}
                                  alt={pricing.service_name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                                  <div className="bg-red-600 rounded-full p-4 hover:scale-110 transition-transform">
                                    <Play className="w-8 h-8 text-white fill-white" />
                                  </div>
                                </div>
                              </div>
                            ) : youtubeVideoId && isVideoPlaying ? (
                              <iframe
                                src={getYouTubeEmbedUrl(youtubeVideoId, true)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                frameBorder="0"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : mainImage ? (
                              <img
                                src={mainImage}
                                alt={pricing.service_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `data:image/svg+xml,${encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">Imagem não disponível</text></svg>`)}`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ms-primary-blue/20 to-ms-discovery-teal/20">
                                <DollarSign className="w-16 h-16 text-ms-primary-blue/40" />
                              </div>
                            )}
                            
                            {/* Badge de Seleção */}
                            {isSelected && (
                              <div className="absolute top-4 right-4 bg-ms-primary-blue text-white rounded-full p-2 shadow-lg">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                            
                            {/* Badge de Preço */}
                            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-ms-primary-blue px-4 py-2 rounded-full text-sm font-bold shadow-md">
                              R$ {pricing.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          
                          {/* Conteúdo do Card */}
                          <div className="p-5">
                            <h3 className="text-xl font-bold text-ms-primary-blue mb-2">
                              {pricing.service_name}
                            </h3>
                            {pricing.description && (
                              <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                                {pricing.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Users size={14} className="text-ms-pantanal-green" />
                                <span className="text-xs font-medium">
                                  {pricing.min_guests} {pricing.min_guests === 1 ? 'pessoa' : 'pessoas'} mín.
                                  {pricing.max_guests && ` • ${pricing.max_guests} máx.`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  // Se houver múltiplos produtos, mostrar em grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pricingList.map((pricing) => {
                      const isSelected = selectedService === pricing.id;
                      const mainImage = pricing.gallery_images && pricing.gallery_images.length > 0 
                        ? pricing.gallery_images[0] 
                        : null;
                      const youtubeVideoId = pricing.youtube_url ? getYouTubeVideoId(pricing.youtube_url) : null;
                      const isVideoPlaying = videoPlaying[pricing.id] || false;
                      
                      return (
                        <Card
                          key={pricing.id}
                          className={cn(
                            "overflow-hidden cursor-pointer transition-all duration-300 h-full group",
                            isSelected 
                              ? "ring-2 ring-ms-primary-blue ring-offset-2 bg-ms-primary-blue/5 shadow-lg transform hover:-translate-y-1" 
                              : "hover:shadow-xl border-gray-200 transform hover:-translate-y-1"
                          )}
                          onClick={() => {
                            setSelectedService(pricing.id);
                            setGuests(pricing.min_guests);
                          }}
                        >
                          {/* Imagem ou Vídeo */}
                          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10">
                            {youtubeVideoId && !isVideoPlaying ? (
                              <div 
                                className="relative w-full h-full cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVideoClick(pricing.id);
                                }}
                              >
                                <img
                                  src={getYouTubeThumbnailUrl(youtubeVideoId)}
                                  alt={pricing.service_name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                                  <div className="bg-red-600 rounded-full p-4 hover:scale-110 transition-transform">
                                    <Play className="w-8 h-8 text-white fill-white" />
                                  </div>
                                </div>
                              </div>
                            ) : youtubeVideoId && isVideoPlaying ? (
                              <iframe
                                src={getYouTubeEmbedUrl(youtubeVideoId, true)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                frameBorder="0"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : mainImage ? (
                              <img
                                src={mainImage}
                                alt={pricing.service_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `data:image/svg+xml,${encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">Imagem não disponível</text></svg>`)}`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ms-primary-blue/20 to-ms-discovery-teal/20">
                                <DollarSign className="w-16 h-16 text-ms-primary-blue/40" />
                              </div>
                            )}
                            
                            {/* Overlay no hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            
                            {/* Badge de Seleção */}
                            {isSelected && (
                              <div className="absolute top-4 right-4 bg-ms-primary-blue text-white rounded-full p-2 shadow-lg z-10">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                            
                            {/* Badge de Preço */}
                            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-ms-primary-blue px-4 py-2 rounded-full text-sm font-bold shadow-md z-10">
                              R$ {pricing.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          
                          {/* Conteúdo do Card */}
                          <div className="p-5">
                            <h3 className="text-xl font-bold text-ms-primary-blue mb-2 group-hover:text-ms-discovery-teal transition-colors">
                              {pricing.service_name}
                            </h3>
                            {pricing.description && (
                              <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                                {pricing.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Users size={14} className="text-ms-pantanal-green" />
                                <span className="text-xs font-medium">
                                  {pricing.min_guests} {pricing.min_guests === 1 ? 'pessoa' : 'pessoas'} mín.
                                  {pricing.max_guests && ` • ${pricing.max_guests} máx.`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Formulário de Reserva */}
              {selectedService && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-ms-primary-blue" />
                      <CardTitle className="text-2xl">Finalizar Reserva</CardTitle>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-600">
                          Preencha os dados abaixo para finalizar sua reserva.
                        </p>
                        <p className="text-sm text-green-700 font-medium mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Pagamento 100% seguro via Stripe - Seus dados estão protegidos
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reservation-date">Data *</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !reservationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {reservationDate ? (
                            format(reservationDate, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={reservationDate}
                          onSelect={(date) => {
                            setReservationDate(date);
                            setCalendarOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="reservation-time">Horário (opcional)</Label>
                    <Input
                      id="reservation-time"
                      type="time"
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">Número de Pessoas *</Label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <Input
                      id="guests"
                      type="number"
                      min={selectedPricing?.min_guests || 1}
                      max={selectedPricing?.max_guests || undefined}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      required
                      className="flex-1"
                    />
                  </div>
                  {selectedPricing && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPricing.min_guests} {selectedPricing.min_guests === 1 ? 'pessoa' : 'pessoas'} mín.
                      {selectedPricing.max_guests && ` • ${selectedPricing.max_guests} máx.`}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="special-requests">Observações (opcional)</Label>
                  <Input
                    id="special-requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Alguma observação especial?"
                  />
                </div>

                {selectedPricing && (
                  <div className="bg-white rounded-lg p-6 border-2 border-ms-primary-blue/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Valor Total</p>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-4xl font-bold text-ms-primary-blue">
                        R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {selectedPricing.pricing_type === 'per_person' && selectedPricing.price_per_person && (
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedPricing.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + 
                        {' '}({guests} × {selectedPricing.price_per_person.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </p>
                    )}
                  </div>
                )}

                {!user ? (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800 font-semibold mb-2">
                      ⚠️ Login necessário
                    </p>
                    <p className="text-yellow-700 text-sm mb-4">
                      Você precisa estar logado para fazer uma reserva. Faça login e volte aqui para continuar.
                    </p>
                    <Button
                      asChild
                      className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white"
                    >
                      <Link to="/auth?redirect=/descubramatogrossodosul/parceiros">
                        Fazer Login
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleReserve}
                      disabled={processing || !selectedService || !reservationDate}
                      className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white h-12 text-base font-semibold"
                      size="lg"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Pagar e Finalizar Reserva
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      Você será redirecionado para uma página segura de pagamento
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
}

