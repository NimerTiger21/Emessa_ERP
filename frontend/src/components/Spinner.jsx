import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const Spinner = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-white bg-opacity-80 fixed top-0 left-0 right-0 bottom-0 z-50">
            <ClipLoader color="#3498db" size={60} />
            <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
    );
};

export default Spinner;
