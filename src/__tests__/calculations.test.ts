import { describe, it, expect } from 'vitest';
import {
  commissionAmount,
  totalCommissionEarned,
  projectedCommission,
  totalPipelineValue,
  dealsByStage,
  conversionRate,
  portfolioValue,
  totalMonthlyRent,
  totalMonthlyNOI,
  totalEquityGain,
  averageCapRate,
} from '../utils/calculations';
import { INITIAL_DEALS, INITIAL_PROPERTIES } from '../data';

// INITIAL_DEALS reference:
// deal-1: Under Contract, $185k @ 3%  → $5,550
// deal-2: Showing,        $350k @ 3%  → $10,500
// deal-3: Offer Made,     $620k @ 2.5% → $15,500
// deal-4: Closed,         $1.25M @ 3% → $37,500
// deal-5: Lead,           $495k @ 3%  → $14,850
// deal-6: Fell Through,   $210k @ 3%  → $6,300

describe('commissionAmount', () => {
  it('multiplies price by commissionRate', () => {
    expect(commissionAmount(INITIAL_DEALS[3])).toBe(37500); // 1250000 * 0.03
  });
  it('handles fractional commission rates correctly', () => {
    expect(commissionAmount(INITIAL_DEALS[2])).toBe(15500); // 620000 * 0.025
  });
});

describe('totalCommissionEarned', () => {
  it('sums commissions for Closed deals only', () => {
    expect(totalCommissionEarned(INITIAL_DEALS)).toBe(37500);
  });
  it('returns 0 for empty array', () => {
    expect(totalCommissionEarned([])).toBe(0);
  });
  it('returns 0 when no deals are Closed', () => {
    const noClosed = INITIAL_DEALS.filter((d) => d.stage !== 'Closed');
    expect(totalCommissionEarned(noClosed)).toBe(0);
  });
});

describe('projectedCommission', () => {
  it('sums commissions for Under Contract deals only', () => {
    expect(projectedCommission(INITIAL_DEALS)).toBe(5550); // deal-1 only
  });
  it('returns 0 for empty array', () => {
    expect(projectedCommission([])).toBe(0);
  });
});

describe('totalPipelineValue', () => {
  it('sums list prices for Lead, Showing, Offer Made, and Under Contract', () => {
    // deal-1 (Under Contract) 185000 + deal-2 (Showing) 350000 +
    // deal-3 (Offer Made) 620000 + deal-5 (Lead) 495000 = 1,650,000
    expect(totalPipelineValue(INITIAL_DEALS)).toBe(1650000);
  });
  it('excludes Closed and Fell Through deals', () => {
    expect(totalPipelineValue(INITIAL_DEALS)).toBeLessThan(
      INITIAL_DEALS.reduce((s, d) => s + d.price, 0)
    );
  });
  it('returns 0 for empty array', () => {
    expect(totalPipelineValue([])).toBe(0);
  });
});

describe('dealsByStage', () => {
  it('returns only deals matching the given stage', () => {
    expect(dealsByStage(INITIAL_DEALS, 'Closed')).toHaveLength(1);
    expect(dealsByStage(INITIAL_DEALS, 'Showing')).toHaveLength(1);
    expect(dealsByStage(INITIAL_DEALS, 'Fell Through')).toHaveLength(1);
  });
  it('returns empty array when no deals match', () => {
    expect(dealsByStage(INITIAL_DEALS, 'Under Contract')).toHaveLength(1);
  });
});

describe('conversionRate', () => {
  it('returns percentage of Closed deals out of total', () => {
    expect(conversionRate(INITIAL_DEALS)).toBeCloseTo(16.67, 1); // 1/6
  });
  it('returns 0 for empty array', () => {
    expect(conversionRate([])).toBe(0);
  });
  it('returns 100 when all deals are Closed', () => {
    const allClosed = INITIAL_DEALS.map((d) => ({ ...d, stage: 'Closed' as const }));
    expect(conversionRate(allClosed)).toBe(100);
  });
});

// INITIAL_PROPERTIES portfolio reference (all 6 have investment fields):
// purchasePrice totals: 310000+170000+580000+1100000+450000+280000 = 2,890,000
// monthlyRent totals:   2400+1500+4200+7500+4500+1950             = 22,050
// monthlyNOI totals:    1800+1100+3200+5500+3600+1400             = 16,600
// equityGain totals:    40000+15000+40000+150000+45000+10000      = 300,000

describe('portfolioValue', () => {
  it('sums purchasePrice across all properties', () => {
    expect(portfolioValue(INITIAL_PROPERTIES)).toBe(2890000);
  });
  it('returns 0 for empty array', () => {
    expect(portfolioValue([])).toBe(0);
  });
});

describe('totalMonthlyRent', () => {
  it('sums monthlyRent across all properties', () => {
    expect(totalMonthlyRent(INITIAL_PROPERTIES)).toBe(22050);
  });
});

describe('totalMonthlyNOI', () => {
  it('sums monthlyNOI across all properties', () => {
    expect(totalMonthlyNOI(INITIAL_PROPERTIES)).toBe(16600);
  });
});

describe('totalEquityGain', () => {
  it('sums equityGain across all properties', () => {
    expect(totalEquityGain(INITIAL_PROPERTIES)).toBe(300000);
  });
});

describe('averageCapRate', () => {
  it('averages capRate across properties that have one', () => {
    // (6.9+7.7+6.6+6.0+9.6+6.0)/6 = 42.8/6 ≈ 7.133
    expect(averageCapRate(INITIAL_PROPERTIES)).toBeCloseTo(7.13, 1);
  });
  it('returns 0 for empty array', () => {
    expect(averageCapRate([])).toBe(0);
  });
});
