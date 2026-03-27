/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Database, 
  Settings, 
  Cpu, 
  Network, 
  Shield, 
  HardDrive, 
  Zap, 
  ChevronRight, 
  Info,
  RefreshCw,
  Terminal,
  Lock,
  Wifi,
  AlertCircle,
  WifiOff,
  Smartphone,
  Globe,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type NodeMode = 'pruned' | 'full';

interface NodeStats {
  blockHeight: number;
  connections: number;
  uptime: string;
  cpuUsage: number;
  ramUsage: number;
  storageUsed: number; // in GB
  syncProgress: number; // 0 to 100
}

// --- Components ---

const StatCard = ({ icon: Icon, label, value, subValue, color = "var(--accent)" }: any) => (
  <div className="bg-[#1a1b1e] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} style={{ color }} />
      <span className="text-[10px] uppercase tracking-wider text-[#8E9299] font-medium">{label}</span>
    </div>
    <div className="text-xl font-mono font-bold tracking-tight">{value}</div>
    {subValue && <div className="text-[10px] text-[#8E9299] font-mono">{subValue}</div>}
  </div>
);

const ProgressBar = ({ progress, color = "var(--accent)" }: { progress: number, color?: string }) => (
  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="h-full"
      style={{ backgroundColor: color }}
    />
  </div>
);

