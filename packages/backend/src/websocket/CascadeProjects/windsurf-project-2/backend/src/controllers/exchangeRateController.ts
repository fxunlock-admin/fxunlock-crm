import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Cache for exchange rates with timestamp
let cachedRates: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fallback rates in case API fails
const FALLBACK_RATES = {
  GBP: 1.31,
  USD: 1.0,
  EUR: 1.16,
  AED: 0.27,
};

export const getExchangeRates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = Date.now();

    // Return cached rates if still valid
    if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
      res.json(cachedRates);
      return;
    }

    // Try to fetch from API
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json() as any;
      
      // Extract rates for our currencies
      // API returns how much of each currency = 1 USD, but we need the inverse (how much USD = 1 of each currency)
      const rates = {
        GBP: data?.rates?.GBP ? 1 / data.rates.GBP : FALLBACK_RATES.GBP,
        USD: 1.0,
        EUR: data?.rates?.EUR ? 1 / data.rates.EUR : FALLBACK_RATES.EUR,
        AED: data?.rates?.AED ? 1 / data.rates.AED : FALLBACK_RATES.AED,
      };

      // Cache the rates
      cachedRates = rates;
      cacheTimestamp = now;

      res.json(rates);
    } catch (apiError) {
      console.warn('Failed to fetch live exchange rates, using fallback rates:', apiError);
      
      // Use fallback rates if API fails
      cachedRates = FALLBACK_RATES;
      cacheTimestamp = now;
      
      res.json(FALLBACK_RATES);
    }
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
};
