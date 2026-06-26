import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Client, Deal, InvestmentProperty, Property } from '../types';
import { CLIENTS, DEALS, INVESTMENTS, PROPERTIES } from '../data/seed';

interface RealEstateContextType {
  clients: Client[];
  properties: Property[];
  deals: Deal[];
  investments: InvestmentProperty[];
}

const RealEstateContext = createContext<RealEstateContextType | null>(null);

export function RealEstateProvider({ children }: { children: ReactNode }) {
  const [clients] = useState<Client[]>(CLIENTS);
  const [properties] = useState<Property[]>(PROPERTIES);
  const [deals] = useState<Deal[]>(DEALS);
  const [investments] = useState<InvestmentProperty[]>(INVESTMENTS);

  return (
    <RealEstateContext.Provider value={{ clients, properties, deals, investments }}>
      {children}
    </RealEstateContext.Provider>
  );
}

export function useRealEstate(): RealEstateContextType {
  const ctx = useContext(RealEstateContext);
  if (!ctx) throw new Error('useRealEstate must be used within RealEstateProvider');
  return ctx;
}
