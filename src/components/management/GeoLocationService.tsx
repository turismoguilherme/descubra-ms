
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { calculateDistance } from "./utils/geoUtils";
import { CheckCircle2, AlertTriangle, MapPin } from "lucide-react";

interface GeoLocationServiceProps {
  showLocationDialog: boolean;
  setShowLocationDialog: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCat: string;
  userLocation: { lat: number; lng: number } | null;
  confirmCheckIn: () => void;
}

const GeoLocationService = ({
  showLocationDialog,
  setShowLocationDialog,
  selectedCat,
  userLocation,
  confirmCheckIn
}: GeoLocationServiceProps) => {
  // State to track if validation is in progress
  const [validating, setValidating] = useState(false);
  
  // Calculate distance if CAT coords and user location are available
  const handleConfirm = () => {
    setValidating(true);
    
    // Simulate validation delay
    setTimeout(() => {
      setValidating(false);
      confirmCheckIn();
    }, 1500);
  };
  
  return (
    <AlertDialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <MapPin className="mr-2 text-ms-primary-blue" size={18} />
            Confirmar Check-in
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está fazendo check-in no <span className="font-medium">{selectedCat}</span>. 
            {!validating ? (
              <div className="mt-3">
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle2 size={16} className="mr-1" />
                  <span className="font-medium">Sua localização foi verificada</span>
                </div>
                {userLocation && (
                  <div className="mt-2 bg-blue-50 p-3 rounded text-sm flex items-start">
                    <MapPin className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-blue-800 font-medium mb-1">Coordenadas detectadas:</p>
                      <p className="text-blue-600">Latitude: {userLocation.lat.toFixed(6)}</p>
                      <p className="text-blue-600">Longitude: {userLocation.lng.toFixed(6)}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue"></div>
                <span className="ml-2">Validando localização...</span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={validating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={validating || !userLocation}
            className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
          >
            {validating ? 'Processando...' : 'Confirmar Check-in'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GeoLocationService;
