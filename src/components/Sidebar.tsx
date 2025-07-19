import React from 'react';
import { Shield, Activity, Users, FileText, BarChart3, Target, Map, Zap, Home } from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'omega', label: 'OMEGA', icon: Target },
    { id: 'atlas', label: 'ATLAS', icon: Map },
    { id: 'prolitage', label: 'PROLITAGE', icon: Zap },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-white">MIFTAH</h1>
            <p className="text-xs text-gray-400 font-mono">v1.0.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Core Modules
          </h3>
          <div className="space-y-1">
            {menuItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Management
          </h3>
          <div className="space-y-1">
            {menuItems.slice(4).map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Activity className="w-4 h-4 text-green-400" />
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;