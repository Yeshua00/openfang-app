import { Hand } from '../services/api';

interface HandsPanelProps {
  hands: Hand[];
  onActivate: (name: string) => void;
  onDeactivate: (name: string) => void;
  loading: boolean;
}

function HandsPanel({ hands, onActivate, onDeactivate, loading }: HandsPanelProps) {
  const activeHands = hands.filter(h => h.active);

  return (
    <div className="card hands-panel">
      <div className="card-header">
        <h3>Active Hands</h3>
        <div className="hands-count">
          <span className="count">{activeHands.length}</span>
          <span className="total">/ {hands.length}</span>
        </div>
      </div>
      <div className="hands-list">
        {hands.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8" />
            </svg>
            <p>No hands available</p>
          </div>
        ) : (
          hands.map((hand) => (
            <div key={hand.name} className={`hand-item ${hand.active ? 'active' : ''}`}>
              <div className="hand-info">
                <div className="hand-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 11V6a2 2 0 00-2-2 2 2 0 00-2 2v0M14 10V4a2 2 0 00-2-2 2 2 0 00-2 2v2M10 10.5V6a2 2 0 00-2-2 2 2 0 00-2 2v8" />
                    <path d="M18 8a2 2 0 114 0v6a8 8 0 01-8 8h-2c-2.5 0-3.5-.5-5-2l-3.5-3.5a2 2 0 112.83-2.83L10 18" />
                  </svg>
                </div>
                <div className="hand-details">
                  <span className="hand-name">{hand.name}</span>
                  <span className="hand-status">{hand.status || 'idle'}</span>
                </div>
              </div>
              <button
                className={`hand-toggle ${hand.active ? 'active' : ''}`}
                onClick={() => hand.active ? onDeactivate(hand.name) : onActivate(hand.name)}
                disabled={loading}
              >
                {hand.active ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                )}
              </button>
            </div>
          ))
        )}
      </div>
      <style>{`
        .hands-panel {
          grid-column: span 2;
        }

        @media (max-width: 900px) {
          .hands-panel {
            grid-column: span 1;
          }
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

        .hands-count {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .hands-count .count {
          font-size: 24px;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .hands-count .total {
          font-size: 14px;
          color: var(--text-muted);
        }

        .hands-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: var(--text-muted);
        }

        .empty-state svg {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .hand-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          transition: all 0.2s;
        }

        .hand-item:hover {
          background: var(--bg-card-hover);
        }

        .hand-item.active {
          border-color: var(--accent-primary);
          background: rgba(0, 212, 170, 0.05);
        }

        .hand-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hand-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border-radius: 10px;
          color: var(--text-secondary);
        }

        .hand-item.active .hand-icon {
          background: var(--accent-primary);
          color: var(--bg-primary);
        }

        .hand-icon svg {
          width: 20px;
          height: 20px;
        }

        .hand-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hand-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .hand-status {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .hand-toggle {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .hand-toggle:hover:not(:disabled) {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .hand-toggle.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: var(--bg-primary);
        }

        .hand-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hand-toggle svg {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </div>
  );
}

export default HandsPanel;
