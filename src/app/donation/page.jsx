"use client";
import { Calendar, Clock, AlertTriangle, CheckCircle, X, Eye, CreditCard, XCircle, MessageSquare, Edit, Trash2 } from 'lucide-react';
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

const statusDisplayNames = {
  COMPLETED: 'Selesai',
  PENDING: 'Menunggu',
  CANCELED: 'Dibatalkan',
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
  const [paymentAmount, setPaymentAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [originalMessage, setOriginalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdateResult, setStatusUpdateResult] = useState(null);
  const [messageUpdateResult, setMessageUpdateResult] = useState(null);

  // Fetch donations
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an actual API call
        const response = await fetch(`http://localhost:8080/api/donations/donaturs/${DONATUR_ID}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // For demo, we'll use mock data
        const mockData = [
          {
            donationId: "123e4567-e89b-12d3-a456-426614174000",
            campaignId: "550e8400-e29b-41d4-a716-446655440000",
            donaturId: DONATUR_ID,
            amount: 500000,
            status: "COMPLETED",
            datetime: "2025-05-10T14:30:00",
            message: "Semoga membantu para korban banjir!"
          },
          {
            donationId: "123e4567-e89b-12d3-a456-426614174001",
            campaignId: "550e8400-e29b-41d4-a716-446655440001",
            donaturId: DONATUR_ID,
            amount: 250000,
            status: "PENDING",
            datetime: "2025-05-15T09:45:00",
            message: "Untuk masa depan anak-anak Papua"
          },
          {
            donationId: "123e4567-e89b-12d3-a456-426614174002",
            campaignId: "550e8400-e29b-41d4-a716-446655440002",
            donaturId: DONATUR_ID,
            amount: 1000000,
            status: "PENDING",
            datetime: "2025-05-18T16:20:00",
            message: ""
          },
          {
            donationId: "123e4567-e89b-12d3-a456-426614174003",
            campaignId: "550e8400-e29b-41d4-a716-446655440003",
            donaturId: DONATUR_ID,
            amount: 750000,
            status: "CANCELED",
            datetime: "2025-05-05T11:15:00",
            message: "Untuk pengobatan lansia"
          }
        ];
        
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
    setPaymentAmount(donation.amount.toString());
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
      // In a real app, this would be an actual API call
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/donations/${donationId}/message`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ message }),
      // });
      
      // For demo, we'll simulate a successful response
      // const updatedDonation = await response.json();
      
      // Update the UI optimistically
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
        message: "Gagal memperbarui pesan. Silakan coba lagi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const deleteDonationMessage = async (donationId) => {
    // Confirmation before deleting
    if (!window.confirm("Apakah Anda yakin ingin menghapus pesan donasi ini?")) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real app, this would be an actual API call
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/donations/${donationId}/message`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   }
      // });
      
      // For demo, we'll simulate a successful response
      
      // Update the UI optimistically
      const updatedDonations = donations.map(donation => {
        if (donation.donationId === donationId) {
          return { ...donation, message: "" };
        }
        return donation;
      });
      
      setDonations(updatedDonations);
      
      // No need for result message as we're not showing a modal
    } catch (error) {
      console.error("Error deleting donation message:", error);
      alert("Gagal menghapus pesan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMessage = () => {
    if (donationMessage === originalMessage) return;
    updateDonationMessage(selectedDonation.donationId, donationMessage);
  };

  const updateDonationStatus = async (donationId, newStatus, amount = null) => {
    setIsSubmitting(true);
    try {
      // Prepare request body based on the action
      const requestBody = { status: newStatus };
      if (amount !== null) {
        requestBody.amount = parseInt(amount);
      }
      
      // In a real app, this would be an actual API call
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/donations/${donationId}/status`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(requestBody),
      // });
      
      // For demo, we'll simulate a successful response
      // const updatedDonation = await response.json();
      
      // Update the UI optimistically
      const updatedDonations = donations.map(donation => {
        if (donation.donationId === donationId) {
          const updatedDonation = { 
            ...donation, 
            status: newStatus,
            amount: amount !== null ? parseInt(amount) : donation.amount
          };
          return updatedDonation;
        }
        return donation;
      });
      
      setDonations(updatedDonations);
      
      // Show success message
      const actionText = newStatus === "COMPLETED" ? "pembayaran" : "pembatalan";
      setStatusUpdateResult({
        success: true,
        message: `Berhasil melakukan ${actionText} donasi.`
      });
    } catch (error) {
      console.error("Error updating donation status:", error);
      setStatusUpdateResult({
        success: false,
        message: "Gagal memperbarui status donasi. Silakan coba lagi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDonation = () => {
    if (!paymentAmount || parseInt(paymentAmount) <= 0) return;
    updateDonationStatus(selectedDonation.donationId, "COMPLETED", paymentAmount);
  };

  const handleCancelDonation = (donationId) => {
    // Confirmation before canceling
    if (window.confirm("Apakah Anda yakin ingin membatalkan donasi ini?")) {
      updateDonationStatus(donationId, "CANCELED");
    }
  };

  const isPaymentButtonDisabled = !paymentAmount || parseInt(paymentAmount) <= 0 || isSubmitting;
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
                            <button 
                              onClick={() => deleteDonationMessage(donation.donationId)}
                              className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                            >
                              <Trash2 size={16} className="mr-1" /> Hapus Pesan
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
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
            onClick={closePaymentModal}
          ></div>
          
          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-700">Pembayaran Donasi</h3>
              
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
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
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
                    onClick={handleCompleteDonation}
                    className={`px-4 py-2 rounded-md font-medium ${
                      isPaymentButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isPaymentButtonDisabled}
                  >
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
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
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
            onClick={closeMessageModal}
          ></div>
          
          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-700">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
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