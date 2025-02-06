import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Users, Package, FileText, ArrowUpRight } from 'lucide-react';

const DashboardCard = ({ title, value, description, icon: Icon, trend }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-bold">{value}</h2>
            {trend && (
              <span className="flex items-center text-sm font-medium text-green-600">
                {trend}% <ArrowUpRight className="h-4 w-4 ml-1" />
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    pcsCount: 0,
    bagCount: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [pcsResponse, bagResponse] = await Promise.all([
          fetch('http://localhost:5000/api/pcs/count'),
          fetch('http://localhost:5000/api/bag/count'),
        ]);

        if (!pcsResponse.ok) throw new Error(`PCS API error: ${pcsResponse.status}`);
        if (!bagResponse.ok) throw new Error(`Bag API error: ${bagResponse.status}`);

        const [pcsData, bagData] = await Promise.all([
          pcsResponse.json(),
          bagResponse.json(),
        ]);

        setStats({
          pcsCount: pcsData.count || 0,
          bagCount: bagData.count || 0,
          activeUsers: 5, 
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total PCS Entries"
          value={stats.pcsCount}
          description="Total entries in the system"
          icon={Package}
        />
        <DashboardCard
          title="Total Bag Entries"
          value={stats.bagCount}
          description="Processed bag entries"
          icon={FileText}
        />
        <DashboardCard
          title="Active Users"
          value={stats.activeUsers}
          description="Users currently active"
          icon={Users}
        />
      </div>
    </div>
  );
};

export default Dashboard;
