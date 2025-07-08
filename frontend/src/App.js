import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import WebsiteBuilder from './components/WebsiteBuilder';
import LogoGenerator from './components/LogoGenerator';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('builder');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DndProvider backend={HTML5Backend}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WB</span>
                </div>
                <h1 className="text-xl font-semibold text-slate-900">
                  AI Website Builder
                </h1>
              </div>
              
              {/* Mobile indicator */}
              {isMobile && (
                <div className="flex items-center space-x-2 bg-primary-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-xs text-primary-700 font-medium">Mobile Optimized</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('builder')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'builder'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                🏗️ Website Builder
              </button>
              <button
                onClick={() => setActiveTab('logo')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'logo'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                🎨 Logo Generator
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'builder' && <WebsiteBuilder />}
          {activeTab === 'logo' && <LogoGenerator />}
        </main>
      </DndProvider>
    </div>
  );
}

export default App;