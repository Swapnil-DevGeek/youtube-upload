// src/components/YouTuberHome.jsx
import React, { useState, useEffect } from 'react';
import { Navigate,useNavigate } from "react-router-dom";
import axios from 'axios';

const YouTuberHome = ({ token, setToken }) => {
    const [activeTab, setActiveTab] = useState('raw');
    const [secretKey, setSecretKey] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchSecretKey();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const fetchSecretKey = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/auth/fetch-secret-key', {
                headers: { Authorization: token }
            });
            const key = response.data.secretKey;
            setSecretKey(key);
        } catch (error) {
            console.error('Error fetching secret key:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    const copySecretKey = () => {
        if (secretKey) {
            navigator.clipboard.writeText(secretKey)
                .then(() => alert('Secret key copied to clipboard!'))
                .catch(err => console.error('Failed to copy: ', err));
        } else {
            alert('No secret key available');
        }
    };

    const uploadRawVideo = (event) => {
        console.log('Uploading raw video:', event.target.files[0]);
    };

    const uploadToYouTube = (event) => {
        console.log('Uploading to YouTube:', event.target.files[0]);
    };

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <nav className="bg-blue-500 px-12 py-4 flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold">YouTuber Dashboard</h1>
                <div>
                    <button onClick={copySecretKey} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
                        Copy Secret Key
                    </button>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="mt-8 px-12 py-4">
                <div className="flex mb-4">
                    <button
                        onClick={() => setActiveTab('raw')}
                        className={`mr-2 px-4 py-2 rounded ${activeTab === 'raw' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Upload Raw Video
                    </button>
                    <button
                        onClick={() => setActiveTab('youtube')}
                        className={`px-4 py-2 rounded ${activeTab === 'youtube' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Upload to YouTube
                    </button>
                </div>

                {activeTab === 'raw' && (
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl font-bold mb-4">Upload Raw Video</h2>
                        <input
                            type="file"
                            onChange={uploadRawVideo}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                    </div>
                )}

                {activeTab === 'youtube' && (
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl font-bold mb-4">Upload to YouTube</h2>
                        <input
                            type="file"
                            onChange={uploadToYouTube}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default YouTuberHome;