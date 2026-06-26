import { describe, it, expect } from 'vitest';
import {
  commissionAmount,
  totalCommissionEarned,
  projectedCommission,
  totalPipelineValue,
  dealsByStage,
  conversionRate,
  calcMonthlyExpenses,
  calcMonthlyNOI,
  calcCapRate,
  calcEquity,
  portfolioValue,
  totalMonthlyRent,
  totalMonthlyNOI,
  totalEquityGain,
} from '../utils/calculations';
import { DEALS, INVESTMENTS } from '../data/seed';

describe('commissionAmount', () => {
  it('uses salePrice when available', () => {
    expect(commissionAmount(DEALS[0])).toBe(30000); // 1200000 * 0.025
  });
  it('falls back to offerPrice when no salePrice', () => {
    expect(commissionAmount(DEALS[1])).toBe(17950); // 718000 * 0.025
  });
  it('falls back to listPrice when no offer price', () => {
    expect(commissionAmount(DEALS[4])).toBe(7875); // 315000 * 0.025
  });
});

describe('totalCommissionEarned', () => {
  it('sums commissions for Closed deals only', () => {
    expect(totalCommissionEarned(DEALS)).toBe(30000);
  });
  it('returns 0 for empty array', () => {
    expect(totalCommissionEarned([])).toBe(0);
  });
});

describe('projectedCommission', () => {
  it('sums commissions for Under Contract deals only', () => {
    expect(projectedCommission(DEALS)).toBe(17950); // 718000 * 0.025
  });
  it('returns 0 for empty array', () => {
    expect(projectedCommission([])).toBe(0);
  });
});

describe('totalPipelineValue', () => {
  it('sums list prices for active pipeline stages', () => {
    // dl2 Under Contract 725000 + dl3 Offer Made 420000 + dl4 Showing 485000 + dl5 Lead 315000
    expect(totalPipelineValue(DEALS)).toBe(1945000);
  });
  it('excludes Closed deals', () => {
    const allListPrices = DEALS.reduce((s, d) => s + d.listPrice, 0);
    expect(totalPipelineValue(DEALS)).toBeLessThan(allListPrices);
  });
});

describe('dealsByStage', () => {
  it('returns only deals matching the given stage', () => {
    expect(dealsByStage(DEALS, 'Closed').length).toBe(1);
    expect(dealsByStage(DEALS, 'Lead').length).toBe(1);
    expect(dealsByStage(DEALS, 'Fell Through').length).toBe(0);
  });
});

describe('conversionRate', () => {
  it('returns percentage of closed deals', () => {
    expect(conversionRate(DEALS)).toBe(20); // 1 of 5
  });
  it('returns 0 for empty array', () => {
    expect(conversionRate([])).toBe(0);
  });
});

describe('calcMonthlyExpenses', () => {
  it('sums mortgage, taxes, insurance, maintenance, and management fee', () => {
    // 1100 + 250 + 100 + 150 + (2200 * 0.05 = 110) = 1710
    expect(calcMonthlyExpenses(INVESTMENTS[0])).toBe(1710);
  });
});

describe('calcMonthlyNOI', () => {
  it('returns rent minus total expenses', () => {
    expect(calcMonthlyNOI(INVESTMENTS[0])).toBe(490);  // 2200 - 1710
    expect(calcMonthlyNOI(INVESTMENTS[1])).toBe(630);  // 3400 - 2770
    expect(calcMonthlyNOI(INVESTMENTS[2])).toBe(540);  // 5200 - 4660
  });
});

describe('calcCapRate', () => {
  it('annualizes NOI and divides by current value', () => {
    expect(calcCapRate(INVESTMENTS[0])).toBeCloseTo(1.729, 2);
  });
});

describe('calcEquity', () => {
  it('returns current value minus purchase price', () => {
    expect(calcEquity(INVESTMENTS[0])).toBe(55000);  // 340000 - 285000
    expect(calcEquity(INVESTMENTS[1])).toBe(90000);  // 510000 - 420000
    expect(calcEquity(INVESTMENTS[2])).toBe(70000);  // 720000 - 650000
  });
});

describe('portfolioValue', () => {
  it('sums current values of all investment properties', () => {
    expect(portfolioValue(INVESTMENTS)).toBe(1570000);
  });
  it('returns 0 for empty array', () => {
    expect(portfolioValue([])).toBe(0);
  });
});

describe('totalMonthlyRent', () => {
  it('sums monthly rent across all properties', () => {
    expect(totalMonthlyRent(INVESTMENTS)).toBe(10800); // 2200+3400+5200
  });
});

describe('totalMonthlyNOI', () => {
  it('sums monthly NOI across all properties', () => {
    expect(totalMonthlyNOI(INVESTMENTS)).toBe(1660); // 490+630+540
  });
});

describe('totalEquityGain', () => {
  it('sums equity gain across all investment properties', () => {
    expect(totalEquityGain(INVESTMENTS)).toBe(215000); // 55000+90000+70000
  });
});
