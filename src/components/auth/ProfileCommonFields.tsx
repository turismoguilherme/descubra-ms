
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileCommonFieldsProps {
  occupation: string;
  setOccupation: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  sexualityIdentity: string;
  setSexualityIdentity: (val: string) => void;
  disabled?: boolean;
}

const ProfileCommonFields: React.FC<ProfileCommonFieldsProps> = ({
  occupation,
  setOccupation,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  sexualityIdentity,
  setSexualityIdentity,
  disabled
}) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="occupation">Profissão</Label>
      <Input 
        id="occupation" 
        value={occupation || ''} 
        onChange={(e) => setOccupation(e.target.value)} 
        placeholder="Sua profissão" 
        className="h-12" 
        disabled={disabled}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="birthDate">Data de Nascimento</Label>
      <Input 
        id="birthDate" 
        type="date" 
        value={birthDate} 
        onChange={(e) => setBirthDate(e.target.value)} 
        className="h-12" 
        disabled={disabled}
      />
    </div>
    <div className="space-y-2">
      <Label>Gênero</Label>
       <Select onValueChange={setGender} value={gender || ''} disabled={disabled}>
        <SelectTrigger className="h-12"><SelectValue placeholder="Selecione seu gênero" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="masculino">Masculino</SelectItem>
          <SelectItem value="feminino">Feminino</SelectItem>
          <SelectItem value="nao-binario">Não-binário</SelectItem>
          <SelectItem value="outro">Outro</SelectItem>
          <SelectItem value="prefiro-nao-declarar">Prefiro não declarar</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Identidade Sexual</Label>
       <Select onValueChange={setSexualityIdentity} value={sexualityIdentity || ''} disabled={disabled}>
        <SelectTrigger className="h-12"><SelectValue placeholder="Selecione sua identidade sexual" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="heterossexual">Heterossexual</SelectItem>
          <SelectItem value="homossexual">Homossexual</SelectItem>
          <SelectItem value="bissexual">Bissexual</SelectItem>
          <SelectItem value="pansexual">Pansexual</SelectItem>
          <SelectItem value="assexual">Assexual</SelectItem>
          <SelectItem value="outro">Outro</SelectItem>
          <SelectItem value="prefiro-nao-declarar">Prefiro não declarar</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default ProfileCommonFields;
