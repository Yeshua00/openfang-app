import { useState, useEffect, useCallback } from 'react';
import { apiService, HealthStatus, Hand } from './services/api';
import StatusCard from './components/StatusCard';
import HandsPanel from './components/HandsPanel';
import ControlPanel from './components/ControlPanel';
import SettingsPanel from './components/SettingsPanel';
import ZoomWrapper from './components/ZoomWrapper';

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [hands, setHands] = useState<Hand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!apiService.getApiKey()) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const [healthData, handsData] = await Promise.all([
        apiService.getHealth(),
        apiService.getHands(),
      ]);
      setHealth(healthData);
      setHands(handsData.hands || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setHealth(null);
      setHands([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleApiKeySet = () => {
    setLoading(true);
    fetchData();
  };

  const handleStart = async () => {
    try {
      await apiService.startOpenFang();
      handleRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start');
    }
  };

  const handleStop = async () => {
    try {
      await apiService.stopOpenFang();
      handleRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop');
    }
  };

  const handleActivateHand = async (name: string) => {
    try {
      await apiService.activateHand(name);
      handleRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate hand');
    }
  };

  const handleDeactivateHand = async (name: string) => {
    try {
      await apiService.deactivateHand(name);
      handleRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate hand');
    }
  };

  return (
    <ZoomWrapper>
      <div className="dashboard">
        <header className="header">
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 512 512">
              <defs>
                <linearGradient id="fangGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D4AA"/>
                  <stop offset="100%" stopColor="#00A8CC"/>
                </linearGradient>
              </defs>
              <path d="M256 32L470 143V369L256 480L42 369V143L256 32Z" 
                    fill="none" stroke="url(#fangGrad)" strokeWidth="16"/>
              <path d="M256 80L426 167V345L256 432L86 345V167L256 80Z" 
                    fill="url(#fangGrad)" opacity="0.2"/>
              <g transform="translate(256, 230)">
                <path d="M-50 -40 L-40 -65 L-15 -40 L0 -55 L15 -40 L40 -65 L50 -40 
                         L40 10 L50 40 L25 50 L0 65 L-25 50 L-50 40 L-40 10 Z" 
                      fill="url(#fangGrad)"/>
                <ellipse cx="-18" cy="-8" rx="8" ry="10" fill="#1a1a2e"/>
                <ellipse cx="18" cy="-8" rx="8" ry="10" fill="#1a1a2e"/>
                <circle cx="-14" cy="-11" r="3" fill="white"/>
                <circle cx="22" cy="-11" r="3" fill="white"/>
                <path d="M-8 20 L0 28 L8 20 Z" fill="#1a1a2e"/>
              </g>
            </svg>
            <h1>OpenFang</h1>
          </div>
          <button
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </button>
        </header>

        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            onApiKeySet={handleApiKeySet}
          />
        )}

        <main className="main-content">
          {!apiService.getApiKey() ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <svg viewBox="0 0 512 512">
                  <defs>
                    <linearGradient id="fangGradW" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00D4AA"/>
                      <stop offset="100%" stopColor="#00A8CC"/>
                    </linearGradient>
                  </defs>
                  <path d="M256 32L470 143V369L256 480L42 369V143L256 32Z" 
                        fill="none" stroke="url(#fangGradW)" strokeWidth="20"/>
                  <path d="M256 80L426 167V345L256 432L86 345V167L256 80Z" 
                        fill="url(#fangGradW)" opacity="0.2"/>
                  <g transform="translate(256, 230)">
                    <path d="M-50 -40 L-40 -65 L-15 -40 L0 -55 L15 -40 L40 -65 L50 -40 
                             L40 10 L50 40 L25 50 L0 65 L-25 50 L-50 40 L-40 10 Z" 
                          fill="url(#fangGradW)"/>
                    <ellipse cx="-18" cy="-8" rx="8" ry="10" fill="#1a1a2e"/>
                    <ellipse cx="18" cy="-8" rx="8" ry="10" fill="#1a1a2e"/>
                    <circle cx="-14" cy="-11" r="3" fill="white"/>
                    <circle cx="22" cy="-11" r="3" fill="white"/>
                    <path d="M-8 20 L0 28 L8 20 Z" fill="#1a1a2e"/>
                  </g>
                </svg>
              </div>
              <h2>Welcome to OpenFang</h2>
              <p>AI Gateway Dashboard • Port 4200</p>
              <button
                className="primary-btn"
                onClick={() => setShowSettings(true)}
              >
                Configure API Key
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="error-banner">
                  <span>{error}</span>
                  <button onClick={() => setError(null)}>×</button>
                </div>
              )}

              <div className="dashboard-grid">
                <StatusCard
                  health={health}
                  loading={loading || isRefreshing}
                  onRefresh={handleRefresh}
                />
                <ControlPanel
                  status={health?.status}
                  onStart={handleStart}
                  onStop={handleStop}
                  loading={loading || isRefreshing}
                />
                <HandsPanel
                  hands={hands}
                  onActivate={handleActivateHand}
                  onDeactivate={handleDeactivateHand}
                  loading={loading || isRefreshing}
                />
              </div>
            </>
          )}
        </main>

        <style>{`
          .dashboard {
            min-height: 100vh;
            padding: 24px;
            background: 
              radial-gradient(ellipse at 20% 20%, rgba(0, 212, 170, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(0, 168, 204, 0.05) 0%, transparent 50%),
              var(--bg-primary);
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .logo-icon {
            width: 40px;
            height: 40px;
            color: var(--accent-primary);
          }

          .logo h1 {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .settings-btn {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .settings-btn:hover {
            background: var(--bg-card-hover);
            color: var(--accent-primary);
            border-color: var(--accent-primary);
          }

          .settings-btn svg {
            width: 20px;
            height: 20px;
          }

          .main-content {
            max-width: 1400px;
            margin: 0 auto;
          }

          .welcome-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            text-align: center;
          }

          .welcome-icon {
            width: 120px;
            height: 120px;
            color: var(--accent-primary);
            margin-bottom: 24px;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }

          .welcome-screen h2 {
            font-size: 28px;
            margin-bottom: 8px;
            color: var(--text-primary);
          }

          .welcome-screen p {
            color: var(--text-secondary);
            margin-bottom: 24px;
          }

          .primary-btn {
            padding: 12px 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: var(--bg-primary);
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }

          .primary-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px var(--accent-glow);
          }

          .error-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: rgba(255, 68, 102, 0.1);
            border: 1px solid var(--error);
            border-radius: 8px;
            margin-bottom: 24px;
            color: var(--error);
          }

          .error-banner button {
            background: none;
            border: none;
            color: var(--error);
            font-size: 20px;
            cursor: pointer;
            padding: 0 8px;
          }

          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 24px;
          }
        `}</style>
      </div>
    </ZoomWrapper>
  );
}

export default App;
