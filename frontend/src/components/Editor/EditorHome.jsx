// src/components/EditorHome.jsx
import React from 'react';
import {Navigate} from "react-router-dom";

const EditorHome = ({token,setToken}) => {
    if (!token) {
        return <Navigate to="/login" />;
    }
    return (
        <>
            <h1>Welcome to Editor Home Page</h1>
        </>
    )
};

export default EditorHome;
