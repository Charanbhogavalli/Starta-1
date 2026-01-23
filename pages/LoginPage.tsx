
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState<'founder' | 'funder' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleLogin = async (role: 'founder' | 'funder') => {
    setIsLoggingIn(role);
    await login(role);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white mx-auto mb-6 shadow-lg shadow-blue-500/20">S</div>
          <h1 className="text-3xl font-bold text-white mb-2">Starta Authentication</h1>
          <p className="text-slate-400">Choose your perspective to enter the ecosystem.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('founder')}
            disabled={!!isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {isLoggingIn === 'founder' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="text-xl">🚀</span>
                <span>Enter as Founder</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleLogin('funder')}
            disabled={!!isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-4 px-6 rounded-xl transition-all border border-slate-200 disabled:opacity-50"
          >
            {isLoggingIn === 'funder' ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="text-xl">💼</span>
                <span>Enter as Funder</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Sign in to test the complete flow from idea to investment.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
