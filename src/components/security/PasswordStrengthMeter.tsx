import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
  weight: number;
}

const criteria: PasswordCriteria[] = [
  {
    label: "Pelo menos 8 caracteres",
    test: (p) => p.length >= 8,
    weight: 25
  },
  {
    label: "Contém letra maiúscula",
    test: (p) => /[A-Z]/.test(p),
    weight: 20
  },
  {
    label: "Contém letra minúscula",
    test: (p) => /[a-z]/.test(p),
    weight: 20
  },
  {
    label: "Contém número",
    test: (p) => /\d/.test(p),
    weight: 20
  },
  {
    label: "Contém caractere especial",
    test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
    weight: 15
  }
];

export const PasswordStrengthMeter = ({ password, className = "" }: PasswordStrengthMeterProps) => {
  const analysis = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        strength: "Muito fraca",
        color: "bg-red-500",
        passedCriteria: []
      };
    }

    const passedCriteria = criteria.filter(criterion => criterion.test(password));
    const score = passedCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);

    let strength: string;
    let color: string;

    if (score < 40) {
      strength = "Muito fraca";
      color = "bg-red-500";
    } else if (score < 60) {
      strength = "Fraca";
      color = "bg-orange-500";
    } else if (score < 80) {
      strength = "Média";
      color = "bg-yellow-500";
    } else if (score < 100) {
      strength = "Forte";
      color = "bg-blue-500";
    } else {
      strength = "Muito forte";
      color = "bg-green-500";
    }

    return {
      score,
      strength,
      color,
      passedCriteria
    };
  }, [password]);

  if (!password || password.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Força da senha:</span>
          <span className={`font-medium ${
            analysis.score < 40 ? 'text-red-600' :
            analysis.score < 60 ? 'text-orange-600' :
            analysis.score < 80 ? 'text-yellow-600' :
            analysis.score < 100 ? 'text-blue-600' :
            'text-green-600'
          }`}>
            {analysis.strength}
          </span>
        </div>
        <Progress 
          value={analysis.score} 
          className="h-2"
        />
      </div>

      <div className="space-y-1">
        {criteria.map((criterion, index) => {
          const passed = analysis.passedCriteria.includes(criterion);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {passed ? (
                <Check size={14} className="text-green-600 flex-shrink-0" />
              ) : (
                <X size={14} className="text-red-500 flex-shrink-0" />
              )}
              <span className={passed ? "text-green-700" : "text-gray-600"}>
                {criterion.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;