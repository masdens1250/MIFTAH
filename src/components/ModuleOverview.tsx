import React from 'react';
import { Target, Map, Zap, Users, Shield, Activity, TrendingUp, Server } from 'lucide-react';

const ModuleOverview: React.FC = () => {
  const modules = [
    {
      id: 'omega',
      name: 'OMEGA',
      description: 'Reconnaissance & Intelligence',
      icon: Target,
      status: 'active',
      usage: '73%',
      color: 'text-blue-400'
    },
    {
      id: 'atlas',
      name: 'ATLAS',
      description: 'Network Mapping',
      icon: Map,
      status: 'active',
      usage: '45%',
      color: 'text-green-400'
    },
    {
      id: 'prolitage',
      name: 'PROLITAGE',
      description: 'Advanced Analysis',
      icon: Zap,
      status: 'standby',
      usage: '12%',
      color: 'text-yellow-400'
    }
  ];

  const systemStats = [
    { label: 'Active Agents', value: '24', icon: Users, trend: '+3' },
    { label: 'Security Level', value: 'HIGH', icon: Shield, trend: '↑' },
    { label: 'System Load', value: '43%', icon: Activity, trend: '-5%' },
    { label: 'Uptime', value: '99.7%', icon: Server, trend: '↑' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">System Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Activity className="w-4 h-4 text-green-400" />
          <span>All systems operational</span>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-cyan-400" />
                <span className="text-sm text-green-400 font-mono">{stat.trend}</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Modules */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Core Modules</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${module.color}`} />
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      module.status === 'active' ? 'bg-green-400' : 
                      module.status === 'standby' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-400 uppercase">{module.status}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{module.name}</h4>
                    <p className="text-sm text-gray-400">{module.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Usage</span>
                      <span className="text-white font-mono">{module.usage}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          module.status === 'active' ? 'bg-cyan-500' : 'bg-gray-500'
                        }`}
                        style={{ width: module.usage }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 space-y-4">
            {[
              { time: '14:32:15', action: 'OMEGA reconnaissance scan completed', status: 'success' },
              { time: '14:29:43', action: 'New agent connected: AGT-7841', status: 'info' },
              { time: '14:25:17', action: 'ATLAS network mapping in progress', status: 'progress' },
              { time: '14:20:02', action: 'Security scan completed - No threats detected', status: 'success' },
              { time: '14:15:38', action: 'System backup initiated', status: 'info' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 py-2">
                <div className="text-xs font-mono text-gray-400 w-20">{activity.time}</div>
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'progress' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>
                <div className="text-sm text-gray-300 flex-1">{activity.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleOverview;