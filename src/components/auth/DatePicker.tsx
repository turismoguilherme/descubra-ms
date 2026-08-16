
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  birthDate: Date | undefined;
  setBirthDate: (date: Date | undefined) => void;
}

const DatePicker = ({ birthDate, setBirthDate }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log("Data selecionada no DatePicker:", date);
    setBirthDate(date);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Data de Nascimento</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-12 w-full justify-start text-left font-normal border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue bg-white",
              !birthDate && "text-gray-500"
            )}
            onClick={() => setIsOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {birthDate ? (
              <span className="text-gray-900">{formatDate(birthDate)}</span>
            ) : (
              <span className="text-gray-500">Selecione sua data de nascimento</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 z-[9999] bg-white border border-gray-300 shadow-2xl rounded-lg" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <div className="bg-white rounded-lg overflow-hidden">
            <Calendar
              mode="single"
              selected={birthDate}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              className="p-3 bg-white border-0 shadow-none"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
