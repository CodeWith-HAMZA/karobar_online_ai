'use client';

import { API_URL } from '@/constants';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
        ai_status: '',
        website_url: '',
        business_logo: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);


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
            setError('Failed to fetch categories: ' + (err as Error).message);
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
                        business_logo: listing.business_logo || listing.logo || '',
                        ai_status: listing.ai_status || '',
                    });
                } else {
                    setError('Listing not found');
                }
            }
        } catch (err) {
            setError('Failed to fetch listing: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    setFormData(prev => ({
                        ...prev,
                        business_logo: result
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            let currentLogoUrl = formData.business_logo;

            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);
                // uploadFormData.append("")

                // Construct upload URL from API_URL base
                // API_URL is .../api/v1/business-listings
                // Upload endpoint is .../upload
                const baseUrl = API_URL.split('/api')[0];
                const uploadUrl = `${baseUrl}/upload?business_listing_id=${listingId}`;

                const uploadResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    body: uploadFormData,
                });

                const uploadData = await uploadResponse.json();
                if (uploadData.fileUrl) {
                    currentLogoUrl = uploadData.fileUrl;
                }
            }

            const response = await fetch(`${API_URL}/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    business_logo: currentLogoUrl,
                    logo: selectedFile ? currentLogoUrl : ""
                })
            });

            console.log(response, 'response')
            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                toast.success('Listing updated successfully!');

                // Update state with the confirmed URL and clear the selected file
                setFormData(prev => ({
                    ...prev,
                    business_logo: currentLogoUrl
                }));
                setSelectedFile(null);

                setTimeout(() => setSuccess(false), 3000);
            } else {
                const errorMessage = data.message || 'Failed to update listing';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            const errorMessage = 'Error updating listing: ' + (err as any).message;
            setError(errorMessage);
            toast.error(errorMessage);
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
                                    Business Logo
                                </label>
                                <div className="mt-1 flex items-center gap-4">

                                    {formData.business_logo && (
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={formData.business_logo as string}
                                                alt="Business Logo"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, business_logo: '' }))}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl focus:outline-none hover:bg-red-600"
                                                title="Remove logo"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            PNG, JPG or GIF (MAX. 2MB recommended)
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                                    AI Mode
                                </label>
                                {/* {formData.package_status} */}
                                <select
                                    name="ai_status"
                                    value={formData.ai_status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select</option>
                                    <option value="processed">Processed</option>
                                    <option value="ai_ready">AI Ready</option>
                                    <option value="regenerated">Regenerated </option>
                                    <option value="failed">Failed </option>
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

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}