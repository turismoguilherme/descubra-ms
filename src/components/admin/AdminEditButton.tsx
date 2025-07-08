
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useSecureAuth } from "@/hooks/useSecureAuth";

interface AdminEditButtonProps {
  editPath: string;
  label?: string;
}

const AdminEditButton = ({ editPath, label = "Editar" }: AdminEditButtonProps) => {
  const { isManager } = useSecureAuth();

  if (!isManager) {
    return null;
  }

  return (
    <Button asChild variant="outline" className="border-ms-primary-blue text-ms-primary-blue hover:bg-ms-primary-blue hover:text-white">
      <Link to={editPath}>
        <Edit size={16} className="mr-2" />
        {label}
      </Link>
    </Button>
  );
};

export default AdminEditButton;
