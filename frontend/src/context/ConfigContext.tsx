import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '@/services/api';
import { io } from 'socket.io-client';
import { VITE_SOCKET_URL } from '@/config/env';

interface PlatformConfig {
  maintenanceMode: {
    enabled: boolean;
    message: string;
  };
  announcement: {
    enabled: boolean;
    message: string;
    type: 'info' | 'warning' | 'critical';
    target: 'owners' | 'customers' | 'both';
  };
  features: {
    aiChatEnabled: boolean;
    loyaltySystemEnabled: boolean;
    globalMaxTables: number;
  };
  platformInfo: {
    supportEmail: string;
    version: string;
  };
}

interface ConfigContextType {
  config: PlatformConfig | null;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const response = await API.public.getConfig();
      setConfig(response.data.data);
    } catch (err) {
      console.error('Failed to fetch platform config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    // Initialize socket connection for real-time mesh updates
    const socket = io(VITE_SOCKET_URL);
    
    socket.on('PLATFORM_CONFIG_UPDATED', (newConfig) => {
      console.log('Real-time config update received:', newConfig);
      setConfig(newConfig);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, refreshConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
