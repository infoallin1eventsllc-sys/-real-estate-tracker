import type { Deal, InvestmentProperty } from '../types';

export function commissionAmount(deal: Deal): number {
  const base = deal.salePrice ?? deal.offerPrice ?? deal.listPrice;
  return base * (deal.commissionRate / 100);
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
    .reduce((sum, d) => sum + d.listPrice, 0);
}

export function dealsByStage(deals: Deal[], stage: Deal['stage']): Deal[] {
  return deals.filter((d) => d.stage === stage);
}

export function conversionRate(deals: Deal[]): number {
  if (deals.length === 0) return 0;
  return (deals.filter((d) => d.stage === 'Closed').length / deals.length) * 100;
}

export function calcMonthlyExpenses(inv: InvestmentProperty): number {
  const mgmtFee = inv.monthlyRent * (inv.managementFeeRate / 100);
  return (
    inv.mortgagePayment +
    inv.monthlyTaxes +
    inv.monthlyInsurance +
    inv.monthlyMaintenance +
    mgmtFee
  );
}

export function calcMonthlyNOI(inv: InvestmentProperty): number {
  return inv.monthlyRent - calcMonthlyExpenses(inv);
}

export function calcCapRate(inv: InvestmentProperty): number {
  return ((calcMonthlyNOI(inv) * 12) / inv.currentValue) * 100;
}

export function calcEquity(inv: InvestmentProperty): number {
  return inv.currentValue - inv.purchasePrice;
}

export function portfolioValue(investments: InvestmentProperty[]): number {
  return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
}

export function totalMonthlyRent(investments: InvestmentProperty[]): number {
  return investments.reduce((sum, inv) => sum + inv.monthlyRent, 0);
}

export function totalMonthlyNOI(investments: InvestmentProperty[]): number {
  return investments.reduce((sum, inv) => sum + calcMonthlyNOI(inv), 0);
}

export function totalEquityGain(investments: InvestmentProperty[]): number {
  return investments.reduce((sum, inv) => sum + calcEquity(inv), 0);
}
