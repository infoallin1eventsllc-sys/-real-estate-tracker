import { useState } from 'react';
import type { PropertyType } from '../types';

export interface PropertyInput {
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  type: PropertyType;
  neighborhood: string;
  features: string[];
}

export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const generateDescription = async (input: PropertyInput) => {
    setIsGenerating(true);
    setError('');
    setResult('');
    try {
      const response = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error: string };
        setError(data.error ?? 'Request failed');
        return;
      }
      const data = (await response.json()) as { description: string };
      setResult(data.description);
    } catch {
      setError('Network error — is the server running? (npm run dev:server)');
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, result, error, generateDescription };
}
