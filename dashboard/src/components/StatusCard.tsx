import { HealthStatus } from '../services/api';

interface StatusCardProps {
  health: HealthStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

function StatusCard({ health, loading, onRefresh }: StatusCardProps) {
  const isRunning = health?.status === 'running';

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="card status-card">
      <div className="card-header">
        <h3>System Status</h3>
        <button
          className={`refresh-btn ${loading ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>
      <div className="status-content">
        <div className="status-indicator">
          <div className={`status-dot ${isRunning ? 'running' : 'stopped'}`} />
          <span className="status-text">
            {loading ? 'Loading...' : isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
        {health && (
          <>
            <div className="status-info">
              <div className="info-row">
                <span className="label">Version</span>
                <span className="value">{health.version || '1.0.0'}</span>
              </div>
              <div className="info-row">
                <span className="label">Uptime</span>
                <span className="value">{formatUptime(health.uptime || 0)}</span>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s;
        }

        .card:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 0 30px rgba(0, 212, 170, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .refresh-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .refresh-btn svg {
          width: 18px;
          height: 18px;
        }

        .refresh-btn.spinning svg {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .status-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          animation: glow 2s ease-in-out infinite;
        }

        .status-dot.running {
          background: var(--success);
          box-shadow: 0 0 12px var(--success);
        }

        .status-dot.stopped {
          background: var(--error);
          box-shadow: 0 0 12px var(--error);
        }

        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .status-text {
          font-size: 20px;
          font-weight: 600;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .value {
          color: var(--text-primary);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default StatusCard;
