
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, MapPin, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PDFExportButton from "../exports/PDFExportButton";

interface CheckinData {
  id: string;
  cat_name: string;
  timestamp: string;
  status: string;
  latitude: number;
  longitude: number;
  distance_from_cat?: number;
  user_id: string;
  created_at: string;
}

const CheckinReports = () => {
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const [filteredCheckins, setFilteredCheckins] = useState<CheckinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchCheckins();
  }, []);

  useEffect(() => {
    filterCheckins();
  }, [checkins, searchTerm, statusFilter, dateFilter]);

  const fetchCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from('cat_checkins')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Error fetching checkins:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar check-ins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCheckins = () => {
    let filtered = checkins.filter(checkin => {
      const matchesSearch = checkin.cat_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           checkin.user_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || checkin.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all") {
        const checkinDate = new Date(checkin.timestamp);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case "today":
            matchesDate = daysDiff === 0;
            break;
          case "week":
            matchesDate = daysDiff <= 7;
            break;
          case "month":
            matchesDate = daysDiff <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    setFilteredCheckins(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case 'fora_da_area':
        return <Badge className="bg-red-100 text-red-800">Fora da área</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const exportColumns = [
    { header: 'CAT', dataKey: 'cat_name' },
    { header: 'Data/Hora', dataKey: 'timestamp' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Distância (m)', dataKey: 'distance_from_cat' },
    { header: 'User ID', dataKey: 'user_id' }
  ];

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-600" />
            Relatórios de Check-ins
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Acompanhe os check-ins realizados nos CATs
          </p>
        </div>
        <PDFExportButton
          data={filteredCheckins}
          filename="relatorio-checkins"
          title="Relatório de Check-ins CAT"
          columns={exportColumns}
        />
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por CAT ou User ID..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="fora_da_area">Fora da área</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    CAT
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Data/Hora
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Distância</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>User ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Carregando check-ins...
                  </TableCell>
                </TableRow>
              ) : filteredCheckins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    Nenhum check-in encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCheckins.map((checkin) => (
                  <TableRow key={checkin.id}>
                    <TableCell className="font-medium">{checkin.cat_name}</TableCell>
                    <TableCell>{formatDateTime(checkin.timestamp)}</TableCell>
                    <TableCell>{getStatusBadge(checkin.status)}</TableCell>
                    <TableCell>
                      {checkin.distance_from_cat ? `${Math.round(checkin.distance_from_cat)}m` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {checkin.latitude.toFixed(4)}, {checkin.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {checkin.user_id.substring(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredCheckins.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total de check-ins: {filteredCheckins.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckinReports;
