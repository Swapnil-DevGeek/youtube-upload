import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import YouTuberHome from './components/YouTuber/YouTuberHome';
import EditorHome from './components/Editor/EditorHome';
import { jwtDecode } from 'jwt-decode';

const App = () => {
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedToken = jwtDecode(storedToken);
                return decodedToken.role;
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
            }
        }
        return '';
    });

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
            } catch (error) {
                console.error('Error decoding token:', error);
                setToken(null);
                setUserRole('');
                localStorage.removeItem('token');
            }
        } else {
            setUserRole('');
            localStorage.removeItem('token');
        }
    }, [token]);

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Register />} />
                    <Route path="/login" element={<Login setToken={setToken} setUserRole={setUserRole} />} />
                    <Route
                        path="/youtuber-home"
                        element={token && userRole === 'YouTuber' ? <YouTuberHome /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/editor-home"
                        element={token && userRole === 'Editor' ? <EditorHome /> : <Navigate to="/login" />}
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;