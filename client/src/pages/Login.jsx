import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, error: authError, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter email and password');
      return;
    }
    try {
      await login(email, password);
      // navigation handled by protected route
    } catch (err) {
      // Error handled by context
    }
  };

  const handleDemoLogin = (role) => {
    if (role === 'mechanic') {
      setEmail('mechanic@motofix.com');
      setPassword('password123');
    } else {
      setEmail('arun@example.com');
      setPassword('password123');
    }
  };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {(formError || authError) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
            {formError || authError}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-bold text-slate-700">Email address</label>
          <div className="mt-1.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder-slate-400"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700">Password</label>
          <div className="mt-1.5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder-slate-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2 active:scale-95"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
            Sign in
          </button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-400 font-medium tracking-wide text-[11px] uppercase">Quick Demo Accounts</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDemoLogin('customer')}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
          >
            Customer Demo
          </button>
          <button
            onClick={() => handleDemoLogin('mechanic')}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm bg-dark-900 text-xs font-bold text-white hover:bg-dark-800 transition-colors"
          >
            Mechanic Demo
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-600 font-medium">
        New to MotoFix?{' '}
        <Link to="/register" className="font-bold text-red-600 hover:text-red-700 transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  );
}
