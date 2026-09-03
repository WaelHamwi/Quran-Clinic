import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MushafContextValue {
  selectedReciterId: number | null;
  setSelectedReciterId: (id: number | null) => void;
  isContextReady: boolean;
}

const MushafContext = createContext<MushafContextValue | null>(null);

export function MushafProvider({ children }: { children: React.ReactNode }) {
  const [selectedReciterId, setSelectedReciterId] = useState<number | null>(null);
  const [isContextReady, setIsContextReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('mushaf_reciter_id')
      .then((value: string | null) => {
        if (value) setSelectedReciterId(Number(value));
      })
      .finally(() => setIsContextReady(true));
  }, []);

  const handleSetReciterId = (id: number | null) => {
    setSelectedReciterId(id);
    if (id === null) {
      AsyncStorage.removeItem('mushaf_reciter_id');
    } else {
      AsyncStorage.setItem('mushaf_reciter_id', String(id));
    }
  };

  return (
    <MushafContext.Provider
      value={{
        selectedReciterId,
        setSelectedReciterId: handleSetReciterId,
        isContextReady,
      }}
    >
      {children}
    </MushafContext.Provider>
  );
}

export function useMushafContext(): MushafContextValue {
  const ctx = useContext(MushafContext);
  if (!ctx) throw new Error('useMushafContext must be used within MushafProvider');
  return ctx;
}
