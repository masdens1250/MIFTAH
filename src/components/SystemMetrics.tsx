import React, { useState, useEffect } from 'react';
import { BarChart3, Cpu, HardDrive, Wifi, TrendingUp } from 'lucide-react';

const SystemMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    storage: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
        storage: Math.floor(Math.random() * 100)
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        <span className="text-sm text-gray-400">{title}</span>
      </div>
      
      <div className="space-y-3">
        <div className="text-3xl font-bold text-white">{value}%</div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-3xl font-bold text-white">System Metrics</h2>
            <p className="text-gray-400">Real-time performance monitoring</p>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Usage"
          value={metrics.cpu}
          icon={Cpu}
          color="text-blue-400"
        />
        <MetricCard
          title="Memory"
          value={metrics.memory}
          icon={HardDrive}
          color="text-green-400"
        />
        <MetricCard
          title="Network"
          value={metrics.network}
          icon={Wifi}
          color="text-purple-400"
        />
        <MetricCard
          title="Storage"
          value={metrics.storage}
          icon={TrendingUp}
          color="text-orange-400"
        />
      </div>

      {/* Performance History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
          <div className="space-y-4">
            {[
              { time: '15:00', cpu: 45, memory: 67, network: 23 },
              { time: '15:05', cpu: 52, memory: 71, network: 34 },
              { time: '15:10', cpu: 38, memory: 69, network: 28 },
              { time: '15:15', cpu: 61, memory: 73, network: 45 },
              { time: '15:20', cpu: 43, memory: 68, network: 31 }
            ].map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-mono w-12">{entry.time}</span>
                <div className="flex space-x-4 flex-1 ml-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">CPU: {entry.cpu}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">MEM: {entry.memory}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">NET: {entry.network}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Security Status</h3>
          <div className="space-y-4">
            {[
              { service: 'Firewall', status: 'Active', color: 'text-green-400' },
              { service: 'Encryption', status: 'Enabled', color: 'text-green-400' },
              { service: 'VPN Tunnel', status: 'Connected', color: 'text-green-400' },
              { service: 'Intrusion Detection', status: 'Monitoring', color: 'text-blue-400' },
              { service: 'Access Control', status: 'Enforced', color: 'text-green-400' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300">{item.service}</span>
                <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Network Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">2.4 GB</div>
            <div className="text-sm text-gray-400">Data Transmitted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">1.8 GB</div>
            <div className="text-sm text-gray-400">Data Received</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">47</div>
            <div className="text-sm text-gray-400">Active Connections</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;