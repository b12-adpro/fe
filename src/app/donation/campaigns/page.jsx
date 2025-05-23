"use client";
import { useState } from 'react';
import { Clock, Target, Heart } from 'lucide-react';

// Dummy data for campaigns
const dummyCampaigns = [
  {
    campaignId: "550e8400-e29b-41d4-a716-446655440000",
    fundraiserId: "7a1b0428-13e3-4a6a-9d1b-a24df3ac0001",
    judul: "Bantu Korban Banjir di Kalimantan",
    status: "Aktif",
    datetime: "2025-05-15T08:30:00",
    target: 50000000,
    deskripsi: "Kampanye ini bertujuan untuk membantu korban banjir di Kalimantan yang kehilangan tempat tinggal dan kebutuhan pokok.",
    collected: 27500000, // Dummy data for collected amount
    donors: 143, // Dummy data for number of donors
    daysLeft: 12, // Dummy data for remaining days
  },
  {
    campaignId: "550e8400-e29b-41d4-a716-446655440001",
    fundraiserId: "7a1b0428-13e3-4a6a-9d1b-a24df3ac0002",
    judul: "Pendidikan untuk Anak-anak Papua",
    status: "Aktif",
    datetime: "2025-05-10T14:45:00",
    target: 75000000,
    deskripsi: "Membantu menyediakan fasilitas pendidikan dan buku-buku untuk anak-anak di pedalaman Papua yang kesulitan mengakses pendidikan.",
    collected: 45000000, // Dummy data for collected amount
    donors: 278, // Dummy data for number of donors
    daysLeft: 20, // Dummy data for remaining days
  },
  {
    campaignId: "550e4400-e29b-41d4-a716-446655440001",
    fundraiserId: "7axb0428-13e3-4a6a-9d1b-a24df3ac0002",
    judul: "Aku Ingin Pulang",
    status: "Aktif",
    datetime: "2025-05-10T14:45:00",
    target: 75000000,
    deskripsi: "Membantu menyediakan fasilitas pendidikan dan buku-buku untuk anak-anak di pedalaman Papua yang kesulitan mengakses pendidikan.",
    collected: 45000000, // Dummy data for collected amount
    donors: 278, // Dummy data for number of donors
    daysLeft: 20, // Dummy data for remaining days
  }
];

// Hardcoded donatur ID for donation
const donaturId = "8f7d6543-2e1a-9c8b-7f6e-5d4c3b2a1001";

// Format currency in Indonesian Rupiah
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format date to Indonesian format
const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
};

export default function CampaignsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const openDonationModal = (campaign) => {
    setSelectedCampaign(campaign);
    setDonationAmount("");
    setDonationMessage("");
    setIsModalOpen(true);
    setSubmitResult(null);
  };

  const closeDonationModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
    setTimeout(() => {
      setSubmitResult(null);
    }, 300);
  };

  const handleSubmitDonation = async () => {
    if (!donationAmount || parseInt(donationAmount) <= 0) return;

    setIsSubmitting(true);

    try {
      const donationData = {
        campaignId: selectedCampaign.campaignId,
        donaturId: donaturId,
        amount: parseInt(donationAmount),
        message: donationMessage,
        datetime: new Date().toISOString()
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_CAMPAIGN_DONATION_API_BASE_URL}/api/donations/campaigns/${selectedCampaign.campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (response.ok) {
        await response.json();
        setSubmitResult({
          success: true,
          message: "Donasi berhasil! Terima kasih atas kebaikan Anda."
        });
        // In a real app, we would refresh the campaigns data here
      } else {
        const errorData = await response.json();
        setSubmitResult({
          success: false,
          message: errorData.message || "Terjadi kesalahan saat memproses donasi."
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: "Gagal terhubung ke server. Silakan coba lagi nanti."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = !donationAmount || parseInt(donationAmount) <= 0 || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Platform Donasi Peduli</h1>
          <p className="mt-2">Bantu sesama dengan donasi untuk kampanye yang bermakna</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Kampanye Terbaru</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dummyCampaigns.map(campaign => (
            <div key={campaign.campaignId} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Campaign Image Placeholder */}
              <div className="h-48 bg-gray-300 relative">
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {campaign.status}
                </div>
                <img src={`/api/placeholder/800/400`} alt="Campaign" className="w-full h-full object-cover" />
              </div>

              {/* Campaign Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{campaign.judul}</h3>
                <p className="text-gray-600 mb-4">{campaign.deskripsi}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Terkumpul {formatCurrency(campaign.collected)}</span>
                    <span className="text-gray-600">dari {formatCurrency(campaign.target)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (campaign.collected / campaign.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Campaign Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                    <Heart size={20} className="text-red-500 mb-1" />
                    <span style={{ color: '#333' }} className="text-sm font-semibold">{campaign.donors}</span>
                    <span className="text-xs text-gray-600">Donatur</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                    <Target size={20} className="text-blue-500 mb-1" />
                    <span style={{ color: '#333' }} className="text-sm font-semibold">{Math.round((campaign.collected / campaign.target) * 100)}%</span>
                    <span className="text-xs text-gray-600">Tercapai</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                    <Clock size={20} className="text-green-500 mb-1" />
                    <span style={{ color: '#333' }} className="text-sm font-semibold">{campaign.daysLeft}</span>
                    <span className="text-xs text-gray-600">Hari lagi</span>
                  </div>
                </div>

                {/* Date Created */}
                <div className="text-sm text-gray-500 mb-4">
                  Dibuat pada: {formatDate(campaign.datetime)}
                </div>

                {/* Donation Button */}
                <button 
                  onClick={() => openDonationModal(campaign)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
                >
                  Beri Donasi
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Donation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <button 
            className="absolute inset-0 bg-black/50 pointer-events-auto" 
            onClick={closeDonationModal}
          ></button>

          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Donasi untuk "{selectedCampaign?.judul}"</h3>

              {submitResult ? (
                <div className={`p-4 mb-4 rounded-lg ${submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {submitResult.message}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Donasi (Rp) *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Masukkan jumlah donasi"
                      min="1"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Pesan (Opsional)
                    </label>
                    <textarea
                      id="message"
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Tulis pesan untuk kampanye ini"
                      rows={3}
                    ></textarea>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDonationModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {submitResult ? 'Tutup' : 'Batal'}
                </button>

                {!submitResult && (
                  <button
                    onClick={handleSubmitDonation}
                    className={`px-4 py-2 rounded-md font-medium ${
                      isButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isButtonDisabled}
                  >
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}