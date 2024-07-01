// src/components/YouTuberHome.jsx
import React, { useState, useEffect } from 'react';
import { Navigate,useNavigate } from "react-router-dom";
import axios from 'axios';
import {jwtDecode} from "jwt-decode";

const YouTuberHome = ({ token, setToken }) => {
    const [activeTab, setActiveTab] = useState('raw');
    const [secretKey, setSecretKey] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [rawVideos,setRawVideos] = useState([]);
    const [editedVideos,setEditedVideos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchSecretKey();
            fetchRawVideos();
            fetchEditedVideos();
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

    const fetchRawVideos =async () => {
        try{
            const response = await axios.get('http://localhost:8000/api/file/raw',{
                headers: { Authorization: token }
            });
            setRawVideos(response.data);

        }catch (e) {
            console.log(e);
        }finally {
            setIsLoading(false);
        }
    }

    const fetchEditedVideos = async () => {
        try{
            const response = await axios.get('http://localhost:8000/api/file/edited',{
                headers : {Authorization:token}
            });
            setEditedVideos(response.data);
        }catch (e) {
            console.log(e);
            alert('Error Fetching Edited Videos!')
        }finally {
            setIsLoading(false);
        }
    }

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

    const handleRawVideoChange = (event) => {
        console.log('Selecting raw video:', event.target.files[0]);
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmitRawVideo = async ()=>{
        try {
            if (!selectedFile) {
                alert('Please select a file first');
                return;
            }
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append("upload_preset", "rawvideo");
            const api = 'https://api.cloudinary.com/v1_1/djtrvplmk/video/upload';
            const cloudinaryRes = await axios.post(api,formData);

            const videoUrl = cloudinaryRes.data.secure_url;
            console.log(videoUrl);
            const apiRes = await axios.post('http://localhost:8000/api/file/save-raw', {
                filePath : videoUrl,
                filename : selectedFile.name
            },{
                headers : {Authorization : token}
            }
            );
            console.log('Video saved:', apiRes.data);
            alert('Video uploaded successfully!');
            fetchRawVideos();
            setSelectedFile(null);
        }catch (e){
            console.log(e);
            alert('Failed to upload video. Please try again.');
        }
    }

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
                            onChange={handleRawVideoChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                        <button
                            onClick={handleSubmitRawVideo}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Submit Video
                        </button>
                        <h3 className="text-lg font-bold mt-6 mb-2">Raw Videos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            { rawVideos.map((video,index) => (
                                <div key={index}>
                                    <video
                                        controls muted
                                        className="w-full h-48 object-cover"
                                        src={video.filePath}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                    <p className="mt-2">{video.filename}</p>
                                    <p className="text-sm text-gray-500">
                                        Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'youtube' && (
                    <div className="bg-white p-6 rounded shadow-md">
                        <h3 className="text-lg font-bold mt-6 mb-2">Edited Videos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {editedVideos.map((video, index) => (
                                <div key={index}>
                                    <video
                                        controls muted
                                        className="w-full h-48 object-cover"
                                        src={video.filePath}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                    <p className="mt-2">{video.filename}</p>
                                    <p className="text-sm text-gray-500">
                                        Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default YouTuberHome;