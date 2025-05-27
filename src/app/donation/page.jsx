"use client";
import { Calendar, Clock, AlertTriangle, CheckCircle, X, Eye, CreditCard, XCircle, MessageSquare, Edit } from 'lucide-react';
import { PropTypes } from 'prop-types';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Hardcoded donatur ID for demonstration
const DONATUR_ID = "8f7d6543-2e1a-9c8b-7f6e-5d4c3b2a1001";

// Campaign titles mapping (placeholder for real API integration)
const campaignTitles = {
  "550e8400-e29b-41d4-a716-446655440000": "Bantu Korban Banjir di Kalimantan",
  "550e8400-e29b-41d4-a716-446655440001": "Pendidikan untuk Anak-anak Papua",
  "550e8400-e29b-41d4-a716-446655440002": "Perbaikan Fasilitas Panti Asuhan",
  "550e8400-e29b-41d4-a716-446655440003": "Bantuan Medis untuk Lansia",
};

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
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const statusDisplayNames = {
  COMPLETED: 'Selesai',
  PENDING: 'Menunggu',
  CANCELED: 'Dibatalkan',
};

// Status badge component
const StatusBadge = ({ status }) => {
  let bgColor, textColor, icon;
  
  switch(status) {
    case 'COMPLETED':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <CheckCircle size={16} className="mr-1 text-green-600" />;
      break;
    case 'PENDING':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = <Clock size={16} className="mr-1 text-yellow-600" />;
      break;
    case 'CANCELED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <X size={16} className="mr-1 text-red-600" />;
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      icon = <AlertTriangle size={16} className="mr-1 text-gray-600" />;
  }
  
  return (
    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon} {statusDisplayNames[status] || status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['COMPLETED', 'PENDING', 'CANCELED']).isRequired,
};

