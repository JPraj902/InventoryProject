import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './pages/Sidebar';
import Dashboard from './pages/Dashboard';
import FunctionA from './pages/FunctionA';
import FunctionB from './pages/FunctionB';
import PCSEntryManagement from './pages/PCSEntryManagement';
import BagEntryManagement from './pages/BagEntryManagement';
import RoleManagement from './pages/RoleManagement';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      {/* Sidebar remains fixed */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      {/* Main content is scrollable */}
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/function-a" element={<FunctionA />} />
          <Route path="/pcs-entry" element={<PCSEntryManagement />} />
          <Route path="/bag-entry" element={<BagEntryManagement />} />
          <Route path="/function-b" element={<FunctionB />} />
          <Route path="/role-management" element={<RoleManagement />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
