
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { msCities, neighborhoods } from "@/data/cities";

interface ResidentFieldsProps {
  residenceCity: string;
  setResidenceCity: (value: string) => void;
  neighborhood: string;
  setNeighborhood: (value: string) => void;
  customNeighborhood: string;
  setCustomNeighborhood: (value: string) => void;
  timeInCity: string;
  setTimeInCity: (value: string) => void;
  disabled?: boolean;
}

const ResidentFields = ({
  residenceCity,
  setResidenceCity,
  neighborhood,
  setNeighborhood,
  customNeighborhood,
  setCustomNeighborhood,
  timeInCity,
  setTimeInCity,
  disabled
}: ResidentFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="residenceCity" className="text-sm font-medium text-gray-700">Qual cidade reside?</Label>
        <Select value={residenceCity} onValueChange={setResidenceCity} required disabled={disabled}>
          <SelectTrigger className="h-12 border border-gray-300 rounded-md focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue">
            <SelectValue placeholder="Selecione sua cidade" />
          </SelectTrigger>
          <SelectContent>
            {msCities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">Qual bairro reside?</Label>
        <Select value={neighborhood} onValueChange={setNeighborhood} required disabled={disabled}>
          <SelectTrigger className="h-12 border border-gray-300 rounded-md focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue">
            <SelectValue placeholder="Selecione seu bairro" />
          </SelectTrigger>
          <SelectContent>
            {neighborhoods.map((bairro) => (
              <SelectItem key={bairro} value={bairro}>{bairro}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {neighborhood === "Outro" && (
        <div className="space-y-2">
          <Label htmlFor="customNeighborhood" className="text-sm font-medium text-gray-700">Especifique seu bairro</Label>
          <Input
            id="customNeighborhood"
            value={customNeighborhood}
            onChange={(e) => setCustomNeighborhood(e.target.value)}
            placeholder="Digite o nome do seu bairro"
            required
            disabled={disabled}
            className="h-12 border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="timeInCity" className="text-sm font-medium text-gray-700">Quanto tempo mora na cidade/estado?</Label>
        <Select value={timeInCity} onValueChange={setTimeInCity} required disabled={disabled}>
          <SelectTrigger className="h-12 border border-gray-300 rounded-md focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue">
            <SelectValue placeholder="Selecione o tempo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="menos-1-ano">Menos de 1 ano</SelectItem>
            <SelectItem value="1-3-anos">1-3 anos</SelectItem>
            <SelectItem value="4-10-anos">4-10 anos</SelectItem>
            <SelectItem value="mais-10-anos">Mais de 10 anos</SelectItem>
            <SelectItem value="nasceu-aqui">Nasceu aqui</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ResidentFields;
