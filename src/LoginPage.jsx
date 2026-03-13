import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const API_BASE = '';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const validateLoginForm = () => {
    const errs = {};
    if (!form.email) errs.email = 'メールアドレスを入力してください';
    else if (!validateEmail(form.email)) errs.email = 'メールアドレスの形式が正しくありません';
    if (!form.password) errs.password = 'パスワードを入力してください';
    return errs;
  };

  const validateRegisterForm = () => {
    const errs = {};
    if (!form.email) errs.email = 'メールアドレスを入力してください';
    else if (!validateEmail(form.email)) errs.email = 'メールアドレスの形式が正しくありません';
    if (!form.password) errs.password = 'パスワードを入力してください';
    else if (form.password.length < 8) errs.password = 'パスワードは8文字以上で入力してください';
    if (!form.confirmPassword) errs.confirmPassword = 'パスワード（確認）を入力してください';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'パスワードが一致しません';
    return errs;
  };

  const storeToken = (token) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  };

  const storeUser = (user) => {
    const json = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem('user', json);
    } else {
      sessionStorage.setItem('user', json);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validateLoginForm();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.detail || 'ログインに失敗しました' });
        return;
      }
      storeToken(data.access_token);
      storeUser(data.user);
      onLoginSuccess(data.user);
    } catch {
      setErrors({ general: 'サーバーへの接続に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateRegisterForm();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.fullName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setErrors({ email: data.detail });
        else setErrors({ general: data.detail || '登録に失敗しました' });
        return;
      }
      // Auto-login after registration
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setView('login');
        setSuccessMessage('登録が完了しました。ログインしてください。');
        return;
      }
      storeToken(loginData.access_token);
      storeUser(loginData.user);
      onLoginSuccess(loginData.user);
    } catch {
      setErrors({ general: 'サーバーへの接続に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg border bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition focus:ring-2 focus:ring-[var(--ring)] ${
      errors[field] ? 'border-red-500 focus:ring-red-400' : 'border-[var(--border)]'
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e88e5]">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[var(--foreground)]">PersonaAI</h1>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">UXリサーチ AI プラットフォーム</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">

          {/* ===== LOGIN VIEW ===== */}
          {view === 'login' && (
            <>
              <h2 className="mb-5 text-base font-semibold text-[var(--foreground)]">ログイン</h2>

              {successMessage && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                  {successMessage}
                </div>
              )}
              {errors.general && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleLogin} noValidate className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                    メールアドレス
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                    パスワード
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={set('password')}
                      className={`${inputClass('password')} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-[var(--border)] accent-[#1e88e5]"
                    />
                    ログインしたままにする
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setErrors({}); }}
                    className="text-xs text-[#1e88e5] hover:underline"
                  >
                    パスワードをお忘れですか？
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e88e5] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1976d2] disabled:opacity-60"
                >
                  {isLoading ? <><Loader2 size={15} className="animate-spin" /> ログイン中…</> : 'ログイン'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-[var(--muted-foreground)]">
                アカウントをお持ちでない方は{' '}
                <button
                  type="button"
                  onClick={() => { setView('register'); setErrors({}); setSuccessMessage(''); }}
                  className="text-[#1e88e5] hover:underline"
                >
                  新規登録
                </button>
              </p>
            </>
          )}

          {/* ===== REGISTER VIEW ===== */}
          {view === 'register' && (
            <>
              <h2 className="mb-5 text-base font-semibold text-[var(--foreground)]">新規登録</h2>

              {errors.general && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleRegister} noValidate className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                    お名前 <span className="text-[var(--muted-foreground)]">（任意）</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="山田 太郎"
                    value={form.fullName}
                    onChange={set('fullName')}
                    className={inputClass('fullName')}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                    パスワード
                    <span className="ml-1 text-[var(--muted-foreground)]">（8文字以上）</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="new-password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={set('password')}
                      className={`${inputClass('password')} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                    パスワード（確認）
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm-password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                      className={`${inputClass('confirmPassword')} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e88e5] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1976d2] disabled:opacity-60"
                >
                  {isLoading ? <><Loader2 size={15} className="animate-spin" /> 登録中…</> : 'アカウントを作成'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-[var(--muted-foreground)]">
                既にアカウントをお持ちの方は{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); setErrors({}); }}
                  className="text-[#1e88e5] hover:underline"
                >
                  ログイン
                </button>
              </p>
            </>
          )}

          {/* ===== FORGOT PASSWORD VIEW ===== */}
          {view === 'forgot' && (
            <>
              <h2 className="mb-2 text-base font-semibold text-[var(--foreground)]">パスワードをお忘れの方</h2>
              <p className="mb-5 text-xs text-[var(--muted-foreground)]">
                登録されているメールアドレスを入力してください。
              </p>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                  メールアドレス
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  className={inputClass('email')}
                />
              </div>

              <div className="mb-5 rounded-lg bg-[var(--muted)] px-3 py-2.5 text-xs text-[var(--muted-foreground)]">
                パスワードリセット機能は現在準備中です。管理者にお問い合わせください。
              </div>

              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center rounded-lg bg-[#1e88e5] px-4 py-2.5 text-sm font-medium text-white opacity-40 cursor-not-allowed"
              >
                リセットメールを送信
              </button>

              <p className="mt-5 text-center text-xs text-[var(--muted-foreground)]">
                <button
                  type="button"
                  onClick={() => { setView('login'); setErrors({}); }}
                  className="text-[#1e88e5] hover:underline"
                >
                  ← ログインに戻る
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
