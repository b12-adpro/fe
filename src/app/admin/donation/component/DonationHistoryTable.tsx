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
  const [sortBy, setSortBy] = useState<'amount' | 'donatedAt' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const sortedDonations = [...donations].sort((a, b) => {
    if (!sortBy) return 0;

    if (sortBy === 'amount') {
      return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }

    if (sortBy === 'donatedAt') {
      return sortDir === 'asc'
        ? new Date(a.donatedAt).getTime() - new Date(b.donatedAt).getTime()
        : new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime();
    }

    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedDonations.length / itemsPerPage);

  const handleSort = (column: 'amount' | 'donatedAt') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const renderSortIcon = (column: 'amount' | 'donatedAt') => {
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
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
                <td className="px-4 py-3 font-medium  text-gray-500">
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
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> -{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, donations.length)}
            </span>{' '}
            dari <span className="font-medium">{donations.length}</span> donasi
          </p>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`inline-flex items-center px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
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