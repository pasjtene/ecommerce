'use client';
import React, { useEffect, useState } from 'react';

const LoadingSpinner = () => {
    
    //const [loading, setLoading] = useState(true);
    
    return (
        <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        </div>
    );
};

export default LoadingSpinner;