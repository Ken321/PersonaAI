import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import LoginPage from './src/LoginPage';
import PluginConnectPage from './src/PluginConnectPage';

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <Loader2 size={28} className="animate-spin text-[#1e88e5]" />
    </div>
  );
}

export default function App() {
  // savedUser があれば即座に表示（オプティミスティック認証）
  const getSavedUser = () => {
    try {
      const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? (getSavedUser() || null) : false;
  });

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setUser(false);
      return;
    }
    // バックグラウンドでトークン検証（失敗したらログアウト）
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((userData) => {
        if (!userData) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setUser(false);
        } else {
          setUser(userData);
        }
      })
      .catch(() => {
        // ネットワークエラーは無視（既にキャッシュされたユーザーで継続）
      });
  }, []);

  // Keep-alive ping: RailwayのDBをスリープさせない（10分ごと）
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => fetch('/health').catch(() => {}), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [!!user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(false);
  };

  if (user === null) return <FullScreenSpinner />;
  if (!user) return <LoginPage onLoginSuccess={setUser} />;
  return <PluginConnectPage onLogout={handleLogout} />;
}
