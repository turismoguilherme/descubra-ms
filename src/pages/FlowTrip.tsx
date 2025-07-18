
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FlowTrip = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a nova landing page SaaS
    navigate('/flowtrip-saas', { replace: true });
  }, [navigate]);

  return null;
};

export default FlowTrip;
