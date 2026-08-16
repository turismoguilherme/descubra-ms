import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PeriodFilterTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export function PeriodFilterTabs({ value, onChange }: PeriodFilterTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="bg-gray-100">
        <TabsTrigger value="week">7 dias</TabsTrigger>
        <TabsTrigger value="month">30 dias</TabsTrigger>
        <TabsTrigger value="quarter">90 dias</TabsTrigger>
        <TabsTrigger value="year">1 ano</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