export default function App() {
  const [mode, setMode] = useState<NodeMode>('pruned');
  const [isSyncing, setIsSyncing] = useState(true);
  const [stats, setStats] = useState<NodeStats>({
    blockHeight: 834521,
    connections: 8,
    uptime: "2d 14h 22m",
    cpuUsage: 12,
    ramUsage: 1.4,
    storageUsed: 4.2,
    syncProgress: 99.8
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'logs'>('status');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [runInBackground, setRunInBackground] = useState(true);
  const [torEnabled, setTorEnabled] = useState(false);
  const [kindnessMode, setKindnessMode] = useState(true);

  // Connection monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] Connection restored. Resuming sync...`, ...prev]);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] Connection lost. Syncing paused.`, ...prev]);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API
    const navConn = (navigator as any).connection;
    if (navConn) {
      setConnectionType(navConn.effectiveType || navConn.type || 'unknown');
      const updateConn = () => setConnectionType(navConn.effectiveType || navConn.type || 'unknown');
      navConn.addEventListener('change', updateConn);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        navConn.removeEventListener('change', updateConn);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!isOnline) {
      setIsSyncing(false);
      return;
    }
    
    setIsSyncing(true);
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        blockHeight: prev.blockHeight + (Math.random() > 0.9 ? 1 : 0),
        connections: Math.max(4, Math.min(32, prev.connections + (Math.random() > 0.5 ? 1 : -1))),
        cpuUsage: Math.max(5, Math.min(45, prev.cpuUsage + (Math.random() > 0.5 ? 2 : -2))),
        syncProgress: prev.syncProgress < 100 ? Math.min(100, prev.syncProgress + 0.001) : 100
      }));

      const newLog = `[${new Date().toLocaleTimeString()}] New block found: ${stats.blockHeight} | Peers: ${stats.connections}`;
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 5000);

    return () => clearInterval(interval);
  }, [stats.blockHeight, stats.connections]);

  const storageLimit = useMemo(() => mode === 'pruned' ? 5 : 600, [mode]);
  const storagePercent = useMemo(() => (stats.storageUsed / storageLimit) * 100, [stats.storageUsed, storageLimit]);

  const handleModeSwitch = (newMode: NodeMode) => {
    if (newMode === mode) return;
    
    // Simulate re-indexing/switching
    setIsSyncing(true);
    setMode(newMode);
    
    const switchLog = `[${new Date().toLocaleTimeString()}] Switching to ${newMode.toUpperCase()} mode. Re-configuring storage parameters...`;
    setLogs(prev => [switchLog, ...prev]);

    setTimeout(() => {
      setIsSyncing(false);
      if (newMode === 'full') {
        setStats(prev => ({ ...prev, syncProgress: 45.2, storageUsed: 280 }));
      } else {
        setStats(prev => ({ ...prev, syncProgress: 100, storageUsed: 4.2 }));
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto border-x border-white/5 bg-[#0c0d0e]">
      {/* Header */}
      <header className="p-6 border-bottom border-white/5 flex items-center justify-between sticky top-0 z-20 bg-[#0c0d0e]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F7931A] flex items-center justify-center shadow-[0_0_20px_rgba(247,147,26,0.3)]">
            <Zap size={24} color="white" fill="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">BitNode</h1>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[10px] uppercase tracking-widest text-[#8E9299] font-bold">
                {isSyncing ? 'Syncing' : 'Mainnet Online'}
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <RefreshCw size={20} className={isSyncing ? 'animate-spin text-[#F7931A]' : 'text-[#8E9299]'} />
        </button>
      </header>

      {/* Connection Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/20 border-b border-red-500/30 px-6 py-2 flex items-center gap-2 overflow-hidden"
          >
            <WifiOff size={14} className="text-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-200">Offline: Syncing Paused</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24">
        
        {/* Tab Navigation */}
        <div className="flex p-1 bg-white/5 rounded-xl mb-6">
          {(['status', 'config', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[11px] uppercase tracking-widest font-bold rounded-lg transition-all ${
                activeTab === tab ? 'bg-[#F7931A] text-white shadow-lg' : 'text-[#8E9299] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'status' && (
            <motion.div 
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Sync Progress */}
              <div className="bg-[#151619] rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8E9299] font-medium">Blockchain Sync</span>
                    <div className="text-2xl font-mono font-bold">{stats.syncProgress.toFixed(3)}%</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E9299] font-medium">Block Height</span>
                    <div className="text-sm font-mono text-[#F7931A]">{stats.blockHeight.toLocaleString()}</div>
                  </div>
                </div>
                <ProgressBar progress={stats.syncProgress} />
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  icon={Network} 
                  label="Peers" 
                  value={stats.connections} 
                  subValue="Inbound/Outbound"
                  color="#4ade80"
                />
                <StatCard 
                  icon={Activity} 
                  label="Uptime" 
                  value={stats.uptime} 
                  subValue="Since last restart"
                  color="#60a5fa"
                />
                <StatCard 
                  icon={Cpu} 
                  label="CPU Load" 
                  value={`${stats.cpuUsage}%`} 
                  subValue="ARMv8-A Optimized"
                  color="#f87171"
                />
                <StatCard 
                  icon={Database} 
                  label="Memory" 
                  value={`${stats.ramUsage} GB`} 
                  subValue="DDR4 Allocation"
                  color="#c084fc"
                />
              </div>

              {/* Storage Usage */}
              <div className="bg-[#151619] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive size={16} className="text-[#F7931A]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Storage Usage</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8E9299]">{stats.storageUsed} / {storageLimit} GB</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
                  <motion.div 
                    animate={{ width: `${storagePercent}%` }}
                    className="h-full bg-[#F7931A]"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-[#8E9299]">
                  <Info size={12} />
                  <span>{mode === 'pruned' ? 'Pruned mode active: Keeping last 550MB of blocks.' : 'Full node mode: Storing entire blockchain history.'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'config' && (
            <motion.div 
              key="config"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8E9299] font-bold px-1">Node Operation Mode</h3>
                
                {/* Pruned Mode Selection */}
                <button 
                  onClick={() => handleModeSwitch('pruned')}
                  className={`w-full p-5 rounded-2xl border text-left transition-all ${
                    mode === 'pruned' 
                    ? 'bg-[#F7931A]/10 border-[#F7931A] shadow-[0_0_20px_rgba(247,147,26,0.1)]' 
                    : 'bg-[#151619] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-xl ${mode === 'pruned' ? 'bg-[#F7931A] text-white' : 'bg-white/5 text-[#8E9299]'}`}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm">Pruned Node</div>
                        <p className="text-[11px] text-[#8E9299] mt-1 leading-relaxed">
                          Recommended for Android 11. Uses minimal storage (~5GB) by discarding old block data while maintaining security.
                        </p>
                      </div>
                    </div>
                    {mode === 'pruned' && <Shield size={16} className="text-[#F7931A]" />}
                  </div>
                </button>

                {/* Full Node Selection */}
                <button 
                  onClick={() => handleModeSwitch('full')}
                  className={`w-full p-5 rounded-2xl border text-left transition-all ${
                    mode === 'full' 
                    ? 'bg-[#F7931A]/10 border-[#F7931A] shadow-[0_0_20px_rgba(247,147,26,0.1)]' 
                    : 'bg-[#151619] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-xl ${mode === 'full' ? 'bg-[#F7931A] text-white' : 'bg-white/5 text-[#8E9299]'}`}>
                        <Database size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm">Full Node</div>
                        <p className="text-[11px] text-[#8E9299] mt-1 leading-relaxed">
                          Stores entire blockchain history (~600GB+). Requires high-capacity SD card or external storage. Best for maximum sovereignty.
                        </p>
                      </div>
                    </div>
                    {mode === 'full' && <Shield size={16} className="text-[#F7931A]" />}
                  </div>
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8E9299] font-bold px-1">Network & Persistence</h3>
                <div className="bg-[#151619] rounded-2xl border border-white/5 divide-y divide-white/5">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wifi size={16} className={isOnline ? "text-green-500" : "text-red-500"} />
                      <div>
                        <div className="text-sm font-medium">Connection Status</div>
                        <div className="text-[10px] text-[#8E9299] uppercase font-mono">{isOnline ? `Connected (${connectionType})` : 'Disconnected'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity size={16} className="text-[#8E9299]" />
                      <div>
                        <div className="text-sm font-medium">Run in Background</div>
                        <div className="text-[10px] text-[#8E9299]">Keep node active when app is minimized</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setRunInBackground(!runInBackground)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${runInBackground ? 'bg-[#F7931A]' : 'bg-white/10'}`}
                    >
                      <motion.div 
                        animate={{ x: runInBackground ? 22 : 4 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full" 
                      />
                    </button>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RefreshCw size={16} className="text-[#8E9299]" />
                      <div>
                        <div className="text-sm font-medium">Auto-Reconnect</div>
                        <div className="text-[10px] text-[#8E9299]">Retry connection every 30s when offline</div>
                      </div>
                    </div>
                    <div className="w-10 h-5 bg-[#F7931A] rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8E9299] font-bold px-1">Security Settings</h3>
                <div className="bg-[#151619] rounded-2xl border border-white/5 divide-y divide-white/5">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wifi size={16} className="text-[#8E9299]" />
                      <span className="text-sm font-medium">Listen for Peers</span>
                    </div>
                    <div className="w-10 h-5 bg-[#F7931A] rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock size={16} className={torEnabled ? "text-[#F7931A]" : "text-[#8E9299]"} />
                      <div>
                        <div className="text-sm font-medium">Tor Network (Onion)</div>
                        <div className="text-[10px] text-[#8E9299]">Route traffic through Tor for privacy</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setTorEnabled(!torEnabled);
                        setLogs(prev => [`[${new Date().toLocaleTimeString()}] Tor Network ${!torEnabled ? 'Enabled' : 'Disabled'}. Restarting proxy...`, ...prev]);
                      }}
                      className={`w-10 h-5 rounded-full relative transition-colors ${torEnabled ? 'bg-[#F7931A]' : 'bg-white/10'}`}
                    >
                      <motion.div 
                        animate={{ x: torEnabled ? 22 : 4 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full" 
                      />
                    </button>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart size={16} className={kindnessMode ? "text-pink-500" : "text-[#8E9299]"} />
                      <div>
                        <div className="text-sm font-medium">Kindness Mode</div>
                        <div className="text-[10px] text-[#8E9299]">Auto-share blocks with low-bandwidth peers</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setKindnessMode(!kindnessMode)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${kindnessMode ? 'bg-pink-500' : 'bg-white/10'}`}
                    >
                      <motion.div 
                        animate={{ x: kindnessMode ? 22 : 4 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full" 
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3">
                <AlertCircle size={18} className="text-yellow-500 shrink-0" />
                <p className="text-[10px] text-yellow-200/80 leading-normal">
                  Running a full node on mobile may significantly impact battery life and data usage. Ensure device is connected to power and unmetered Wi-Fi.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0c0d0e] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[60vh]"
            >
              <div className="bg-white/5 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-[#F7931A]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Debug Console</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
              </div>
              <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto space-y-1.5 text-[#8E9299]">
                {logs.map((log, i) => (
                  <div key={i} className={i === 0 ? 'text-white' : ''}>
                    <span className="text-[#F7931A] mr-2">➜</span>
                    {log}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Style) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-[#0c0d0e]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-30">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'status' ? 'text-[#F7931A]' : 'text-[#8E9299]'}`}
        >
          <Activity size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Node</span>
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'config' ? 'text-[#F7931A]' : 'text-[#8E9299]'}`}
        >
          <Settings size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Setup</span>
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'logs' ? 'text-[#F7931A]' : 'text-[#8E9299]'}`}
        >
          <Terminal size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Logs</span>
        </button>
      </nav>

      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F7931A] opacity-[0.03] blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#60a5fa] opacity-[0.03] blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
