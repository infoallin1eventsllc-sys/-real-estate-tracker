export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: 'Single Family' | 'Multi Family' | 'Condo' | 'Townhouse';
  status: 'Active' | 'Under Contract' | 'Closed' | 'Off Market';
  features: string[];
  monthlyRent?: number;
  monthlyNOI?: number;
  purchasePrice?: number;
  capRate?: number;
  equityGain?: number;
  notes?: string;
}

export interface Deal {
  id: string;
  clientName: string;
  propertyAddress: string;
  stage: 'Lead' | 'Showing' | 'Offer Made' | 'Under Contract' | 'Closed' | 'Fell Through';
  price: number;
  commissionRate: number; // e.g., 0.03 for 3%
  projectedCommission: number; // price * commissionRate
  date: string;
  type: 'Buyer' | 'Seller';
}

export interface Client {
  id: string;
  name: string;
  role: 'Buyer' | 'Seller' | 'Both';
  email: string;
  phone: string;
  budget: number;
  notes: string;
  creditScore?: number; // 300 - 850
  creditStatus?: 'Unchecked' | 'Excellent' | 'Good' | 'Fair' | 'Requires Repair' | 'In Credit Repair' | 'Repair Completed';
  creditRepairHistory?: Array<{
    id: string;
    date: string;
    score: number;
    action: string;
    notes?: string;
  }>;
  creditRepairItems?: Array<{
    id: string;
    creditor: string;
    amount: number;
    type: 'Collection' | 'Late Payment' | 'Charge Off' | 'Public Record' | 'Other';
    status: 'Disputed' | 'In Progress' | 'Deleted/Resolved' | 'Verified/Remained';
    notes?: string;
  }>;
}

export interface FinancialEntry {
  month: string;
  commissionEarned: number;
  projectedIncome: number;
  rentalIncome: number;
  noi: number;
}

export interface InvestmentProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  type: Property['type'];
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  monthlyRent: number;
  monthlyNOI: number;
  capRate: number;
  equityGain: number;
  occupancyStatus: 'Occupied' | 'Vacant' | 'Renovation';
  tenantName?: string;
  leaseEnd?: string;
  mortgagePayment: number;
  monthlyExpenses: number;
  notes?: string;
}
