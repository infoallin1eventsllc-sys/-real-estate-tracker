import type { Deal, Property } from '../types';

// --- Deal / Commission ---

export function commissionAmount(deal: Deal): number {
  return deal.price * deal.commissionRate;
}

export function totalCommissionEarned(deals: Deal[]): number {
  return deals
    .filter((d) => d.stage === 'Closed')
    .reduce((sum, d) => sum + commissionAmount(d), 0);
}

export function projectedCommission(deals: Deal[]): number {
  return deals
    .filter((d) => d.stage === 'Under Contract')
    .reduce((sum, d) => sum + commissionAmount(d), 0);
}

export function totalPipelineValue(deals: Deal[]): number {
  const active: Deal['stage'][] = ['Lead', 'Showing', 'Offer Made', 'Under Contract'];
  return deals
    .filter((d) => active.includes(d.stage))
    .reduce((sum, d) => sum + d.price, 0);
}

export function dealsByStage(deals: Deal[], stage: Deal['stage']): Deal[] {
  return deals.filter((d) => d.stage === stage);
}

export function conversionRate(deals: Deal[]): number {
  if (deals.length === 0) return 0;
  return (deals.filter((d) => d.stage === 'Closed').length / deals.length) * 100;
}

// --- Portfolio / Investment ---

export function portfolioValue(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + (p.purchasePrice ?? p.price), 0);
}

export function totalMonthlyRent(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + (p.monthlyRent ?? 0), 0);
}

export function totalMonthlyNOI(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + (p.monthlyNOI ?? 0), 0);
}

export function totalEquityGain(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + (p.equityGain ?? 0), 0);
}

export function averageCapRate(properties: Property[]): number {
  const props = properties.filter((p) => p.capRate !== undefined);
  if (props.length === 0) return 0;
  return props.reduce((sum, p) => sum + (p.capRate ?? 0), 0) / props.length;
}
