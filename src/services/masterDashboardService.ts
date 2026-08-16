import { supabase } from "@/integrations/supabase/client";

export interface MasterConfigData {
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  maxUsers: number;
  enabledFeatures: string[];
}

export const getMasterConfig = async (): Promise<MasterConfigData> => {
  const { data, error } = await supabase
    .from('flowtrip_master_config')
    .select('*');
  
  if (error) throw error;
  
  // Transform config data to expected format
  const config: MasterConfigData = {
    appName: 'FlowTrip',
    primaryColor: '#1a365d',
    secondaryColor: '#38b2ac',
    logoUrl: '',
    maxUsers: 1000,
    enabledFeatures: ['tourism', 'events', 'routes']
  };
  
  return config;
};

export const updateMasterConfig = async (config: Partial<MasterConfigData>) => {
  // This would update the master configuration
  console.log('Updating master config:', config);
};