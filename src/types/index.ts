export type DealStage =
  | 'Lead'
  | 'Showing'
  | 'Offer Made'
  | 'Under Contract'
  | 'Closed'
  | 'Fell Through';

export type PropertyStatus =
  | 'Active'
  | 'Under Contract'
  | 'Closed'
  | 'Off-Market'
  | 'Coming Soon';

export type ClientType = 'Buyer' | 'Seller' | 'Both';
export type PropertyType = 'Single Family' | 'Multi-Family' | 'Condo' | 'Commercial' | 'Land';
export type OccupancyStatus = 'Occupied' | 'Vacant' | 'Renovation';

export type View =
  | 'dashboard'
  | 'pipeline'
  | 'properties'
  | 'clients'
  | 'investments'
  | 'financials'
  | 'ai';

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: PropertyType;
  status: PropertyStatus;
  listDate: string;
  closedDate?: string;
  notes: string;
  clientId: string;
  features: string[];
  neighborhood: string;
}

export interface Deal {
  id: string;
  propertyId: string;
  clientId: string;
  stage: DealStage;
  listPrice: number;
  offerPrice?: number;
  salePrice?: number;
  commissionRate: number;
  showingDate?: string;
  offerDate?: string;
  contractDate?: string;
  closingDate?: string;
  notes: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: ClientType;
  budget?: number;
  preApproved?: boolean;
  notes: string;
  createdAt: string;
}

export interface InvestmentProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  type: PropertyType;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  monthlyRent: number;
  occupancyStatus: OccupancyStatus;
  tenantName?: string;
  leaseEnd?: string;
  mortgagePayment: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  managementFeeRate: number;
}
