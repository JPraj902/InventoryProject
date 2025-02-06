import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Users } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-white">Inventory System</h2>
      </div>
      <nav className="mt-4 space-y-1">
        <SidebarLink to="/dashboard" Icon={LayoutDashboard} label="Dashboard" />
        <SidebarLink to="/function-a" Icon={Package} label="Function A" />
        <SidebarLink to="/function-b" Icon={FileText} label="Function B" />
        <SidebarLink to="/role-management" Icon={Users} label="Role Management" />
      </nav>
    </aside>
  );
};

const SidebarLink = ({ to, Icon, label }) => (
  <Link
    to={to}
    className="submenu-item flex items-center p-3 rounded-lg text-white hover:bg-opacity-80 transition"
  >
    <Icon className="mr-3" /> {label}
  </Link>
);

export default Sidebar;