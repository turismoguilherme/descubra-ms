
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "./DatePicker";

interface GeneralInformationFieldsProps {
  occupation: string;
  setOccupation: (value: string) => void;
  birthDate: Date | undefined;
  setBirthDate: (date: Date | undefined) => void;
  gender: string;
  setGender: (value: string) => void;
  sexualityIdentity: string;
  setSexualityIdentity: (value: string) => void;
}

const GeneralInformationFields = ({
  occupation,
  setOccupation,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  sexualityIdentity,
  setSexualityIdentity
}: GeneralInformationFieldsProps) => {

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">
          Ocupação/Profissão
        </Label>
        <Input
          id="occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="Digite sua ocupação ou profissão"
          className="h-12 border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue"
        />
      </div>

      <DatePicker 
        birthDate={birthDate} 
        setBirthDate={setBirthDate} 
      />

      <div className="space-y-2">
        <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Sexo</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="h-12 border border-gray-300 rounded-md focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue">
            <SelectValue placeholder="Selecione seu sexo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masculino">Masculino</SelectItem>
            <SelectItem value="feminino">Feminino</SelectItem>
            <SelectItem value="nao-binario">Não-binário</SelectItem>
            <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sexualityIdentity" className="text-sm font-medium text-gray-700">Sexualidade e Identidade de Gênero</Label>
        <Select value={sexualityIdentity} onValueChange={setSexualityIdentity}>
          <SelectTrigger className="h-12 border border-gray-300 rounded-md focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue">
            <SelectValue placeholder="Selecione sua orientação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="heterossexual">Heterossexual</SelectItem>
            <SelectItem value="homossexual">Homossexual</SelectItem>
            <SelectItem value="bissexual">Bissexual</SelectItem>
            <SelectItem value="pansexual">Pansexual</SelectItem>
            <SelectItem value="assexual">Assexual</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
            <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default GeneralInformationFields;
