'use client';

import CampaignTable from '../components/CampaignTable';

export default function AdminCampaignsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin - Manajemen Kampanye</h1>
      <CampaignTable />
    </div>
  );
}