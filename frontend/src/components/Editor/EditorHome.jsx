import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import axios from 'axios';
import Modal from 'react-modal';

const EditorHome = ({ token, setToken }) => {
    const [activeTab, setActiveTab] = useState('download');
    const [secretKey, setSecretKey] = useState('');
    const [youtuberEmailInput, setYoutuberEmailInput] = useState('');
    const [youtuberEmail, setYoutuberEmail] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rawVideos,setRawVideos] = useState([]);
    const [editedVideos,setEditedVideos] = useState([]);
    const [selectedFile,setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(()=>{
        if(token){
            fetchRawVideos();
            fetchEditedVideos();
        }
    },[]);

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSecretKeyChange = (e) => {
        setSecretKey(e.target.value);
    };

    const handleYoutuberEmailChange = (e) => {
        setYoutuberEmailInput(e.target.value);
    };

    const validateSecretKey = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post('http://localhost:8000/api/auth/validate-secret', {
                email: youtuberEmailInput, secretKey
            }, {
                headers: { Authorization: token }
            });
            setYoutuberEmail(response.data.youtuber.username);
            closeModal();
        } catch (error) {
            console.error('Error validating secret key:', error);
            alert('Invalid email or secret key');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRawVideos = async () =>{
        try{
            setIsLoading(true);
            const response = await axios.get('http://localhost:8000/api/file/raw',{
                headers : {Authorization: token}
            });
            console.log(response.data);
            setRawVideos(response.data);
        }catch (e){
            console.error(e);
            alert("Could not fetch raw videos!")
        }finally {
            setIsLoading(false);
        }
    }

    const fetchEditedVideos =async () => {
        try{
            const response = await axios.get('http://localhost:8000/api/file/edited',{
                headers: { Authorization: token }
            });
            setEditedVideos(response.data);
        }catch (e) {
            console.log(e);
        }finally {
            setIsLoading(false);
        }
    }


    const downloadRawFile =async (url) => {
        try{
            const req = new Request(url);
            fetch(req).then(()=>{
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download','rawvideo.mp4');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
        }catch (e){
            console.log(e);
            alert('Error Downloading the video!');
        }
    };

    const handleFileChange = (e)=> {
        console.log("Selecting File ", e.target.files[0]);
        setSelectedFile(e.target.files[0]);
    }

    const handleSubmitVideo = async () => {
        try{
            if(!selectedFile){
                alert('Please select File!');
                return;
            }
            const formData = new FormData();
            formData.append('file',selectedFile);
            formData.append('upload_preset','editedvideo');
            const api = 'https://api.cloudinary.com/v1_1/djtrvplmk/video/upload';
            const cloudinaryRes = await axios.post(api,formData);

            const videoUrl = cloudinaryRes.data.secure_url;
            console.log(videoUrl);
            const apiRes = await axios.post('http://localhost:8000/api/file/save-edited',{
                filename : selectedFile.name,
                filePath : videoUrl
            },{
                headers : {Authorization : token}
            });
            console.log(apiRes.data);
            fetchEditedVideos();
            alert("Video Uploaded!");
            setSelectedFile(null);
        }catch (e){
            console.log(e);
            alert("Error uploading video!");
        }
    }

    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <nav className="bg-blue-500 px-12 py-4 flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold">Editor Dashboard</h1>
                <div>
                    {youtuberEmail ? (
                        <span className="text-white mr-4">{youtuberEmail}</span>
                    ) : (
                        <button onClick={openModal} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
                            Verify Secret Key
                        </button>
                    )}
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="mt-8 px-12 py-4">
                <div className="flex mb-4">
                    <button
                        onClick={() => setActiveTab('download')}
                        className={`mr-2 px-4 py-2 rounded ${activeTab === 'download' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Download Raw File
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 rounded ${activeTab === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Upload Edited File
                    </button>
                </div>

                {activeTab === 'download' && (
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl font-bold mb-4">Download Raw File</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rawVideos.map((video, index) => (
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
                                    <button
                                        onClick={() => downloadRawFile(video.filepath)}
                                        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                                    >
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>

                    </div>
                )}

                {activeTab === 'upload' && (
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl font-bold mb-4">Upload Edited File</h2>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                        <button
                            onClick={handleSubmitVideo}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Submit Video
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
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

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Verify Secret Key"
                ariaHideApp={false}  // Add this line
                style={{
                    content: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        outline: 'none'
                    },
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)'
                    }
                }}
            >
                <h2 className="text-2xl mb-4">Enter YouTuber's Email and Secret Key</h2>
                <input
                    type="email"
                    value={youtuberEmailInput}
                    onChange={handleYoutuberEmailChange}
                    placeholder="YouTuber's Email"
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <input
                    type="text"
                    value={secretKey}
                    onChange={handleSecretKeyChange}
                    placeholder="Secret Key"
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <button
                    onClick={validateSecretKey}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={isLoading}
                >
                    {isLoading ? 'Validating...' : 'Validate'}
                </button>
                <button
                    onClick={closeModal}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                >
                    Cancel
                </button>
            </Modal>
        </div>
    );
};

export default EditorHome;
