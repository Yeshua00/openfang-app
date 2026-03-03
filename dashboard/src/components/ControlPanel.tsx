interface ControlPanelProps {
  status: string | undefined;
  onStart: () => void;
  onStop: () => void;
  loading: boolean;
}

function ControlPanel({ status, onStart, onStop, loading }: ControlPanelProps) {
  const isRunning = status === 'running';

  return (
    <div className="card control-panel">
      <div className="card-header">
        <h3>Controls</h3>
      </div>
      <div className="controls">
        <button
          className={`control-btn start ${isRunning ? 'disabled' : ''}`}
          onClick={onStart}
          disabled={loading || isRunning}
        >
          <div className="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span>Start OpenFang</span>
        </button>
        <button
          className={`control-btn stop ${!isRunning ? 'disabled' : ''}`}
          onClick={onStop}
          disabled={loading || !isRunning}
        >
          <div className="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </div>
          <span>Stop OpenFang</span>
        </button>
      </div>
      <style>{`
        .control-panel .card-header {
          margin-bottom: 20px;
        }

        .control-panel .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .controls {
          display: flex;
          gap: 12px;
        }

        .control-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .control-btn.start:hover:not(:disabled) {
          border-color: var(--success);
          background: rgba(0, 212, 170, 0.1);
        }

        .control-btn.start:hover:not(:disabled) .btn-icon {
          background: var(--success);
          color: var(--bg-primary);
        }

        .control-btn.stop:hover:not(:disabled) {
          border-color: var(--error);
          background: rgba(255, 68, 102, 0.1);
        }

        .control-btn.stop:hover:not(:disabled) .btn-icon {
          background: var(--error);
          color: white;
        }

        .control-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .control-btn.disabled:hover {
          transform: none;
        }

        .btn-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-icon svg {
          width: 24px;
          height: 24px;
        }
      `}</style>
    </div>
  );
}

export default ControlPanel;
