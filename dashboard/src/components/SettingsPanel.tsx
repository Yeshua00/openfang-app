import { useState } from 'react';
import { apiService } from '../services/api';

interface SettingsPanelProps {
  onClose: () => void;
  onApiKeySet: () => void;
}

function SettingsPanel({ onClose, onApiKeySet }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState(apiService.getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    apiService.setApiKey(apiKey);
    setTimeout(() => {
      onApiKeySet();
      onClose();
      setSaving(false);
    }, 300);
  };

  const handleClear = () => {
    apiService.clearApiKey();
    setApiKey('');
    onApiKeySet();
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="panel-content">
          <div className="setting-group">
            <label>API Key</label>
            <div className="api-input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Bearer token..."
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p className="setting-hint">
              Bearer token for authentication with OpenFang API
            </p>
          </div>
          <div className="server-info">
            <div className="info-item">
              <span className="label">Server</span>
              <span className="value">localhost:50051</span>
            </div>
          </div>
        </div>
        <div className="panel-footer">
          {apiKey && (
            <button className="clear-btn" onClick={handleClear}>
              Clear
            </button>
          )}
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <style>{`
        .settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .settings-panel {
          width: 100%;
          max-width: 420px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .close-btn svg {
          width: 18px;
          height: 18px;
        }

        .panel-content {
          padding: 24px;
        }

        .setting-group {
          margin-bottom: 24px;
        }

        .setting-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .api-input-wrapper {
          position: relative;
          display: flex;
        }

        .api-input-wrapper input {
          width: 100%;
          padding: 12px 48px 12px  background: var(--bg-secondary);
         16px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          font-family: monospace;
        }

        .api-input-wrapper input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .api-input-wrapper input::placeholder {
          color: var(--text-muted);
        }

        .toggle-visibility {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-visibility:hover {
          color: var(--text-secondary);
        }

        .toggle-visibility svg {
          width: 18px;
          height: 18px;
        }

        .setting-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .server-info {
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .info-item .label {
          color: var(--text-secondary);
        }

        .info-item .value {
          color: var(--text-primary);
          font-family: monospace;
        }

        .panel-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
        }

        .save-btn, .clear-btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: var(--bg-primary);
          border: none;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px var(--accent-glow);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .clear-btn {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .clear-btn:hover {
          border-color: var(--error);
          color: var(--error);
        }
      `}</style>
    </div>
  );
}

export default SettingsPanel;
