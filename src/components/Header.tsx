import React from 'react';
import { LogOut, Bell, Settings, User } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  systemTime: Date;
}

const Header: React.FC<HeaderProps> = ({ onLogout, systemTime }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Command Center</h2>
          <div className="h-6 w-px bg-gray-600"></div>
          <div className="text-sm text-gray-400 font-mono">
            {systemTime.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-600"></div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">Admin</span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;