'use client'
import { API_URL } from '@/constants';
import { truncate } from '@/utils';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface Listing {
    id: number;
    full_name: string;
    business_name: string;
    mobile_number: string;
    email: string;
    city: string;
    message: string;
    is_test_data: boolean;
}

export default function BusinessListingsTable() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('');
    const [isTestData, setIsTestData] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 60,
        total: 0,
        totalPages: 0
    });
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);



    const fetchListings = async (page = 1, limit = 10, searchQuery = '', isTestDataVal = isTestData) => {
        try {
            console.log(isTestDataVal)
            setLoading(true);
            const response = await fetch(`${API_URL}?page=${page}&limit=${limit}&q=${searchQuery}&is_test_data=${isTestDataVal}`);
            const data = await response.json();

            if (data.success) {
                setListings(data.data);
                setPagination(data.pagination);
                setError(null);
            } else {
                setError('Failed to fetch listings');
            }
        } catch (err) {
            setError('Error connecting to server: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings(pagination.page, pagination.limit, searchQuery, isTestData);
    }, []);

    const filteredListings = listings.filter((listing) => {
        const query = searchQuery.toLowerCase();
        return (
            (listing.id?.toString() || '').toLowerCase().includes(query) ||
            (listing.full_name?.toLowerCase() || '').includes(query) ||
            (listing.business_name?.toLowerCase() || '').includes(query) ||
            (listing.mobile_number?.toString() || '').includes(query) ||
            (listing.email?.toLowerCase() || '').includes(query) ||
            (listing.city?.toLowerCase() || '').includes(query) ||
            (listing.message?.toLowerCase() || '').includes(query)
        );
    });

    const handlePageChange = (newPage) => {
        fetchListings(newPage, pagination.limit, searchQuery, isTestData);
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        fetchListings(1, newLimit, searchQuery, isTestData);
    };

    const handleTestDataChange = (e) => {
        const newValue = e.target.checked;
        setIsTestData(newValue);
        fetchListings(1, pagination.limit, searchQuery, newValue);
    };



    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => fetchListings(pagination.page, pagination.limit, searchQuery, isTestData)}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            {/* check box */}

                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Business Listings</h1>
                                <p className="text-gray-600 mt-1">Total: {pagination.total} listings</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div>
                                    <input
                                        type="checkbox"
                                        id="is_test_data"
                                        name="is_test_data"
                                        checked={isTestData}
                                        onChange={handleTestDataChange}
                                    />
                                    <label htmlFor="is_test_data" className="text-gray-600 ml-2">Show Test Data</label>
                                    {/* {listings[0].is_test_data} */}
                                </div>
                                <label className="text-gray-600">Show:</label>
                                {/* <select
                                    value={pagination.limit}
                                    onChange={handleLimitChange}
                                    className="border border-gray-300 rounded px-3 py-2"
                                >

                                    <option value="60">60</option>
                                </select> */}
                            </div>
                        </div>
                    </div>
                    {/* added input search box */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search listings..."
                                    className="border border-gray-300 rounded px-3 py-2"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 w-34 uppercase tracking-wider"> Message</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredListings.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No listings found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredListings.map((listing) => (
                                        <tr key={listing.id} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap hover:text-gray-600/50 cursor-pointer text-sm text-gray-900" onClick={() => {
                                                router.push(`/edit/?id=${listing.id}`)
                                            }} >{listing.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{listing.business_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.mobile_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.city || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.is_test_data ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                    {listing.is_test_data ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.city || '-'}</td> */}
                                            <td
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-64 truncate cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (listing.message) setSelectedMessage(listing.message);
                                                }}
                                                title="Click to view full message"
                                            >
                                                {truncate(listing.message, 50) || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <div className="flex gap-1">
                                {[...Array(pagination.totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    // Show first page, last page, current page, and pages around current
                                    if (
                                        pageNum === 1 ||
                                        pageNum === pagination.totalPages ||
                                        (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-4 py-2 border rounded text-sm font-medium ${pagination.page === pageNum
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === pagination.page - 2 ||
                                        pageNum === pagination.page + 2
                                    ) {
                                        return <span key={pageNum} className="px-2 py-2">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Modal */}
            {selectedMessage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedMessage(null)}
                >
                    <div
                        className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Full Message</h3>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="text-gray-700 whitespace-pre-wrap max-h-[60vh] overflow-y-auto p-2 bg-gray-50 rounded border border-gray-100">
                            {selectedMessage}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}