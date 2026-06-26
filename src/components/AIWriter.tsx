import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import type { PropertyType } from '../types';

const PROPERTY_TYPES: PropertyType[] = [
  'Single Family',
  'Condo',
  'Multi-Family',
  'Commercial',
  'Land',
];

const FEATURE_OPTIONS = [
  'Pool',
  'Garage',
  'Backyard',
  'City Views',
  'Bay Views',
  'Updated Kitchen',
  'Hardwood Floors',
  'In-Unit Laundry',
  'Smart Home',
  'Rooftop Deck',
  'Home Theater',
  'Guest House',
  'Corner Unit',
  'Natural Light',
];

export default function AIWriter() {
  const { isGenerating, result, error, generateDescription } = useAI();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    beds: 3,
    baths: 2,
    sqft: 1500,
    price: 500000,
    type: 'Single Family' as PropertyType,
    neighborhood: '',
    features: [] as string[],
  });

  const toggleFeature = (f: string) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...prev.features, f],
    }));

  const handleCopy = () => {
    void navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={22} className="text-blue-500" />
          AI Listing Writer
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate a professional property description in seconds using Gemini AI.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['beds', 'baths', 'sqft', 'price'] as const).map((field) => (
            <label key={field} className="block">
              <span className="text-xs font-medium text-gray-600 capitalize">
                {field === 'sqft' ? 'Sq Ft' : field === 'price' ? 'List Price' : field}
              </span>
              <input
                type="number"
                value={form[field]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }))
                }
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Property Type</span>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, type: e.target.value as PropertyType }))
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Neighborhood</span>
            <input
              type="text"
              placeholder="e.g. Russian Hill"
              value={form.neighborhood}
              onChange={(e) => setForm((prev) => ({ ...prev, neighborhood: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Key Features</p>
          <div className="flex flex-wrap gap-2">
            {FEATURE_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFeature(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  form.features.includes(f)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => void generateDescription(form)}
          disabled={isGenerating || !form.neighborhood.trim()}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          {isGenerating ? 'Generating…' : 'Generate Description'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">Generated Description</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              {copied ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
