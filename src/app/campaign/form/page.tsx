'use client';

import { useRouter } from 'next/navigation';
import CampaignForm from '.././components/CampaignForm'; 

export default function CreateCampaignPage() {
  const router = useRouter();

  const handleCampaignCreationSuccess = () => {
    console.log('Campaign created successfully from dedicated page!');
    router.push('/campaign');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-6 sm:p-8">
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buat Kampanye Baru</h1>
            <p className="mt-2 text-sm text-gray-600">Isi detail di bawah untuk memulai penggalangan dana Anda.</p>
          </div>
          <CampaignForm onSuccess={handleCampaignCreationSuccess} />
        </div>
      </div>
    </div>
  );
}