export default function DonationHistoryPage() {
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [originalMessage, setOriginalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdateResult, setStatusUpdateResult] = useState(null);
  const [messageUpdateResult, setMessageUpdateResult] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an actual API call
        const response = await fetch(`${process.env.NEXT_PUBLIC_CAMPAIGN_DONATION_API_BASE_URL}/api/donations/donaturs/${DONATUR_ID}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setDonations(data);
        setError(null);
      } catch (err) {
        setError("Gagal memuat data donasi. Silakan coba lagi nanti.");
        console.error("Error fetching donations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const openPaymentModal = (donation) => {
    setSelectedDonation(donation);
    setDonationAmount(donation.amount.toString());
    setIsPaymentModalOpen(true);
    setStatusUpdateResult(null);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setTimeout(() => {
      setSelectedDonation(null);
      setStatusUpdateResult(null);
    }, 300);
  };
  
  const openMessageModal = (donation) => {
    setSelectedDonation(donation);
    setDonationMessage(donation.message || "");
    setOriginalMessage(donation.message || "");
    setIsMessageModalOpen(true);
    setMessageUpdateResult(null);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setTimeout(() => {
      setSelectedDonation(null);
      setMessageUpdateResult(null);
    }, 300);
  };

  const updateDonationMessage = async (donationId, message) => {
    setIsSubmitting(true);
    try {
      console.log('Updating donation message:', { donationId, message });
      
      // Create URL with query parameters instead of JSON body
      const url = new URL(`${process.env.NEXT_PUBLIC_CAMPAIGN_DONATION_API_BASE_URL}/api/donations/message`);
      url.searchParams.append('donationId', donationId);
      url.searchParams.append('message', message);
      
      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = "Gagal memperbarui pesan. Silakan coba lagi.";
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const updatedDonation = await response.json();

      const updatedDonations = donations.map(donation => {
        if (donation.donationId === donationId) {
          return { ...donation, message };
        }
        return donation;
      });

      setDonations(updatedDonations);

      setMessageUpdateResult({
        success: true,
        message: "Pesan berhasil diperbarui."
      });
    } catch (error) {
      console.error("Error updating donation message:", error);
      setMessageUpdateResult({
        success: false,
        message: error.message || "Gagal memperbarui pesan. Silakan coba lagi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMessage = () => {
    if (donationMessage === originalMessage) return;
    if (!selectedDonation || !selectedDonation.donationId) {
      console.error("No donation selected or donationId missing");
      setMessageUpdateResult({
        success: false,
        message: "Data donasi tidak valid. Silakan refresh halaman."
      });
      return;
    }
    updateDonationMessage(selectedDonation.donationId, donationMessage);
  };

  const cancelDonation = async (donationId) => {
    setIsSubmitting(true);
    try {
      // Log the request data for debugging
      console.log('Canceling donation:', donationId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_CAMPAIGN_DONATION_API_BASE_URL}/api/donations/cancel`, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the UUID directly as JSON string, not as an object property
        body: JSON.stringify(donationId),
      });
      
      if (response.ok) {
        const updatedDonation = await response.json();
        setStatusUpdateResult({
          success: true,
          message: 'Berhasil membatalkan donasi.'
        });

        const updatedDonations = donations.map(donation => {
          if (donation.donationId === donationId) {
            return { ...donation, status: 'CANCELED' };
          }
          return donation;
        });
        setDonations(updatedDonations);
      } else if (response.status === 400) {
        const error = await response.json();
        console.error("Error canceling donation:", error);
        setStatusUpdateResult({
          success: false,
          message: error.message
        });
      } else {
        console.error("Error canceling donation:", response.statusText);
        setStatusUpdateResult({
          success: false,
          message: "Gagal membatalkan donasi. Silakan coba lagi."
        });
      }
    } catch (error) {
      console.error("Error canceling donation:", error);
      setStatusUpdateResult({
        success: false,
        message: "Gagal membatalkan donasi. Silakan coba lagi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!donationAmount || parseInt(donationAmount) <= 0) return;

    setIsSubmitting(true);

    try {
      const paymentData = {
        donationId: selectedDonation.donationId,
        campaignId: selectedDonation.campaignId,
        donaturId: DONATUR_ID,
        amount: parseInt(donationAmount),
        status: "COMPLETED"
      };

      // Log the request data for debugging
      console.log('Submitting payment:', paymentData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_CAMPAIGN_DONATION_API_BASE_URL}/api/donations/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        await response.json();
        setStatusUpdateResult({
          success: true,
          message: "Pembayaran berhasil! Donasi Anda telah dikonfirmasi."
        });

        // Update the donation status in the local state
        const updatedDonations = donations.map(donation => {
          if (donation.donationId === selectedDonation.donationId) {
            return { ...donation, status: 'COMPLETED', amount: parseInt(donationAmount) };
          }
          return donation;
        });
        setDonations(updatedDonations);
      } else {
        const errorData = await response.json();
        setStatusUpdateResult({
          success: false,
          message: errorData.message || "Terjadi kesalahan saat memproses pembayaran."
        });
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      setStatusUpdateResult({
        success: false,
        message: "Gagal terhubung ke server. Silakan coba lagi nanti."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDonation = (donationId) => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan donasi ini?")) {
      cancelDonation(donationId);
    }
  };

  const handleViewCampaign = (campaignId) => {
    window.location.href = `/donation/campaigns/${campaignId}`;
  };

  const isPaymentButtonDisabled = !donationAmount || parseInt(donationAmount) <= 0 || isSubmitting;
  const isUpdateMessageButtonDisabled = donationMessage === originalMessage || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Riwayat Donasi</h1>
          <p className="mt-2">Kelola semua donasi yang telah Anda berikan</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Donatur ID: {DONATUR_ID}</h2>
          <p className="text-gray-600">Total Donasi: {donations.length}</p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data donasi...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Anda belum memiliki riwayat donasi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <div 
                key={donation.donationId} 
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-700">
                        {campaignTitles[donation.campaignId] || "Kampanye"}
                      </h3>
                      <p className="text-gray-500 text-sm flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(donation.datetime)}
                      </p>
                    </div>
                    <StatusBadge status={donation.status} />
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(donation.amount)}</p>
                    {donation.message && (
                      <div className="mt-2 bg-gray-50 p-3 rounded-md">
                        <p className="text-gray-600 italic">"{donation.message}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleViewCampaign(donation.campaignId)}
                      className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                      <Eye size={16} className="mr-1" /> Lihat Kampanye
                    </button>

                    {donation.status === "PENDING" && (
                      <>
                        <button 
                          onClick={() => openPaymentModal(donation)}
                          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                        >
                          <CreditCard size={16} className="mr-1" /> Bayar
                        </button>

                        <button 
                          onClick={() => handleCancelDonation(donation.donationId)}
                          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                        >
                          <XCircle size={16} className="mr-1" /> Batalkan
                        </button>
                      </>
                    )}

                    {donation.status !== "CANCELED" && (
                      <>
                        {donation.message ? (
                          <>
                            <button 
                              onClick={() => openMessageModal(donation)}
                              className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                            >
                              <Edit size={16} className="mr-1" /> Ubah Pesan
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => openMessageModal(donation)}
                            className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                          >
                            <MessageSquare size={16} className="mr-1" /> Beri Pesan
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <button 
            className="absolute inset-0 bg-black/50 pointer-events-auto" 
            onClick={closePaymentModal}
          ></button>

          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Pembayaran Donasi</h3>

              {statusUpdateResult ? (
                <div className={`p-4 mb-4 rounded-lg ${statusUpdateResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {statusUpdateResult.message}
                </div>
              ) : (
                <>
                  <p className="mb-4 text-gray-600">
                    Kampanye: <span className="font-semibold">{campaignTitles[selectedDonation.campaignId]}</span>
                  </p>

                  <div className="mb-6">
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
                </>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={closePaymentModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {statusUpdateResult ? 'Tutup' : 'Batal'}
                </button>

                {!statusUpdateResult && (
                  <button
                    onClick={handleSubmitPayment}
                    className={`px-4 py-2 rounded-md font-medium ${
                      isPaymentButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isPaymentButtonDisabled}
                  >
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isMessageModalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <button 
            className="absolute inset-0 bg-black/50 pointer-events-auto" 
            onClick={closeMessageModal}
          ></button>

          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                {selectedDonation.message ? 'Ubah Pesan Donasi' : 'Tambah Pesan Donasi'}
              </h3>

              {messageUpdateResult ? (
                <div className={`p-4 mb-4 rounded-lg ${messageUpdateResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {messageUpdateResult.message}
                </div>
              ) : (
                <>
                  <p className="mb-4 text-gray-600">
                    Kampanye: <span className="font-semibold">{campaignTitles[selectedDonation.campaignId]}</span>
                  </p>

                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Pesan Donasi
                    </label>
                    <textarea
                      id="message"
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Tulis pesan Anda untuk kampanye ini"
                      rows={4}
                    ></textarea>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={closeMessageModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {messageUpdateResult ? 'Tutup' : 'Batal'}
                </button>

                {!messageUpdateResult && (
                  <button
                    onClick={handleUpdateMessage}
                    className={`px-4 py-2 rounded-md font-medium ${
                      isUpdateMessageButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isUpdateMessageButtonDisabled}
                  >
                    {isSubmitting ? 'Memproses...' : selectedDonation.message ? 'Ubah Pesan' : 'Tambah Pesan'}
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