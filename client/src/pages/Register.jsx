import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserPlus, User, Wrench } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialty: ''
  });
  const [formError, setFormError] = useState('');
  const { register, error: authError, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name || !form.email || !form.phone || !form.password) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role
      };
      if (role === 'mechanic' && form.specialty) {
        payload.specialty = form.specialty;
      }

      const user = await register(payload);
      // Redirect based on role
      navigate(user.role === 'mechanic' ? '/mechanic' : '/');
    } catch (err) {
      // Error shown via authError from context
    }
  };

  return (
    <div>
      {/* Role Selector */}
      <div className="flex rounded-xl overflow-hidden border-2 border-slate-100 p-1 bg-slate-50 mb-8">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            role === 'customer'
              ? 'bg-white text-red-600 shadow-sm border border-slate-200/60'
              : 'bg-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          CUSTOMER
        </button>
        <button
          type="button"
          onClick={() => setRole('mechanic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            role === 'mechanic'
              ? 'bg-dark-900 text-white shadow-sm'
              : 'bg-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wrench className="w-4 h-4" />
          MECHANIC
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {(formError || authError) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold text-center border border-red-100 mb-4">
            {formError || authError}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700">Full Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder-slate-400 mt-1.5"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700">Email address</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder-slate-400 mt-1.5"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700">Phone Number</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder-slate-400 mt-1.5"
            placeholder="10-digit mobile number"
          />
        </div>

        {role === 'mechanic' && (
          <div>
            <label className="block text-sm font-bold text-slate-700">
              Specialty <span className="text-slate-400 font-medium">(optional)</span>
            </label>
            <input
              name="specialty"
              type="text"
              value={form.specialty}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder-slate-400 mt-1.5"
              placeholder="e.g. Engine Specialist"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder-slate-400 mt-1.5"
            placeholder="Min 6 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700">Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder-slate-400 mt-1.5"
            placeholder="Re-enter password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 mt-6 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2 active:scale-95 ${
            role === 'mechanic' 
              ? 'bg-dark-900 text-white shadow-dark-900/30 hover:shadow-dark-900/40 hover:bg-dark-800' 
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-600/30 hover:shadow-red-600/40'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Create Account
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-red-600 hover:text-red-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
