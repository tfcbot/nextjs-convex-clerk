import { PricingTable } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="max-w-[800px] mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Plan</h1>
      <PricingTable />
    </div>
  );
} 