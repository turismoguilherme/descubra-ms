import React from 'react';
// @ts-nocheck
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  reportData: unknown;
  onDownload: () => void;
  type: 'dre' | 'cashflow' | 'profit';
}

export function ReportPreviewDialog({
  open,
  onOpenChange,
  title,
  reportData,
  onDownload,
  type
}: ReportPreviewDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 p-4">
            {type === 'dre' && reportData && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-xl font-bold">Demonstração do Resultado do Exercício</h2>
                  <p className="text-sm text-gray-600">{reportData.period}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">RECEITAS</h3>
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(reportData.revenue)}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">DESPESAS</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Despesas Operacionais:</span>
                        <span className="font-semibold">{formatCurrency(reportData.expenses)}</span>
                      </div>
                      {reportData.expensesByCategory && Object.entries(reportData.expensesByCategory).map(([cat, val]: [string, any]) => (
                        <div key={cat} className="flex justify-between text-sm pl-4">
                          <span className="capitalize">- {cat}:</span>
                          <span>{formatCurrency(val)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between">
                        <span>Salários:</span>
                        <span className="font-semibold">{formatCurrency(reportData.salaries)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impostos:</span>
                        <span className="font-semibold">{formatCurrency(reportData.taxes)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${reportData.profit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                    <h3 className={`font-semibold mb-2 ${reportData.profit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                      RESULTADO
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xl">
                        <span className="font-semibold">Lucro Líquido:</span>
                        <span className={`font-bold ${reportData.profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                          {formatCurrency(reportData.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margem de Lucro:</span>
                        <span className="font-semibold">{formatPercent(reportData.profitMargin)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gráfico de Comparação */}
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Comparação Visual</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'Receitas', valor: reportData.revenue, cor: '#22c55e' },
                        { name: 'Despesas', valor: reportData.expenses, cor: '#ef4444' },
                        { name: 'Salários', valor: reportData.salaries, cor: '#eab308' },
                        { name: 'Impostos', valor: reportData.taxes, cor: '#f97316' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="valor" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {type === 'cashflow' && reportData && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-xl font-bold">Fluxo de Caixa</h2>
                  <p className="text-sm text-gray-600">Análise de entradas e saídas</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Mês</th>
                        <th className="border p-2 text-right">Entradas</th>
                        <th className="border p-2 text-right">Saídas</th>
                        <th className="border p-2 text-right">Saldo Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.months?.map((month: unknown, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="border p-2">{month.month}</td>
                          <td className="border p-2 text-right text-green-600 font-semibold">
                            {formatCurrency(month.revenue)}
                          </td>
                          <td className="border p-2 text-right text-red-600 font-semibold">
                            {formatCurrency(month.expenses)}
                          </td>
                          <td className={`border p-2 text-right font-bold ${month.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {formatCurrency(month.net)}
                          </td>
                        </tr>
                      ))}
                      {reportData.total && (
                        <tr className="bg-gray-200 font-bold">
                          <td className="border p-2">TOTAL</td>
                          <td className="border p-2 text-right text-green-700">
                            {formatCurrency(reportData.total.revenue)}
                          </td>
                          <td className="border p-2 text-right text-red-700">
                            {formatCurrency(reportData.total.expenses)}
                          </td>
                          <td className={`border p-2 text-right ${reportData.total.net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                            {formatCurrency(reportData.total.net)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Gráfico de Fluxo de Caixa */}
                {reportData.months && reportData.months.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Evolução do Fluxo de Caixa</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.months}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Entradas" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Saídas" strokeWidth={2} />
                        <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Saldo Líquido" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {type === 'profit' && reportData && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-xl font-bold">Relatório de Lucro Mensal/Anual</h2>
                  <p className="text-sm text-gray-600">Evolução do lucro ao longo do tempo</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Mês</th>
                        <th className="border p-2 text-right">Receitas</th>
                        <th className="border p-2 text-right">Despesas</th>
                        <th className="border p-2 text-right">Salários</th>
                        <th className="border p-2 text-right">Lucro Líquido</th>
                        <th className="border p-2 text-right">Margem (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.months?.map((month: unknown, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="border p-2">{month.month}</td>
                          <td className="border p-2 text-right">{formatCurrency(month.revenue)}</td>
                          <td className="border p-2 text-right text-red-600">{formatCurrency(month.expenses)}</td>
                          <td className="border p-2 text-right text-yellow-600">{formatCurrency(month.salaries)}</td>
                          <td className={`border p-2 text-right font-semibold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(month.profit)}
                          </td>
                          <td className="border p-2 text-right">{formatPercent(month.margin)}</td>
                        </tr>
                      ))}
                      {reportData.total && (
                        <tr className="bg-gray-200 font-bold">
                          <td className="border p-2">TOTAL</td>
                          <td className="border p-2 text-right">{formatCurrency(reportData.total.revenue)}</td>
                          <td className="border p-2 text-right text-red-700">{formatCurrency(reportData.total.expenses)}</td>
                          <td className="border p-2 text-right text-yellow-700">{formatCurrency(reportData.total.salaries)}</td>
                          <td className={`border p-2 text-right ${reportData.total.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(reportData.total.profit)}
                          </td>
                          <td className="border p-2 text-right">{formatPercent(reportData.total.margin)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Gráfico de Evolução do Lucro */}
                {reportData.months && reportData.months.length > 0 && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Evolução do Lucro</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reportData.months}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Receitas" strokeWidth={2} />
                          <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Lucro" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-4">Comparação Mensal</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.months}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="revenue" fill="#22c55e" name="Receitas" />
                          <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                          <Bar dataKey="salaries" fill="#eab308" name="Salários" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

