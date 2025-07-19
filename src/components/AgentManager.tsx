import React, { useState } from 'react';
import { Users, Plus, MoreVertical, Activity, MapPin, Clock, Shield } from 'lucide-react';

const AgentManager: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'AGT-7841',
      name: 'Phoenix',
      status: 'active',
      location: 'Paris, FR',
      lastSeen: '2 min ago',
      tasks: 3,
      type: 'reconnaissance'
    },
    {
      id: 'AGT-9203',
      name: 'Cipher',
      status: 'active',
      location: 'London, UK',
      lastSeen: '5 min ago',
      tasks: 1,
      type: 'infiltration'
    },
    {
      id: 'AGT-5567',
      name: 'Ghost',
      status: 'standby',
      location: 'Berlin, DE',
      lastSeen: '1 hour ago',
      tasks: 0,
      type: 'surveillance'
    },
    {
      id: 'AGT-3421',
      name: 'Shadow',
      status: 'offline',
      location: 'Unknown',
      lastSeen: '3 hours ago',
      tasks: 0,
      type: 'extraction'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'standby': return 'text-yellow-400 bg-yellow-400/10';
      case 'offline': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reconnaissance': return '🔍';
      case 'infiltration': return '🥷';
      case 'surveillance': return '👁️';
      case 'extraction': return '📤';
      default: return '🤖';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-3xl font-bold text-white">Agent Manager</h2>
            <p className="text-gray-400">Manage and monitor field agents</p>
          </div>
        </div>
        
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Deploy Agent</span>
        </button>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">1</div>
              <div className="text-sm text-gray-400">Standby</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-white">1</div>
              <div className="text-sm text-gray-400">Offline</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Active Agents</h3>
        </div>
        
        <div className="divide-y divide-gray-700">
          {agents.map((agent) => (
            <div 
              key={agent.id}
              className={`p-6 hover:bg-gray-700/50 transition-colors cursor-pointer ${
                selectedAgent === agent.id ? 'bg-gray-700/50' : ''
              }`}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTypeIcon(agent.type)}</div>
                  
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-white">{agent.name}</h4>
                      <span className="text-sm text-gray-400 font-mono">{agent.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{agent.location}</span>
                      </div>
                      <span>•</span>
                      <span>Last seen: {agent.lastSeen}</span>
                      <span>•</span>
                      <span>{agent.tasks} active tasks</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-400 capitalize">{agent.type}</div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {selectedAgent === agent.id && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Deployment Time</div>
                      <div className="text-white font-mono">14:32:15 UTC</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Mission Type</div>
                      <div className="text-white capitalize">{agent.type}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Security Level</div>
                      <div className="text-green-400">ENCRYPTED</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentManager;