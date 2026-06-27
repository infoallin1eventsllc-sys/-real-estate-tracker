# RE racker — Real- Estate- tracker

A full-stack real estate management tool for agents and investors.

## Features

- **Dashboard** — dual KPI panels for agent commission and investor portfolio
- **Deal Pipeline** — kanban-style view across 6 deal stages with commission tracking
- **Properties** — searchable property listing with status filters
- **Clients** — buyer/seller CRM with deal history drilldown
- **Investment Portfolio** — cap rate, NOI, and equity analytics per property
- **Financial Summary** — YTD commission earned vs projected, plus portfolio returns
- **AI Listing Writer** — generates professional property descriptions via Google Gemini

## Tech Stack

- **Frontend**: React 19, TypeScript 5.5, Vite 6, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend**: Express 4, Node.js (TypeScript via tsx)
- **AI**: Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Testing**: Vitest

## Getting Started

```bash
npm install

# Copy and fill in your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run frontend + backend together
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the Express server at `http://localhost:3001`.

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key (required for AI Listing Writer) |
| `PORT` | Express server port (default: `3001`) |

## Running Tests

```bash
npm test
```
