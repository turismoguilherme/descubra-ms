
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface TouristFieldsProps {
  country: string;
  setCountry: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  travelOrganization: string;
  setTravelOrganization: (value: string) => void;
  customTravelOrganization: string;
  setCustomTravelOrganization: (value: string) => void;
  stayDuration: string;
  setStayDuration: (value: string) => void;
  travelMotives: string[];
  handleMotiveChange: (motive: string, checked: boolean) => void;
  otherMotive: string;
  setOtherMotive: (value: string) => void;
  disabled?: boolean;
}

const TouristFields = ({
  country,
  setCountry,
  state,
  setState,
  city,
  setCity,
  travelOrganization,
  setTravelOrganization,
  customTravelOrganization,
  setCustomTravelOrganization,
  stayDuration,
  setStayDuration,
  travelMotives,
  handleMotiveChange,
  otherMotive,
  setOtherMotive,
  disabled
}: TouristFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium text-gray-700">País</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Brasil"
            required
            disabled={disabled}
            className="h-12 border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-gray-700">Estado</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="São Paulo"
            required
            disabled={disabled}
            className="h-12 border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">Cidade</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="São Paulo"
            required
            disabled={disabled}
            className="h-12 border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">Como organizou sua viagem?</Label>
        <RadioGroup value={travelOrganization} onValueChange={setTravelOrganization} required className="space-y-3" disabled={disabled}>
          {[
            { value: "agencia_fisica", label: "Agência de viagem física" },
            { value: "corporativo", label: "Empresa organizou / Corporativo" },
            { value: "sites", label: "Sites / Aplicativos" },
            { value: "Outro", label: "Outro" }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} disabled={disabled} />
              <Label htmlFor={option.value} className="cursor-pointer text-sm">{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
        
        {travelOrganization === "Outro" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Especifique:</Label>
            <Input
              value={customTravelOrganization}
              onChange={(e) => setCustomTravelOrganization(e.target.value)}
              placeholder="Especifique como organizou sua viagem"
              required
              disabled={disabled}
              className="h-12 border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="stayDuration" className="text-sm font-medium text-gray-700">
          Duração da estadia
        </Label>
        <Select value={stayDuration} onValueChange={setStayDuration} required disabled={disabled}>
          <SelectTrigger className="h-12 border border-gray-300 rounded-md focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue">
            <SelectValue placeholder="Selecione a duração" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-2-dias">1-2 dias</SelectItem>
            <SelectItem value="3-5-dias">3-5 dias</SelectItem>
            <SelectItem value="6-10-dias">6-10 dias</SelectItem>
            <SelectItem value="mais-10-dias">Mais de 10 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">Motivos da viagem (selecione quantos quiser):</Label>
        <div className="space-y-3">
          {[
            "Ecoturismo",
            "Turismo cultural", 
            "Gastronomia",
            "Aventura",
            "Negócios",
            "Eventos",
            "Visita a familiares/amigos",
            "Descanso"
          ].map((motive) => (
            <div key={motive} className="flex items-center space-x-2">
              <Checkbox
                id={motive}
                checked={travelMotives.includes(motive)}
                onCheckedChange={(checked) => handleMotiveChange(motive, checked as boolean)}
                disabled={disabled}
              />
              <Label htmlFor={motive} className="cursor-pointer text-sm">{motive}</Label>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="otherMotive" className="text-sm font-medium text-gray-700">Outro motivo:</Label>
          <Input
            id="otherMotive"
            value={otherMotive}
            onChange={(e) => setOtherMotive(e.target.value)}
            placeholder="Outro motivo da viagem"
            disabled={disabled}
            className="h-12 border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue"
          />
        </div>
      </div>
    </div>
  );
};

export default TouristFields;
