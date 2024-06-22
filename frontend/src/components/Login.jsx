import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const Login = ({ setToken, setUserRole }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/auth/login', formData);
            const token = res.data.token;
            localStorage.setItem('token', token); // Save token to localStorage
            setToken(token);
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.role);
            if (decodedToken.role === 'YouTuber') {
                navigate('/youtuber-home');
            } else {
                navigate('/editor-home');
            }
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={onSubmit}>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="Email"
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        placeholder="Password"
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded transition duration-300 hover:bg-blue-600"
                    >
                        Login
                    </button>
                    <p className="mt-4 text-center">
                        Don't have an account? <a href="/register" className="text-blue-500 transition duration-300 hover:text-blue-600">Register here</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
