import { Property, Deal, Client, FinancialEntry } from './types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'IL',
    price: 350000,
    beds: 3,
    baths: 2,
    sqft: 2200,
    type: 'Single Family',
    status: 'Active',
    features: ['Swimming Pool', 'Fireplace', 'Renovated Kitchen', 'Attached Garage'],
    monthlyRent: 2400,
    monthlyNOI: 1800,
    purchasePrice: 310000,
    capRate: 6.9,
    equityGain: 40000,
    notes: 'Primary active listing. Great family neighborhood near elementary school.'
  },
  {
    id: 'prop-2',
    address: '104 Maple Street',
    city: 'Springfield',
    state: 'IL',
    price: 185000,
    beds: 2,
    baths: 1.5,
    sqft: 1100,
    type: 'Townhouse',
    status: 'Under Contract',
    features: ['Hardwood Floors', 'Private Deck', 'Low HOA'],
    monthlyRent: 1500,
    monthlyNOI: 1100,
    purchasePrice: 170000,
    capRate: 7.7,
    equityGain: 15000,
    notes: 'Deal currently pending close. Excellent rental yield history.'
  },
  {
    id: 'prop-3',
    address: '502 Alpine Ridge Dr',
    city: 'Oak Ridge',
    state: 'TN',
    price: 620000,
    beds: 4,
    baths: 3.5,
    sqft: 3400,
    type: 'Single Family',
    status: 'Active',
    features: ['Mountain Views', '3-Car Garage', 'Gourmet Kitchen', 'Smart Home Tech', 'Finished Basement'],
    monthlyRent: 4200,
    monthlyNOI: 3200,
    purchasePrice: 580000,
    capRate: 6.6,
    equityGain: 40000,
    notes: 'High-end listing attracting out-of-state buyers relocating.'
  },
  {
    id: 'prop-4',
    address: '88 Pinecrest Ave',
    city: 'Springfield',
    state: 'IL',
    price: 1250000,
    beds: 5,
    baths: 4.5,
    sqft: 5200,
    type: 'Single Family',
    status: 'Closed',
    features: ['Wine Cellar', 'Infinity Pool', 'Home Theater', 'Woodland Lot'],
    monthlyRent: 7500,
    monthlyNOI: 5500,
    purchasePrice: 1100000,
    capRate: 6.0,
    equityGain: 150000,
    notes: 'Closed last month. Agent represented seller.'
  },
  {
    id: 'prop-5',
    address: '1204 Triplex Way',
    city: 'Springfield',
    state: 'IL',
    price: 495000,
    beds: 6,
    baths: 3,
    sqft: 3600,
    type: 'Multi Family',
    status: 'Active',
    features: ['Fully Leased', 'Separate Utilities', 'Recent Roof Upgrade', 'Off-Street Parking'],
    monthlyRent: 4500,
    monthlyNOI: 3600,
    purchasePrice: 450000,
    capRate: 9.6,
    equityGain: 45000,
    notes: 'Cash-flowing multi-family unit. Managed directly.'
  },
  {
    id: 'prop-6',
    address: '303 City Plaza Blvd #401',
    city: 'Springfield',
    state: 'IL',
    price: 290000,
    beds: 1,
    baths: 1,
    sqft: 850,
    type: 'Condo',
    status: 'Off Market',
    features: ['Concierge', 'Fitness Center', 'Rooftop Terrace', 'Walkable Location'],
    monthlyRent: 1950,
    monthlyNOI: 1400,
    purchasePrice: 280000,
    capRate: 6.0,
    equityGain: 10000,
    notes: 'Great hands-off condo. Currently leased to long-term tenant.'
  }
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal-1',
    clientName: 'Alice Smith',
    propertyAddress: '104 Maple Street',
    stage: 'Under Contract',
    price: 185000,
    commissionRate: 0.03,
    projectedCommission: 5550,
    date: '2026-06-15',
    type: 'Buyer'
  },
  {
    id: 'deal-2',
    clientName: 'Bob Jones',
    propertyAddress: '742 Evergreen Terrace',
    stage: 'Showing',
    price: 350000,
    commissionRate: 0.03,
    projectedCommission: 10500,
    date: '2026-06-20',
    type: 'Seller'
  },
  {
    id: 'deal-3',
    clientName: 'Clara Davis',
    propertyAddress: '502 Alpine Ridge Dr',
    stage: 'Offer Made',
    price: 620000,
    commissionRate: 0.025,
    projectedCommission: 15500,
    date: '2026-06-22',
    type: 'Buyer'
  },
  {
    id: 'deal-4',
    clientName: 'Daniel Vance',
    propertyAddress: '88 Pinecrest Ave',
    stage: 'Closed',
    price: 1250000,
    commissionRate: 0.03,
    projectedCommission: 37500,
    date: '2026-05-30',
    type: 'Seller'
  },
  {
    id: 'deal-5',
    clientName: 'Evan Wright',
    propertyAddress: '1204 Triplex Way',
    stage: 'Lead',
    price: 495000,
    commissionRate: 0.03,
    projectedCommission: 14850,
    date: '2026-06-24',
    type: 'Buyer'
  },
  {
    id: 'deal-6',
    clientName: 'Fiona Gallagher',
    propertyAddress: '220 Elm St',
    stage: 'Fell Through',
    price: 210000,
    commissionRate: 0.03,
    projectedCommission: 6300,
    date: '2026-05-10',
    type: 'Buyer'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Alice Smith',
    role: 'Buyer',
    email: 'alice.smith@example.com',
    phone: '(555) 123-4567',
    budget: 200000,
    notes: 'First-time home buyer looking for a nice townhouse or condo in Springfield. Prefers modern kitchen, low HOA fees, and close proximity to transit. Pre-approved for up to $220k.',
    creditScore: 765,
    creditStatus: 'Excellent',
    creditRepairHistory: [],
    creditRepairItems: []
  },
  {
    id: 'client-2',
    name: 'Bob Jones',
    role: 'Seller',
    email: 'bob.jones@example.com',
    phone: '(555) 234-5678',
    budget: 350000,
    notes: 'Selling family home to downsize to an active adult community. Wants a clean, prompt sale. Willing to offer up to $5k in concession credits for quick closing.',
    creditStatus: 'Unchecked'
  },
  {
    id: 'client-3',
    name: 'Clara Davis',
    role: 'Buyer',
    email: 'clara.davis@example.com',
    phone: '(555) 345-6789',
    budget: 650000,
    notes: 'Relocating from California for a new role. High priority on beautiful mountain/ridge views or a spacious wooded backyard. Prefers smart home integrations and garage storage.',
    creditScore: 710,
    creditStatus: 'Good',
    creditRepairHistory: [],
    creditRepairItems: []
  },
  {
    id: 'client-4',
    name: 'Daniel Vance',
    role: 'Seller',
    email: 'daniel.vance@example.com',
    phone: '(555) 456-7890',
    budget: 1300000,
    notes: 'Luxury property developer. High expectations for premium listings, digital staging, and AI listing descriptions. Prefers text-only communications during trading hours.',
    creditStatus: 'Unchecked'
  },
  {
    id: 'client-5',
    name: 'Evan Wright',
    role: 'Both',
    email: 'evan.wright@example.com',
    phone: '(555) 567-8901',
    budget: 500000,
    notes: 'Local investor targeting multi-family residential models. Wants to build a cash-flowing Springfield portfolio. Highly analytical, relies heavily on Cap Rate and NOI numbers.',
    creditScore: 790,
    creditStatus: 'Excellent',
    creditRepairHistory: [],
    creditRepairItems: []
  },
  {
    id: 'client-6',
    name: 'Fiona Gallagher',
    role: 'Buyer',
    email: 'fiona.g@example.com',
    phone: '(555) 678-9012',
    budget: 250000,
    notes: 'Looking for distressed assets and fixer-upper opportunities. Had a deal fall through due to a major sewer inspection issue, but is still motivated and actively looking.',
    creditScore: 580,
    creditStatus: 'In Credit Repair',
    creditRepairHistory: [
      {
        id: 'hist-1',
        date: '2026-06-01',
        score: 550,
        action: 'Dispute letters drafted and mailed to TransUnion & Equifax.',
        notes: 'Disputing invalid medical collection from Apex Recovery Services.'
      },
      {
        id: 'hist-2',
        date: '2026-06-18',
        score: 580,
        action: 'Equifax removed late fee record.',
        notes: 'Credit score increased from 550 to 580. Waiting on medical bill dispute response.'
      }
    ],
    creditRepairItems: [
      {
        id: 'item-1',
        creditor: 'Apex Recovery (Medical)',
        amount: 1200,
        type: 'Collection',
        status: 'Disputed',
        notes: 'Medical insurance already covered this; hospital billed in error.'
      },
      {
        id: 'item-2',
        creditor: 'Capital One Card',
        amount: 45,
        type: 'Late Payment',
        status: 'Deleted/Resolved',
        notes: 'One-time 30-day late payment waived via goodwill letter.'
      }
    ]
  }
];

export const FINANCIAL_HISTORY: FinancialEntry[] = [
  {
    month: 'Jan',
    commissionEarned: 12500,
    projectedIncome: 8000,
    rentalIncome: 8850,
    noi: 6700
  },
  {
    month: 'Feb',
    commissionEarned: 18000,
    projectedIncome: 15000,
    rentalIncome: 8850,
    noi: 6700
  },
  {
    month: 'Mar',
    commissionEarned: 9500,
    projectedIncome: 12000,
    rentalIncome: 9200,
    noi: 7100
  },
  {
    month: 'Apr',
    commissionEarned: 22400,
    projectedIncome: 18500,
    rentalIncome: 10350,
    noi: 8100
  },
  {
    month: 'May',
    commissionEarned: 37500,
    projectedIncome: 24000,
    rentalIncome: 10350,
    noi: 8100
  },
  {
    month: 'Jun',
    commissionEarned: 15500,
    projectedIncome: 30900,
    rentalIncome: 14600,
    noi: 11100
  }
];
