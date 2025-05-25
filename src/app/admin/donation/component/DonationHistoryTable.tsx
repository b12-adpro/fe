'use client';
import React, { useState } from 'react';

export interface DonationHistoryDTO {
  id: string;           
  campaignId: string;   
  donaturId: string;    
  donaturName: string;
  campaignTitle: string;
  amount: number;     
  donatedAt: string;   
}

interface Props {
  donations: DonationHistoryDTO[];
}

const DonationHistoryTable: React.FC<Props> = ({ donations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof DonationHistoryDTO | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filtering
  const filteredDonations = donations.filter((donation) => {
    const campaignTitleMatch = donation?.campaignTitle?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
    const donaturNameMatch = donation?.donaturName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
    return campaignTitleMatch || donaturNameMatch;
  });
  
  // Sorting
  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (!sortBy) return 0;
    
    if (sortBy === 'amount') {
      return sortDir === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    }
    
    if (sortBy === 'donatedAt') {
      return sortDir === 'asc' 
        ? new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime() 
        : new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    }
    
    const aValue = String(a[sortBy]);
    const bValue = String(b[sortBy]);
    return sortDir === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedDonations.length / itemsPerPage);
  
  const handleSort = (column: keyof DonationHistoryDTO) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };
  
  const renderSortIcon = (column: keyof DonationHistoryDTO) => {
    if (sortBy !== column) return '⇅';
    return sortDir === 'asc' ? '↑' : '↓';
  };
  
  if (donations.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
        <p className="text-gray-500 text-lg">Tidak ada data donasi.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari donatur atau kampanye..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th 
                className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('campaignTitle')}
              >
                <div className="flex items-center">
                  <span>Kampanye</span>
                  <span className="ml-1 text-gray-400">{renderSortIcon('campaignTitle')}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('donaturName')}
              >
                <div className="flex items-center">
                  <span>Donatur</span>
                  <span className="ml-1 text-gray-400">{renderSortIcon('donaturName')}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  <span>Jumlah</span>
                  <span className="ml-1 text-gray-400">{renderSortIcon('amount')}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('donatedAt')}
              >
                <div className="flex items-center">
                  <span>Tanggal Donasi</span>
                  <span className="ml-1 text-gray-400">{renderSortIcon('donatedAt')}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((donation) => (
              <tr key={donation.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{donation.campaignTitle}</td>
                <td className="px-4 py-3">{donation.donaturName}</td>
                <td className="px-4 py-3 font-medium">
                  Rp {donation.amount.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(donation.donatedAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
          <div>
            <p className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">
                {Math.min(indexOfLastItem, filteredDonations.length)}
              </span> dari <span className="font-medium">{filteredDonations.length}</span> donasi
            </p>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`inline-flex items-center px-3 py-1 rounded-md 
                ${currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Sebelumnya
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageToShow}
                  onClick={() => setCurrentPage(pageToShow)}
                  className={`inline-flex items-center px-3 py-1 rounded-md ${
                    currentPage === pageToShow
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageToShow}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center px-3 py-1 rounded-md 
                ${currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationHistoryTable;