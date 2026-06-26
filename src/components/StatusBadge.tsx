import type { DealStage, PropertyStatus, OccupancyStatus } from '../types';

type AnyStatus = DealStage | PropertyStatus | OccupancyStatus;

const COLOR: Record<AnyStatus, string> = {
  Lead: 'bg-gray-100 text-gray-700',
  Showing: 'bg-blue-100 text-blue-700',
  'Offer Made': 'bg-violet-100 text-violet-700',
  'Under Contract': 'bg-amber-100 text-amber-700',
  Closed: 'bg-green-100 text-green-700',
  'Fell Through': 'bg-red-100 text-red-700',
  Active: 'bg-emerald-100 text-emerald-700',
  'Off-Market': 'bg-gray-100 text-gray-600',
  'Coming Soon': 'bg-sky-100 text-sky-700',
  Occupied: 'bg-green-100 text-green-700',
  Vacant: 'bg-red-100 text-red-700',
  Renovation: 'bg-orange-100 text-orange-700',
};

export default function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${COLOR[status]}`}>
      {status}
    </span>
  );
}
