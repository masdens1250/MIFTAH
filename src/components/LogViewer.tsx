import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, RefreshCw } from 'lucide-react';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Simulate log generation
    const generateLogs = () => {
      const logTypes = ['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'DEBUG'];
      const modules = ['OMEGA', 'ATLAS', 'PROLITAGE', 'SECURITY', 'SYSTEM'];
      const messages = [
        'Reconnaissance scan completed successfully',
        'Network mapping in progress',
        'Agent connection established',
        'Security check passed',
        'Database backup completed',
        'Encryption key rotated',
        'Target acquired',
        'Analysis complete',
        'Connection timeout detected',
        'System integrity verified'
      ];

      const newLog = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        level: logTypes[Math.floor(Math.random() * logTypes.length)],
        module: modules[Math.floor(Math.random() * modules.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        encrypted: Math.random() > 0.7
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
    };

    // Generate initial logs
    for (let i = 0; i < 20; i++) {
      setTimeout(generateLogs, i * 100);
    }

    const interval = autoRefresh ? setInterval(generateLogs, 3000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level.toLowerCase() === filter.toLowerCase();
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.module.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-400 bg-red-400/10';
      case 'WARNING': return 'text-yellow-400 bg-yellow-400/10';
      case 'SUCCESS': return 'text-green-400 bg-green-400/10';
      case 'INFO': return 'text-blue-400 bg-blue-400/10';
      case 'DEBUG': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-3xl font-bold text-white">System Logs</h2>
            <p className="text-gray-400">Real-time encrypted log monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'text-green-400 bg-green-400/10' : 'text-gray-400 bg-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="debug">Debug</option>
          </select>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['ERROR', 'WARNING', 'INFO', 'SUCCESS', 'DEBUG'].map(level => {
          const count = logs.filter(log => log.level === level).length;
          return (
            <div key={level} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">{level}</div>
              <div className="text-xl font-bold text-white">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Log List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <div className="text-sm text-gray-400">
            {filteredLogs.length} entries
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-start justify-between space-x-4">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="text-xs font-mono text-gray-400 w-20 flex-shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  
                  <span className="text-xs text-cyan-400 font-mono flex-shrink-0">
                    {log.module}
                  </span>
                  
                  <span className="text-sm text-gray-300 min-w-0">
                    {log.encrypted ? '🔒 [ENCRYPTED] ' : ''}{log.message}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogViewer;