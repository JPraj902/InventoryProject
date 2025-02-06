import React from 'react';
import { useNavigate } from 'react-router-dom';

const FunctionA = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Entry Management</h1>
      <div className="flex justify-center space-x-4">
        <button 
          onClick={() => navigate('/pcs-entry')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          PCS Entry Management
        </button>
        <button 
          onClick={() => navigate('/bag-entry')}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
        >
          Bag Entry Management
        </button>
      </div>
    </div>
  );
};

export default FunctionA;