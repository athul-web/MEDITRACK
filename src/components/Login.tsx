import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bpm, setBpm] = useState(72);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(71 + Math.floor(Math.random() * 4));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Dark Panel with Animated Live ECG Monitor */}
      <div className="left-panel">
        {/* Faint Large Caduceus Background Graphic */}
        <svg className="medical-bg-graphic" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1">
          <path d="M12 2v20M17 5H7M19 9H5M21 13H3M17 17H7"></path>
          <circle cx="12" cy="12" r="9"></circle>
        </svg>

        <div>
          {/* Top Medical Logo Icon */}
          <div className="logo-box">
            <svg viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>

          <div className="left-content">
            <h1>Sign in to your clinical portal.</h1>
            <p>Monitor equipment status, track live biomedical work orders, and manage fleet maintenance.</p>
          </div>

          {/* Live Animated ECG Card Component */}
          <div className="ecg-monitor-card">
            <div className="ecg-grid"></div>

            <div className="ecg-header">
              <span className="ecg-label">Lead II • Live Telemetry</span>
              <div className="bpm-container">
                <span className="bpm-val">{bpm}</span>
                <span className="bpm-unit">BPM</span>
              </div>
            </div>

            <div className="ecg-svg-container">
              <svg className="ecg-svg" viewBox="0 0 500 100" preserveAspectRatio="none">
                <defs>
                  <path id="ecgPath" d="
                                      M 0 50
                                      L 60 50
                                      L 70 45
                                      L 80 50
                                      L 95 50
                                      L 102 60
                                      L 110 10
                                      L 120 85
                                      L 128 50
                                      L 145 50
                                      L 160 38
                                      L 175 50
                                      L 250 50
                                      L 260 45
                                      L 270 50
                                      L 285 50
                                      L 292 60
                                      L 300 10
                                      L 310 85
                                      L 318 50
                                      L 335 50
                                      L 350 38
                                      L 365 50
                                      L 500 50" />
                </defs>
                <use href="#ecgPath" className="ecg-base-line" />
                <use href="#ecgPath" className="ecg-glow-line" />
                <use href="#ecgPath" className="ecg-animated-line" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="footer-stats">
          <div>
            <div className="status-badge">
              <span className="status-dot"></span>
              99.98% System Uptime
            </div>
            <div className="stat-subtext">All clinical networks operational</div>
          </div>
          <div>
            <div className="stat-value">11 / 12</div>
            <div className="stat-subtext">Active Fleet Devices</div>
          </div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="right-panel">
        <div className="form-container">
          <div className="form-header">
            <h2>Sign in</h2>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  placeholder="jane.doe@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="passwordInput">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="passwordInput"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle Password Visibility"
                >
                  {!showPassword ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.17c0-1.66-1.34-3-3-3l-.17.02z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-label">
                <input type="checkbox" defaultChecked />
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="security-note">Your connection is encrypted end-to-end.</p>
        </div>
      </div>
    </div>
  );
}
