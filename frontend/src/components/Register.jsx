import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
    });

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Exclude confirmPassword from the formData sent to the backend\
        const dataToSend = {
            username : formData.username,
            email : formData.email,
            password : formData.password,
            role : formData.role
        }

        try {
            await axios.post('http://localhost:8000/api/auth/register',dataToSend);
            setSuccess(true);
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Create an account</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success ? (
                    <div>
                        <p className="text-green-500 mb-4">You are successfully registered!</p>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded transition duration-300 hover:bg-blue-600"
                            onClick={() => navigate('/login')}
                        >
                            Log in to your account
                        </button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit}>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={onChange}
                            placeholder="Username"
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            placeholder="name@company.com"
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
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={onChange}
                            placeholder="Confirm password"
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                            required
                        />
                        <div className="flex justify-between mb-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="role"
                                    value="Editor"
                                    checked={formData.role === 'Editor'}
                                    onChange={onChange}
                                    className="form-radio"
                                />
                                <span className="ml-2">I'm an Editor</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="role"
                                    value="YouTuber"
                                    checked={formData.role === 'YouTuber'}
                                    onChange={onChange}
                                    className="form-radio"
                                />
                                <span className="ml-2">I'm a YouTuber</span>
                            </label>
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    required
                                />
                                <span className="ml-2">I accept the <a href="#" className="text-blue-500 transition duration-300 hover:text-blue-600">Terms and Conditions</a></span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded transition duration-300 hover:bg-blue-600"
                        >
                            Create an account
                        </button>
                        <p className="mt-4 text-center">
                            Already have an account? <a href="/login" className="text-blue-500 transition duration-300 hover:text-blue-600">Login here</a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
