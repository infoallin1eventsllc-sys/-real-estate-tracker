import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function dataFile(name: string) {
  return join(DATA_DIR, `${name}.json`);
}

function readData<T>(name: string, fallback: T[]): T[] {
  const file = dataFile(name);
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, 'utf-8')) as T[];
  } catch {
    return fallback;
  }
}

function writeData<T>(name: string, data: T[]): void {
  writeFileSync(dataFile(name), JSON.stringify(data, null, 2), 'utf-8');
}

const app = express();
app.use(cors());
app.use(express.json());

for (const resource of ['properties', 'deals', 'clients', 'investments']) {
  app.get(`/api/${resource}`, (_req, res) => {
    res.json(readData(resource, []));
  });

  app.post(`/api/${resource}`, (req, res) => {
    const items = readData(resource, []);
    const newItem = { id: `${resource}-${Date.now()}`, ...(req.body as object) };
    items.unshift(newItem);
    writeData(resource, items);
    res.status(201).json(newItem);
  });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

interface DescribeBody {
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  type: string;
  neighborhood: string;
  features: string[];
}

app.post('/api/ai/describe', async (req, res) => {
  const { beds, baths, sqft, price, type, neighborhood, features } = req.body as DescribeBody;

  if (!process.env.GEMINI_API_KEY) {
    res.status(400).json({ error: 'GEMINI_API_KEY is not set on the server' });
    return;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Write a compelling real estate listing description for a ${beds}-bedroom, \
${baths}-bathroom ${type.toLowerCase()} in ${neighborhood}.
Details: ${sqft.toLocaleString()} sq ft, listed at $${price.toLocaleString()}.
Key features: ${features.join(', ')}.
Write 3 concise paragraphs. Be enthusiastic but professional. Focus on lifestyle and value. No markdown.`;

    const result = await model.generateContent(prompt);
    res.json({ description: result.response.text() });
  } catch {
    res.status(500).json({ error: 'AI generation failed — check your GEMINI_API_KEY' });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
