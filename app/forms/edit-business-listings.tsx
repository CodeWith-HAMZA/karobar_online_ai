'use client';

import { API_URL } from '@/constants';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

export default function EditBusinessListing() {
    // console.log(listingId)
    const search = useSearchParams()
    console.log(search.get('id'))
    const listingId = search.get('id')


    const [formData, setFormData] = useState({
        full_name: '',
        package_status: '',
        business_name: '',
        mobile_number: '',
        whatsapp_number: '',
        email: '',
        has_website: false,
        preferred_language: 'English',
        business_address: '',
        business_about: '',
        instagram_social_link: '',
        facebook_social_link: '',
        city: '',
        is_test_data: false,
        category_id: '',
        sub_category_id: '',
        message: '',
        business_model: '',
        website_url: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);


    useEffect(() => {
        if (listingId) {
            fetchListing();
            fetchingCategories();

            // fetchingSubCategories();
        }
    }, [listingId]);


    const fetchingCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/categories`);
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (err) {
            setError('Failed to fetch categories: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // console.log(formData.category_id, 'euu')
        const fetchingSubCategories = async () => {
            try {
                // setLoading(true);
                const response = await fetch(`${API_URL}/subcategories/${formData.category_id}`);
                const data = await response.json();
                if (data.success) {
                    setSubCategories(data.data);
                }
            } catch (err) {
                console.log(err)
            } finally {
                // setLoading(false);
            }
        }
        if (formData.category_id) {
            fetchingSubCategories();
        }
    }, [formData.category_id]);

    const fetchListing = async () => {
        try {
            setLoading(true);
            // const response = await fetch(`${API_URL}?page=1&limit=100`);
            // const data = await response.json();
            const resp = await fetch(`${API_URL}/${listingId}`);
            const listingData = await resp.json();
            console.log(listingData, 'res')
            if (listingData.success) {
                // const listing = data.data.find(item => item.id === parseInt(listingId));
                const listing = listingData.data;
                if (listing) {
                    setFormData({
                        full_name: listing.full_name || '',
                        business_name: listing.business_name || '',
                        mobile_number: listing.mobile_number || '',
                        whatsapp_number: listing.whatsapp_number || '',
                        email: listing.email || '',
                        has_website: listing.has_website || false,
                        preferred_language: listing.preferred_language || 'English',
                        business_address: listing.business_address || '',
                        business_about: listing.business_about || '',
                        instagram_social_link: listing.instagram_social_link || '',
                        facebook_social_link: listing.facebook_social_link || '',
                        city: listing.city || '',
                        is_test_data: listing.is_test_data || false,
                        category_id: listing.category_id || '',
                        sub_category_id: listing.sub_category_id || '',
                        message: listing.message || '',
                        package_status: listing.package_status || 'non_verified',
                        business_model: listing.business_model || '',
                        website_url: listing.website_url || '',
                    });
                } else {
                    setError('Listing not found');
                }
            }
        } catch (err) {
            setError('Failed to fetch listing: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;
        console.log(name, value, type, checked)

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${API_URL}/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log(response, 'response')
            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(data.message || 'Failed to update listing');
            }
        } catch (err) {
            setError('Error updating listing: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading listing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Business Listing</h1>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800">✓ Listing updated successfully!</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Business Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business About
                                </label>
                                <textarea
                                    name="business_about"
                                    value={formData.business_about}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div> */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Address
                                </label>
                                <input
                                    type="text"
                                    name="business_address"
                                    value={formData.business_address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sub Category
                                    </label>
                                    <select
                                        name="sub_category_id"
                                        value={formData.sub_category_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Sub Category</option>
                                        {subCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Contact Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="mobile_number"
                                    value={formData.mobile_number}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    name="whatsapp_number"
                                    value={formData.whatsapp_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Social Media</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instagram Link
                                </label>
                                <input
                                    type="url"
                                    name="instagram_social_link"
                                    value={formData.instagram_social_link}
                                    onChange={handleChange}
                                    placeholder="https://instagram.com/..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Facebook Link
                                </label>
                                <input
                                    type="url"
                                    name="facebook_social_link"
                                    value={formData.facebook_social_link}
                                    onChange={handleChange}
                                    placeholder="https://facebook.com/..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Other Settings */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Other Settings</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Package Status
                                </label>
                                {/* {formData.package_status} */}
                                <select
                                    name="package_status"
                                    value={formData.package_status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="non_verified">Non verified</option>
                                    <option value="verified">Verified</option>
                                    <option value="business_guaranteed">Business Guaranteed </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Model
                                </label>
                                {/* {formData.package_status} */}
                                <select
                                    name="business_model"
                                    value={formData.business_model}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select</option>
                                    <option value="product_based">Product Based</option>
                                    <option value="service_based">Service Based</option>
                                    <option value="both">Both </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preferred Language
                                </label>
                                <select
                                    name="preferred_language"
                                    value={formData.preferred_language}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Urdu">Urdu</option>
                                    <option value="Roman Urdu">Roman Urdu</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Website
                                </label>
                                <input
                                    name="website_url"
                                    value={formData.website_url}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center space-x-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="has_website"
                                        checked={formData.has_website}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Has Website</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_test_data"
                                        checked={formData.is_test_data}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Test Data</span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            {/* <button
                                onClick={fetchListing}
                                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Reset
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}