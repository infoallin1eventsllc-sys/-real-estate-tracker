import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RealEstateProvider } from './context/RealEstateContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import Properties from './components/Properties';
import Clients from './components/Clients';
import Investments from './components/Investments';
import Financials from './components/Financials';
import AIWriter from './components/AIWriter';
import type { View } from './types';

function ViewRouter({ view }: { view: View }) {
  switch (view) {
    case 'dashboard':  return <Dashboard />;
    case 'pipeline':   return <Pipeline />;
    case 'properties': return <Properties />;
    case 'clients':    return <Clients />;
    case 'investments': return <Investments />;
    case 'financials': return <Financials />;
    case 'ai':         return <AIWriter />;
  }
}

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <RealEstateProvider>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar current={view} onChange={setView} />
        <AnimatePresence mode="wait">
          <motion.main
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-auto"
          >
            <ViewRouter view={view} />
          </motion.main>
        </AnimatePresence>
      </div>
    </RealEstateProvider>
  );
}
