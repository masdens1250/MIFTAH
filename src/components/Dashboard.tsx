import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ModuleOverview from './ModuleOverview';
import AgentManager from './AgentManager';
import LogViewer from './LogViewer';
import SystemMetrics from './SystemMetrics';

interface DashboardProps {
  onLogout: () => void;
}

type ActiveModule = 'overview' | 'omega' | 'atlas' | 'prolitage' | 'agents' | 'logs' | 'metrics';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <ModuleOverview />;
      case 'agents':
        return <AgentManager />;
      case 'logs':
        return <LogViewer />;
      case 'metrics':
        return <SystemMetrics />;
      case 'omega':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">OMEGA Module</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-300">OMEGA reconnaissance module interface will be implemented here.</p>
            </div>
          </div>
        );
      case 'atlas':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">ATLAS Module</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-300">ATLAS mapping module interface will be implemented here.</p>
            </div>
          </div>
        );
      case 'prolitage':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">PROLITAGE Module</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-300">PROLITAGE analysis module interface will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return <ModuleOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      
      <div className="flex-1 flex flex-col">
        <Header onLogout={onLogout} systemTime={systemTime} />
        
        <main className="flex-1 overflow-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;