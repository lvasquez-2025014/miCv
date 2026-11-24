import { useMemo } from 'react';
import { getPortfolioSnapshot } from '../services/portfolioProvider';

export function usePortfolio(overrideConfig) {
  return useMemo(() => getPortfolioSnapshot(overrideConfig), [overrideConfig]);
}

