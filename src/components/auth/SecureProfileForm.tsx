
import { Card, CardContent } from "@/components/ui/card";
import UserTypeSelection from "./UserTypeSelection";
import TouristFields from "./TouristFields";
import ResidentFields from "./ResidentFields";
import { Button } from "@/components/ui/button";
import { useSecureProfileForm } from "@/hooks/use-secure-profile-form";
import { LogIn, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from 'react';
import ProfileCommonFields from "./ProfileCommonFields";
import CollaborationQuestion from "./CollaborationQuestion";

const SecureProfileForm = () => {
  const {
    fullName, setFullName,
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
    wantsToCollaborate, setWantsToCollaborate,
    fieldErrors,
    handleSubmit
  } = useSecureProfileForm();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-center py-6 bg-white">
        <img 
          src="/images/logo-descubra-ms.png?v=5" 
          alt="Descubra Mato Grosso do Sul" 
          className="h-[60px] w-auto" 
        />
      </div>

      <div className="flex-grow bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-semibold text-ms-primary-blue mb-6 text-center">
            Complete seu perfil
          </h1>
          
          {/* Indicador de progresso quando está enviando */}
          {isSubmitting && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-blue-800 font-medium">Salvando seu perfil...</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">Por favor, aguarde enquanto processamos suas informações.</p>
              <div className="mt-2 text-xs text-blue-500">
                <p>✓ Validando dados...</p>
                <p>✓ Verificando segurança...</p>
                <p>⏳ Salvando no banco de dados...</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-12 border border-gray-300 rounded-md px-4 focus:border-ms-primary-blue focus:ring-1 focus:ring-ms-primary-blue disabled:opacity-50"
                placeholder="Como gostaria de ser chamado(a)?"
              />
              {fieldErrors.fullName && (
                <span className="text-red-600 text-xs">{fieldErrors.fullName}</span>
              )}
            </div>
            
            <UserTypeSelection 
              userType={userType} 
              setUserType={setUserType}
              disabled={isSubmitting}
            />
            {fieldErrors.userType && (
              <span className="text-red-600 text-xs">{fieldErrors.userType}</span>
            )}
            
            {userType && (
              <>
                <ProfileCommonFields
                  occupation={occupation}
                  setOccupation={setOccupation}
                  birthDate={birthDate}
                  setBirthDate={setBirthDate}
                  gender={gender}
                  setGender={setGender}
                  sexualityIdentity={sexualityIdentity}
                  setSexualityIdentity={setSexualityIdentity}
                  disabled={isSubmitting}
                />
                <div className="mt-1 flex flex-col gap-2">
                  {fieldErrors.occupation && <span className="text-red-600 text-xs">{fieldErrors.occupation}</span>}
                  {fieldErrors.birthDate && <span className="text-red-600 text-xs">{fieldErrors.birthDate}</span>}
                  {fieldErrors.gender && <span className="text-red-600 text-xs">{fieldErrors.gender}</span>}
                  {fieldErrors.sexualityIdentity && <span className="text-red-600 text-xs">{fieldErrors.sexualityIdentity}</span>}
                </div>
              </>
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
                  disabled={isSubmitting}
                />
                <div className="mt-1 flex flex-col gap-2">
                  {fieldErrors.country && <span className="text-red-600 text-xs">{fieldErrors.country}</span>}
                  {fieldErrors.state && <span className="text-red-600 text-xs">{fieldErrors.state}</span>}
                  {fieldErrors.city && <span className="text-red-600 text-xs">{fieldErrors.city}</span>}
                  {fieldErrors.travelOrganization && <span className="text-red-600 text-xs">{fieldErrors.travelOrganization}</span>}
                  {fieldErrors.stayDuration && <span className="text-red-600 text-xs">{fieldErrors.stayDuration}</span>}
                  {fieldErrors.travelMotives && <span className="text-red-600 text-xs">{fieldErrors.travelMotives}</span>}
                </div>
              </div>
            )}

            {userType === "morador" && (
              <div className="space-y-4">
                <ResidentFields
                  residenceCity={residenceCity}
                  setResidenceCity={setResidenceCity}
                  neighborhood={neighborhood}
                  setNeighborhood={setNeighborhood}
                  customNeighborhood={customNeighborhood}
                  setCustomNeighborhood={setCustomNeighborhood}
                  timeInCity={timeInCity}
                  setTimeInCity={setTimeInCity}
                  disabled={isSubmitting}
                />
                <div className="mt-1 flex flex-col gap-2">
                  {fieldErrors.residenceCity && <span className="text-red-600 text-xs">{fieldErrors.residenceCity}</span>}
                  {fieldErrors.neighborhood && <span className="text-red-600 text-xs">{fieldErrors.neighborhood}</span>}
                  {fieldErrors.timeInCity && <span className="text-red-600 text-xs">{fieldErrors.timeInCity}</span>}
                </div>
                <CollaborationQuestion
                  wantsToCollaborate={wantsToCollaborate}
                  setWantsToCollaborate={setWantsToCollaborate}
                  error={!!fieldErrors.wantsToCollaborate}
                  disabled={isSubmitting}
                />
                {fieldErrors.wantsToCollaborate && (
                  <span className="text-red-600 text-xs">{fieldErrors.wantsToCollaborate}</span>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !userType}
              className="w-full h-12 bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white font-medium rounded-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <LogIn size={20} className="mr-2" />
                  Finalizar Cadastro
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecureProfileForm;
