import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DonationHistoryDTO {
  id: number;
  campaignId: string;
  campaignTitle: string;
  donaturName: string;
  amount: number;
  donatedAt: string;
}

export default function DonationHistoryPerCampaign({ campaignId }: { campaignId: string }) {
  const [donations, setDonations] = useState<DonationHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('donatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        console.log("Campaign ID from query:", campaignId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/donation-history/campaign/${campaignId}`);
        if (response.ok) {
          const data = await response.json();
          const donationList = Array.isArray(data) ? data : [];
          setDonations(donationList);
          
          // Calculate total donation amount
          const total = donationList.reduce((acc, donation) => acc + donation.amount, 0);
          setTotalAmount(total);
        } else {
          console.error('Failed to fetch donations');
          setDonations([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, [campaignId]);

  // Sort and filter the donations
  const sortedAndFilteredDonations = [...donations]
    .filter(donation => 
      donation.donaturName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'donatedAt') {
        const dateA = new Date(a.donatedAt).getTime();
        const dateB = new Date(b.donatedAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'amount') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else {
        return sortDirection === 'asc' 
          ? a.donaturName.localeCompare(b.donaturName)
          : b.donaturName.localeCompare(a.donaturName);
      }
    });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = sortedAndFilteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredDonations.length / itemsPerPage);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      
        <div className="flex flex-col md:flex-row gap-2 justify-between mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari donatur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg w-full"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border">
            <thead>
              <tr className="bg-gray-50">
                <th 
                  className="border px-4 py-2 text-left cursor-pointer"
                  onClick={() => handleSort('donaturName')}
                >
                  <div className="flex items-center">
                    Donatur
                    {sortBy === 'donaturName' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="border px-4 py-2 text-left cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Jumlah
                    {sortBy === 'amount' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="border px-4 py-2 text-left cursor-pointer"
                  onClick={() => handleSort('donatedAt')}
                >
                  <div className="flex items-center">
                    Tanggal Donasi
                    {sortBy === 'donatedAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentDonations.length > 0 ? (
                currentDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-3">
                      <div className="font-medium">{donation.donaturName}</div>
                    </td>
                    <td className="border px-4 py-3 font-medium">
                      Rp {donation.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="border px-4 py-3 text-sm text-gray-600">
                      {formatDate(donation.donatedAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border px-4 py-6 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada hasil yang cocok dengan pencarian' : 'Belum ada donasi untuk kampanye ini'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedAndFilteredDonations.length)} dari {sortedAndFilteredDonations.length} donasi
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                &laquo;
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                const pageNumber = currentPage <= 3 
                  ? index + 1 
                  : currentPage >= totalPages - 2 
                    ? totalPages - 4 + index 
                    : currentPage - 2 + index;
                
                if (pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNumber 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}