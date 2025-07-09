import { Button } from "@/components/ui/button";
import { useProfileForm } from "@/hooks/useProfileForm";
import { LogIn } from "lucide-react";
import UserTypeSelection from "./UserTypeSelection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TouristFields from "./TouristFields";
import ResidentFields from "./ResidentFields";

const ProfileForm = () => {
  const {
    userType, setUserType,
    occupation, setOccupation,
    birthDate, setBirthDate,
    gender, setGender,
    sexualityIdentity, setSexualityIdentity,
    country, setCountry,
    state, setState,
    city, setCity,
    travelOrganization, setTravelOrganization,
    customTravelOrganization, setCustomTravelOrganization,
    stayDuration, setStayDuration,
    travelMotives, handleMotiveChange,
    otherMotive, setOtherMotive,
    residenceCity, setResidenceCity,
    neighborhood, setNeighborhood,
    customNeighborhood, setCustomNeighborhood,
    timeInCity, setTimeInCity,
    isSubmitting,
    handleSubmit
  } = useProfileForm();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo - same as RegisterForm */}
      <div className="flex justify-center py-6 bg-white">
        <img 
          src="/lovable-uploads/1e2f844e-0cd3-4b3b-84b6-85904f67ebc7.png" 
          alt="Descubra Mato Grosso do Sul" 
          className="h-[60px] w-auto" 
        />
      </div>

      {/* Main content with gradient background - same as RegisterForm */}
      <div className="flex-grow bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green py-12 px-4">
        <div className="ms-container max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-semibold text-ms-primary-blue mb-6 text-center">
            Complete seu perfil
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <UserTypeSelection 
              userType={userType} 
              setUserType={setUserType} 
            />
            
            {userType && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Profissão</Label>
                  <Input id="occupation" value={occupation || ''} onChange={(e) => setOccupation(e.target.value)} placeholder="Sua profissão" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Gênero</Label>
                   <Select onValueChange={setGender} value={gender || ''}>
                    <SelectTrigger><SelectValue placeholder="Selecione seu gênero" /></SelectTrigger>
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
                   <Select onValueChange={setSexualityIdentity} value={sexualityIdentity || ''}>
                    <SelectTrigger><SelectValue placeholder="Selecione sua identidade sexual" /></SelectTrigger>
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
            )}

            {userType === "turista" && (
              <div className="space-y-6">
                <TouristFields
                  country={country}
                  setCountry={setCountry}
                  state={state}
                  setState={setState}
                  city={city}
                  setCity={setCity}
                  travelOrganization={travelOrganization}
                  setTravelOrganization={setTravelOrganization}
                  customTravelOrganization={customTravelOrganization}
                  setCustomTravelOrganization={setCustomTravelOrganization}
                  stayDuration={stayDuration}
                  setStayDuration={setStayDuration}
                  travelMotives={travelMotives}
                  handleMotiveChange={handleMotiveChange}
                  otherMotive={otherMotive}
                  setOtherMotive={setOtherMotive}
                />
              </div>
            )}

            {userType === "morador" && (
              <div className="space-y-6">
                <ResidentFields
                  residenceCity={residenceCity}
                  setResidenceCity={setResidenceCity}
                  neighborhood={neighborhood}
                  setNeighborhood={setNeighborhood}
                  customNeighborhood={customNeighborhood}
                  setCustomNeighborhood={setCustomNeighborhood}
                  timeInCity={timeInCity}
                  setTimeInCity={setTimeInCity}
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !userType}
              className="w-full h-12 bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white font-medium rounded-md"
            >
              <LogIn size={20} className="mr-2" />
              {isSubmitting ? "Salvando..." : "Finalizar Cadastro"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
