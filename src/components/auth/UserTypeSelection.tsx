
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface UserTypeSelectionProps {
  userType: string;
  setUserType: (value: string) => void;
  disabled?: boolean;
}

const UserTypeSelection = ({ userType, setUserType, disabled }: UserTypeSelectionProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Você é:</Label>
      
      <RadioGroup value={userType} onValueChange={setUserType} className="space-y-3" disabled={disabled}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="turista" id="turista" disabled={disabled} />
          <Label htmlFor="turista" className="text-sm cursor-pointer">Turista</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="morador" id="morador" disabled={disabled} />
          <Label htmlFor="morador" className="text-sm cursor-pointer">Morador</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default UserTypeSelection;
